import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { adminUnauthorized, checkAdminApi } from "@/lib/admin-api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await checkAdminApi())) return adminUnauthorized();

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "BLOB_READ_WRITE_TOKEN is not configured. Add Vercel Blob to the project or paste an image URL manually."
      },
      { status: 503 }
    );
  }

  const data = await request.formData();
  const file = data.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Choose an image file to upload." },
      { status: 400 }
    );
  }

  const allowed = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif"
  ]);
  if (!allowed.has(file.type)) {
    return NextResponse.json(
      { error: "Only JPG, PNG, WebP, and AVIF images are allowed." },
      { status: 400 }
    );
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Image must be smaller than 5 MB." },
      { status: 400 }
    );
  }

  try {
    const blob = await put(`mahi/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true
    });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Image upload failed." },
      { status: 500 }
    );
  }
}
