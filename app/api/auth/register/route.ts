import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createSessionToken,
  setSessionCookie
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isStrongPassword, passwordRequirementsMessage } from "@/lib/password-policy";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  username: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/),
  email: z.string().trim().email().max(120),
  password: z.string().min(8).max(128)
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());

    if (!isStrongPassword(body.password)) {
      return NextResponse.json(
        { error: passwordRequirementsMessage },
        { status: 400 }
      );
    }

    const email = body.email.toLowerCase();
    const username = body.username.toLowerCase();

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      },
      select: { id: true, email: true, username: true }
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            existing.email === email
              ? "An account already exists with this email."
              : "This username is already taken."
        },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name: body.name,
        username,
        email,
        passwordHash: await bcrypt.hash(body.password, 12)
      }
    });

    const token = await createSessionToken({
      userId: user.id,
      role: user.role
    });
    await setSessionCookie(token);

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: passwordRequirementsMessage
        },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Account registration is temporarily unavailable." },
      { status: 500 }
    );
  }
}
