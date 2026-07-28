import { NextResponse } from "next/server";
import { z } from "zod";
import { adminUnauthorized, checkAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  announcement: z.string().trim().min(3).max(300),
  contactPhone: z.string().trim().min(5).max(50),
  contactEmail: z.string().trim().email().max(160),
  address: z.string().trim().min(2).max(300),
  facebook: z.string().trim().min(1).max(1000),
  instagram: z.string().trim().min(1).max(1000),
  tiktok: z.string().trim().min(1).max(1000),
  whatsappNumber: z.string().trim().min(7).max(30),
  currency: z.enum(["PKR", "USD"]),
  shippingFlatRate: z.number().nonnegative(),
  freeShippingThreshold: z.number().nonnegative(),
  about: z.string().trim().min(10).max(1000)
});

export async function PUT(request: Request) {
  if (!(await checkAdminApi())) return adminUnauthorized();
  try {
    const body = schema.parse(await request.json());
    await prisma.storeSetting.upsert({
      where: { id: "main" },
      create: { id: "main", ...body },
      update: body
    });
    return NextResponse.json({ message: "Store settings updated." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid store settings." },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Store settings could not be updated." },
      { status: 500 }
    );
  }
}
