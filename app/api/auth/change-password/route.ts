import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128)
});

export async function PUT(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
    if (!dbUser || !(await bcrypt.compare(body.currentPassword, dbUser.passwordHash))) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 403 });
    }

    const hashed = await bcrypt.hash(body.newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hashed } });

    return NextResponse.json({ message: "Password updated" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid password" }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Unable to change password" }, { status: 500 });
  }
}
