import { NextResponse } from "next/server";
import { z } from "zod";
import { adminUnauthorized, checkAdminApi } from "@/lib/admin-api";
import { adminProductSchema } from "@/lib/admin-product-schema";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdminApi())) return adminUnauthorized();
  const { id } = await context.params;

  try {
    const body = adminProductSchema.parse(await request.json());
    if (body.type === "VARIABLE" && body.variants.length === 0) {
      return NextResponse.json(
        { error: "Add at least one variant for a variable product." },
        { status: 400 }
      );
    }

    const duplicate = await prisma.product.findFirst({
      where: { slug: body.slug, id: { not: id } },
      select: { id: true }
    });
    if (duplicate) {
      return NextResponse.json(
        { error: "Another product already uses this URL slug." },
        { status: 409 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          title: body.title,
          slug: body.slug,
          description: body.description,
          type: body.type,
          mainImage: body.mainImage,
          price: body.price,
          compareAtPrice: body.compareAtPrice,
          stock: body.type === "SINGLE" ? body.stock : 0,
          sku: body.sku,
          collectionId: body.collectionId,
          published: body.published,
          featured: body.featured,
          newArrival: body.newArrival,
          bestSelling: body.bestSelling
        }
      });

      await tx.productImage.deleteMany({ where: { productId: id } });
      if (body.gallery.length) {
        await tx.productImage.createMany({
          data: body.gallery.map((url, index) => ({
            productId: id,
            url,
            alt: body.title,
            displayOrder: index
          }))
        });
      }

      await tx.productVariant.deleteMany({ where: { productId: id } });
      if (body.type === "VARIABLE" && body.variants.length) {
        await tx.productVariant.createMany({
          data: body.variants.map((variant) => ({
            productId: id,
            ...variant
          }))
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Product data is invalid." },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Product could not be updated." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdminApi())) return adminUnauthorized();
  const { id } = await context.params;

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Product could not be deleted." },
      { status: 500 }
    );
  }
}
