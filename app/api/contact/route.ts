import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().max(30).optional(),
  subject: z.string().trim().max(150).optional(),
  message: z.string().trim().min(10).max(2000)
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    await prisma.contactMessage.create({
      data: {
        name: body.name,
        email: body.email.toLowerCase(),
        phone: body.phone || null,
        subject: body.subject || null,
        message: body.message
      }
    });

    return NextResponse.json(
      { message: "Your message has been received." },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Please complete all required contact fields." },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Message could not be sent." },
      { status: 500 }
    );
  }
}
