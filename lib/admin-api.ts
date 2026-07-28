import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function checkAdminApi() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export function adminUnauthorized() {
  return NextResponse.json(
    { error: "Admin authentication is required." },
    { status: 401 }
  );
}
