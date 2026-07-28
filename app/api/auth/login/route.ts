import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createSessionToken,
  setSessionCookie
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  identifier: z.string().trim().min(1),
  password: z.string().min(1),
  adminOnly: z.boolean().optional().default(false)
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: body.identifier, mode: "insensitive" } },
          { username: { equals: body.identifier, mode: "insensitive" } }
        ]
      }
    });

    if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
      return NextResponse.json(
        { error: "Email/username or password is incorrect." },
        { status: 401 }
      );
    }

    if (body.adminOnly && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "This account does not have admin access." },
        { status: 403 }
      );
    }

    const token = await createSessionToken({
      userId: user.id,
      role: user.role
    });
    await setSessionCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Please enter your login details." },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Login is temporarily unavailable." },
      { status: 500 }
    );
  }
}
