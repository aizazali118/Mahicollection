import { NextResponse } from "next/server";
import { z } from "zod";
import { adminUnauthorized, checkAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(500).nullable(),
  image: z.string().trim().min(1).max(2000),
  featured: z.boolean(),
  displayOrder: z.number().int()
});

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdminApi())) return adminUnauthorized();
  const { id } = await context.params;

  try {
    const body = schema.parse(await request.json());
    const duplicate = await prisma.collection.findFirst({
      where: { slug: body.slug, id: { not: id } }
    });
    if (duplicate) {
      return NextResponse.json(
        { error: "A collection already uses this URL slug." },
        { status: 409 }
      );
    }
    await prisma.collection.update({ where: { id }, data: body });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid collection data." },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Collection could not be updated." },
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
  const productCount = await prisma.product.count({ where: { collectionId: id } });
  if (productCount > 0) {
    return NextResponse.json(
      { error: "Move or delete the collection’s products first." },
      { status: 409 }
    );
  }
  await prisma.collection.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
