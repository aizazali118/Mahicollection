import { NextResponse } from "next/server";
import { z } from "zod";
import { adminUnauthorized, checkAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  title: z.string().trim().min(2).max(160),
  subtitle: z.string().trim().min(5).max(500),
  image: z.string().trim().min(1).max(2000),
  buttonText: z.string().trim().min(1).max(80),
  buttonLink: z.string().trim().min(1).max(500),
  active: z.boolean(),
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
    await prisma.heroSlide.update({ where: { id }, data: body });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid slide data." },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Slide could not be updated." },
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
  await prisma.heroSlide.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
