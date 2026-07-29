import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null });

  // Include latest order contact details to prefill checkout
  const lastOrder = await prisma.order.findFirst({
    where: { customerId: user.id },
    orderBy: { createdAt: "desc" },
    select: { name: true, email: true, phone: true, address: true, city: true }
  });

  return NextResponse.json({ user, lastOrder });
}

const updateSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  username: z.string().trim().min(3).max(30).optional(),
  email: z.string().trim().email().max(120).optional()
});

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = updateSchema.parse(await request.json());

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: body.name ?? undefined,
        username: body.username ? body.username.toLowerCase() : undefined,
        email: body.email ? body.email.toLowerCase() : undefined
      },
      select: { id: true, name: true, email: true, username: true, role: true }
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid profile data" }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Unable to update profile" }, { status: 500 });
  }
}
