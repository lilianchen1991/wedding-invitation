import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { savePhoto } from "@/lib/upload";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category");
  const db = getDb();

  if (category) {
    const photos = db
      .prepare("SELECT * FROM photos WHERE category = ? ORDER BY sort_order ASC, id DESC")
      .all(category);
    return NextResponse.json(photos);
  }

  const photos = db
    .prepare("SELECT * FROM photos ORDER BY category, sort_order ASC, id DESC")
    .all();
  return NextResponse.json(photos);
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const category = formData.get("category") as string;
  const alt = (formData.get("alt") as string) || "";

  if (!file || !category) {
    return NextResponse.json({ error: "缺少文件或分类" }, { status: 400 });
  }

  if (!["gallery", "wedding"].includes(category)) {
    return NextResponse.json({ error: "无效分类" }, { status: 400 });
  }

  const { url, thumbnail } = await savePhoto(file);
  const db = getDb();
  const maxOrder = db
    .prepare("SELECT COALESCE(MAX(sort_order), 0) as max FROM photos WHERE category = ?")
    .get(category) as { max: number };

  const result = db
    .prepare("INSERT INTO photos (url, thumbnail, alt, category, sort_order) VALUES (?, ?, ?, ?, ?)")
    .run(url, thumbnail, alt, category, maxOrder.max + 1);

  return NextResponse.json({ id: result.lastInsertRowid, url, thumbnail });
}
