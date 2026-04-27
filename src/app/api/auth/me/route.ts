import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true });
}
