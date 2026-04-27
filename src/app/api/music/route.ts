import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin, isAdmin } from "@/lib/auth";
import { saveFile } from "@/lib/upload";

export async function GET(request: NextRequest) {
  const db = getDb();
  const all = request.nextUrl.searchParams.get("all");

  if (all === "1" && (await isAdmin())) {
    const list = db.prepare("SELECT * FROM music ORDER BY created_at DESC").all();
    return NextResponse.json(list);
  }

  const music = db.prepare("SELECT * FROM music WHERE active = 1 LIMIT 1").get();
  if (!music) {
    return NextResponse.json(null);
  }
  return NextResponse.json(music);
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const title = (formData.get("title") as string) || "";

  if (!file) {
    return NextResponse.json({ error: "缺少音乐文件" }, { status: 400 });
  }

  const url = await saveFile(file, "music");
  const db = getDb();
  const result = db
    .prepare("INSERT INTO music (url, title, active) VALUES (?, ?, 0)")
    .run(url, title);

  return NextResponse.json({ id: result.lastInsertRowid, url, title });
}
