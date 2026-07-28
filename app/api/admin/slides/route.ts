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

export async function POST(request: Request) {
  if (!(await checkAdminApi())) return adminUnauthorized();
  if ((await prisma.heroSlide.count()) >= 5) {
    return NextResponse.json(
      { error: "A maximum of five hero slides is allowed." },
      { status: 409 }
    );
  }
  try {
    const body = schema.parse(await request.json());
    const slide = await prisma.heroSlide.create({ data: body });
    return NextResponse.json({ id: slide.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid slide data." },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Slide could not be created." },
      { status: 500 }
    );
  }
}
