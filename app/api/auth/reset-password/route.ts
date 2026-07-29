import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isStrongPassword, passwordRequirementsMessage } from "@/lib/password-policy";
import { sendPasswordResetEmail } from "@/lib/email";

const requestSchema = z.object({
  email: z.string().trim().email().max(160)
});

const resetSchema = z.object({
  token: z.string().trim().min(10),
  password: z.string().min(8).max(128)
});

function buildToken() {
  return randomBytes(32).toString("hex");
}

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const email = body.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({
        message: "If an account exists for this email, a reset link has been sent."
      });
    }

    const token = buildToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetExpiresAt: expiresAt
      }
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/reset-password?token=${token}`;

    await sendPasswordResetEmail(email, resetUrl);

    return NextResponse.json({
      message: "If an account exists for this email, a reset link has been sent."
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    console.error(error);
    return NextResponse.json({ error: "Password reset is temporarily unavailable." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = resetSchema.parse(await request.json());

    if (!isStrongPassword(body.password)) {
      return NextResponse.json({ error: passwordRequirementsMessage }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: body.token,
        passwordResetExpiresAt: { gt: new Date() }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await (await import("bcryptjs")).default.hash(body.password, 12),
        passwordResetToken: null,
        passwordResetExpiresAt: null
      }
    });

    return NextResponse.json({ message: "Password updated successfully." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: passwordRequirementsMessage }, { status: 400 });
    }

    console.error(error);
    return NextResponse.json({ error: "Password reset is temporarily unavailable." }, { status: 500 });
  }
}
