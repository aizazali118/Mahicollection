import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateCouponDiscount } from "@/lib/coupon";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  code: z.string().trim().min(1).max(40),
  subtotal: z.number().nonnegative()
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const coupon = await prisma.coupon.findUnique({
      where: { code: body.code.toUpperCase() }
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Coupon code was not found." },
        { status: 404 }
      );
    }

    const result = calculateCouponDiscount(coupon, body.subtotal);
    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      discount: result.discount,
      message: `${coupon.code} applied successfully.`
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Enter a valid coupon code." },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Coupon could not be checked." },
      { status: 500 }
    );
  }
}
