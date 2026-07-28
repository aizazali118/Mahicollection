import { NextResponse } from "next/server";
import { z } from "zod";
import { adminUnauthorized, checkAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  code: z.string().trim().min(2).max(40).regex(/^[A-Z0-9_-]+$/),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().positive(),
  minOrder: z.number().nonnegative().nullable(),
  maxDiscount: z.number().nonnegative().nullable(),
  startsAt: z.string().datetime().nullable(),
  endsAt: z.string().datetime().nullable(),
  active: z.boolean(),
  usageLimit: z.number().int().positive().nullable()
});

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdminApi())) return adminUnauthorized();
  const { id } = await context.params;
  try {
    const body = schema.parse(await request.json());
    if (body.type === "PERCENT" && body.value > 100) {
      return NextResponse.json(
        { error: "Percentage discount cannot exceed 100%." },
        { status: 400 }
      );
    }
    await prisma.coupon.update({
      where: { id },
      data: {
        ...body,
        startsAt: body.startsAt ? new Date(body.startsAt) : null,
        endsAt: body.endsAt ? new Date(body.endsAt) : null,
        maxDiscount: body.type === "PERCENT" ? body.maxDiscount : null
      }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid coupon data." },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Coupon could not be updated." },
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
  await prisma.coupon.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
