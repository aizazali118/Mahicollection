import { NextResponse } from "next/server";
import { z } from "zod";
import { adminUnauthorized, checkAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdminApi())) return adminUnauthorized();
  const { id } = await context.params;
  const body = z.object({ approved: z.boolean() }).parse(await request.json());
  await prisma.review.update({
    where: { id },
    data: { approved: body.approved }
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdminApi())) return adminUnauthorized();
  const { id } = await context.params;
  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
