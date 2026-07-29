import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { adminUnauthorized, checkAdminApi } from "@/lib/admin-api";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await checkAdminApi())) return adminUnauthorized();

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    // Fallback: save uploaded file to `public/uploads` for local development.
    // This avoids requiring Vercel Blob during local testing.
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
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`mahi/${file.name}`, file, {
        access: "public",
        addRandomSuffix: true
      });
      return NextResponse.json({ url: blob.url });
    }

    // Local fallback: write to public/uploads with a random suffix
    const uploadsDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const random = Math.random().toString(36).slice(2, 8);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${Date.now()}-${random}-${safeName}`;
    const outPath = join(uploadsDir, filename);
    const buf = Buffer.from(await file.arrayBuffer());
    await writeFile(outPath, buf);
    const url = `/uploads/${filename}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Image upload failed." },
      { status: 500 }
    );
  }
}
