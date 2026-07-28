import { NextResponse } from "next/server";
import { z } from "zod";
import { adminUnauthorized, checkAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED"
  ])
});

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdminApi())) return adminUnauthorized();
  const { id } = await context.params;
  try {
    const body = schema.parse(await request.json());
    await prisma.order.update({
      where: { id },
      data: { status: body.status }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Choose a valid order status." },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Order status could not be updated." },
      { status: 500 }
    );
  }
}
