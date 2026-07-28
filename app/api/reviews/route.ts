import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(10).max(1000)
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Please log in before writing a review." },
      { status: 401 }
    );
  }

  try {
    const body = schema.parse(await request.json());
    const product = await prisma.product.findUnique({
      where: { id: body.productId },
      select: { id: true }
    });
    if (!product) {
      return NextResponse.json(
        { error: "Product was not found." },
        { status: 404 }
      );
    }

    await prisma.review.upsert({
      where: {
        productId_userId: {
          productId: body.productId,
          userId: user.id
        }
      },
      create: {
        productId: body.productId,
        userId: user.id,
        rating: body.rating,
        comment: body.comment,
        approved: false
      },
      update: {
        rating: body.rating,
        comment: body.comment,
        approved: false
      }
    });

    return NextResponse.json({
      message: "Thank you. Your review is waiting for admin approval."
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Write at least 10 characters and select a rating." },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Review could not be submitted." },
      { status: 500 }
    );
  }
}
