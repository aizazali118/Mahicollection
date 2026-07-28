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

export async function POST(request: Request) {
  if (!(await checkAdminApi())) return adminUnauthorized();

  try {
    const body = schema.parse(await request.json());
    const duplicate = await prisma.collection.findUnique({
      where: { slug: body.slug }
    });
    if (duplicate) {
      return NextResponse.json(
        { error: "A collection already uses this URL slug." },
        { status: 409 }
      );
    }
    const collection = await prisma.collection.create({ data: body });
    return NextResponse.json({ id: collection.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid collection data." },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Collection could not be created." },
      { status: 500 }
    );
  }
}
