import bcrypt from "bcryptjs";
import { randomBytes, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionPayload } from "@/lib/auth";
import { calculateCouponDiscount } from "@/lib/coupon";
import { prisma } from "@/lib/prisma";
import { isStrongPassword, passwordRequirementsMessage } from "@/lib/password-policy";
import { getStoreSettings } from "@/lib/store";

export const maxDuration = 30;

const schema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().email().max(160).optional(),
  phone: z.string().trim().min(7).max(30).optional(),
  address: z.string().trim().min(8).max(500).optional(),
  city: z.string().trim().min(2).max(100).optional(),
  note: z.string().trim().max(1000).optional().default(""),
  couponCode: z.string().trim().max(40).optional(),
  createAccount: z.boolean().optional().default(false),
  password: z.string().trim().max(128).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().min(1).optional(),
        quantity: z.number().int().min(1).max(20)
      })
    )
    .min(1)
    .max(50)
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    // If user is logged in, fill missing contact fields from their profile or last order
    const session = await getSessionPayload();
    if (session?.userId) {
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { name: true, email: true }
      });
      const lastOrder = await prisma.order.findFirst({
        where: { customerId: session.userId },
        orderBy: { createdAt: "desc" },
        select: { name: true, email: true, phone: true, address: true, city: true }
      });

      // fill from lastOrder -> user -> existing body
      body.name = body.name || lastOrder?.name || user?.name || body.name;
      body.email = body.email || lastOrder?.email || user?.email || body.email;
      body.phone = body.phone || lastOrder?.phone || body.phone;
      body.address = body.address || lastOrder?.address || body.address;
      body.city = body.city || lastOrder?.city || body.city;
    }

    // After attempting to fill, ensure required fields exist
    if (!body.name || !body.email || !body.phone || !body.address || !body.items || !body.items.length) {
      throw new z.ZodError([]);
    }
    if (body.createAccount && !body.password) {
      return NextResponse.json(
        { error: "Please set a password to create an account." },
        { status: 400 }
      );
    }
    if (body.createAccount && body.password && !isStrongPassword(body.password)) {
      return NextResponse.json({ error: passwordRequirementsMessage }, { status: 400 });
    }

    const productIds = Array.from(
      new Set(body.items.map((item) => item.productId))
    );
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        published: true
      },
      include: { variants: true }
    });

    const productMap = new Map(products.map((product) => [product.id, product]));
    const preparedItems: Array<{
      productId: string;
      variantId?: string;
      title: string;
      variantLabel?: string;
      image: string;
      price: number;
      quantity: number;
    }> = [];

    for (const requested of body.items) {
      const product = productMap.get(requested.productId);
      if (!product) {
        return NextResponse.json(
          { error: "One of the selected products is no longer available." },
          { status: 400 }
        );
      }

      if (product.type === "VARIABLE") {
        const variant = product.variants.find(
          (item) => item.id === requested.variantId
        );
        if (!variant || variant.stock < requested.quantity) {
          return NextResponse.json(
            {
              error: `${product.title}: the selected colour or size is unavailable in the requested quantity.`
            },
            { status: 400 }
          );
        }

        preparedItems.push({
          productId: product.id,
          variantId: variant.id,
          title: product.title,
          variantLabel: [variant.colorName, variant.size]
            .filter(Boolean)
            .join(" / "),
          image: variant.image || product.mainImage,
          price: Number(variant.price || product.price),
          quantity: requested.quantity
        });
      } else {
        if (product.stock < requested.quantity) {
          return NextResponse.json(
            {
              error: `${product.title}: only ${product.stock} item(s) remain in stock.`
            },
            { status: 400 }
          );
        }

        preparedItems.push({
          productId: product.id,
          title: product.title,
          image: product.mainImage,
          price: Number(product.price),
          quantity: requested.quantity
        });
      }
    }

    const subtotal = preparedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    let coupon = null;
    let discount = 0;
    if (body.couponCode) {
      coupon = await prisma.coupon.findUnique({
        where: { code: body.couponCode.toUpperCase() }
      });
      if (!coupon) {
        return NextResponse.json(
          { error: "The coupon code is not valid." },
          { status: 400 }
        );
      }
      const couponResult = calculateCouponDiscount(coupon, subtotal);
      if (!couponResult.valid) {
        return NextResponse.json(
          { error: couponResult.error },
          { status: 400 }
        );
      }
      discount = couponResult.discount;
    }

    const settings = await getStoreSettings();
    const shipping =
      subtotal >= Number(settings.freeShippingThreshold)
        ? 0
        : Number(settings.shippingFlatRate);
    const total = Math.max(0, subtotal - discount + shipping);
    // session already retrieved above
    const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const orderNumber = `MC-${datePart}-${randomUUID().slice(0, 6).toUpperCase()}`;

    const order = await prisma.$transaction(async (tx) => {
      let user = null;
      if (body.createAccount) {
        const email = body.email!.toLowerCase();
        const username = email.split("@")[0].replace(/[^a-z0-9_-]+/g, "").slice(0, 24) || `customer${randomBytes(4).toString("hex")}`;
        const existingUser = await tx.user.findFirst({
          where: { OR: [{ email }, { username }] },
          select: { id: true }
        });

        if (!existingUser && body.password) {
          user = await tx.user.create({
            data: {
              name: body.name!,
              username,
              email,
              passwordHash: await bcrypt.hash(body.password!, 12)
            }
          });
        }
      }
      for (const item of preparedItems) {
        if (item.variantId) {
          const updated = await tx.productVariant.updateMany({
            where: {
              id: item.variantId,
              stock: { gte: item.quantity }
            },
            data: { stock: { decrement: item.quantity } }
          });
          if (updated.count !== 1) {
            throw new Error(`${item.title} stock changed during checkout.`);
          }
        } else {
          const updated = await tx.product.updateMany({
            where: {
              id: item.productId,
              stock: { gte: item.quantity }
            },
            data: { stock: { decrement: item.quantity } }
          });
          if (updated.count !== 1) {
            throw new Error(`${item.title} stock changed during checkout.`);
          }
        }
      }

      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } }
        });
      }

      return tx.order.create({
        data: {
          orderNumber,
          customerId: user?.id || session?.userId,
            name: body.name!,
            email: body.email!.toLowerCase(),
            phone: body.phone!,
            address: body.address!,
            city: body.city!,
          note: body.note || null,
          subtotal,
          discount,
          shipping,
          total,
          couponCode: coupon?.code,
          items: {
            create: preparedItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              title: item.title,
              variantLabel: item.variantLabel,
              image: item.image,
              price: item.price,
              quantity: item.quantity
            }))
          }
        }
      });
    });

    const whatsappNumber = (
      settings.whatsappNumber || process.env.WHATSAPP_ORDER_NUMBER || "+923359574017"
    ).replace(/\D/g, "");
    const money = (value: number) =>
      new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: settings.currency || "PKR",
        maximumFractionDigits: 0
      }).format(value);
    const whatsappMessage = [
      "Assalam-o-Alaikum Mahi Collection,",
      "",
      `I have placed order ${order.orderNumber}.`,
      `Name: ${body.name}`,
      `Phone: ${body.phone}`,
      `Email: ${body.email.toLowerCase()}`,
      `City: ${body.city}`,
      `Address: ${body.address}`,
      "",
      "Items:",
      ...preparedItems.map(
        (item) =>
          `- ${item.title}${item.variantLabel ? ` (${item.variantLabel})` : ""} x ${item.quantity} - ${money(item.price * item.quantity)}`
      ),
      "",
      `Subtotal: ${money(subtotal)}`,
      `Discount: ${money(discount)}`,
      `Delivery: ${shipping ? money(shipping) : "Free"}`,
      `Total: ${money(total)}`,
      body.note ? `Note: ${body.note}` : ""
    ]
      .filter(Boolean)
      .join("\n");
    const resetToken = body.createAccount && body.password
      ? randomBytes(32).toString("hex")
      : null;

    if (body.createAccount && resetToken) {
      await prisma.user.updateMany({
        where: { email: body.email.toLowerCase() },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpiresAt: new Date(Date.now() + 1000 * 60 * 60)
        }
      });
    }

    const whatsappUrl = whatsappNumber
      ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
      : null;

    return NextResponse.json(
      {
        orderNumber: order.orderNumber,
        total: Number(order.total),
        whatsappUrl,
        accountCreated: Boolean(resetToken),
        resetSent: Boolean(resetToken),
        message: resetToken
          ? "Account created. A password reset link has been sent to your email so you can set your password."
          : undefined
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error:
            "Please complete your name, email, phone, city, address, and order items."
        },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message.includes("stock changed")
            ? "Stock changed while you were checking out. Please review your bag and try again."
            : "The order could not be placed. Please try again."
      },
      { status: 500 }
    );
  }
}
