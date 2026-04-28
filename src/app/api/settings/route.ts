import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { saveFile, deleteFile } from "@/lib/upload";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  const db = getDb();

  if (key) {
    const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as
      | { value: string }
      | undefined;
    return NextResponse.json({ value: row?.value ?? null });
  }

  const rows = db.prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
  const settings: Record<string, string> = {};
  for (const row of rows) settings[row.key] = row.value;
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { key, value } = await request.json();
  if (!key) {
    return NextResponse.json({ error: "缺少 key" }, { status: 400 });
  }

  const db = getDb();
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?")
    .run(key, value, value);

  return NextResponse.json({ success: true });
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const key = formData.get("key") as string;

  if (!file || !key) {
    return NextResponse.json({ error: "缺少文件或 key" }, { status: 400 });
  }

  const db = getDb();
  const old = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as
    | { value: string }
    | undefined;
  if (old?.value) {
    deleteFile(old.value);
  }

  const isImage = file.type.startsWith("image/");
  const url = await saveFile(file, isImage ? "photos" : "video");
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?")
    .run(key, url, url);

  return NextResponse.json({ url });
}
