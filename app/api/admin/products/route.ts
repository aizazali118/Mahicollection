import { NextResponse } from "next/server";
import { z } from "zod";
import { adminUnauthorized, checkAdminApi } from "@/lib/admin-api";
import { adminProductSchema } from "@/lib/admin-product-schema";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  if (!(await checkAdminApi())) return adminUnauthorized();

  try {
    const body = adminProductSchema.parse(await request.json());
    if (body.type === "VARIABLE" && body.variants.length === 0) {
      return NextResponse.json(
        { error: "Add at least one variant for a variable product." },
        { status: 400 }
      );
    }

    const existing = await prisma.product.findUnique({
      where: { slug: body.slug },
      select: { id: true }
    });
    if (existing) {
      return NextResponse.json(
        { error: "Another product already uses this URL slug." },
        { status: 409 }
      );
    }

    const product = await prisma.product.create({
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
        bestSelling: body.bestSelling,
        images: {
          create: body.gallery.map((url, index) => ({
            url,
            alt: body.title,
            displayOrder: index
          }))
        },
        variants:
          body.type === "VARIABLE"
            ? {
                create: body.variants.map((variant) => ({
                  ...variant
                }))
              }
            : undefined
      }
    });

    return NextResponse.json({ id: product.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Product data is invalid." },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Product could not be created." },
      { status: 500 }
    );
  }
}
