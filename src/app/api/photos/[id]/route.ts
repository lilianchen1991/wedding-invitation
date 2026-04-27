import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { deleteFile } from "@/lib/upload";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json();
  const db = getDb();

  const sets: string[] = [];
  const values: unknown[] = [];

  if (body.alt !== undefined) {
    sets.push("alt = ?");
    values.push(body.alt);
  }
  if (body.sort_order !== undefined) {
    sets.push("sort_order = ?");
    values.push(body.sort_order);
  }

  if (sets.length === 0) {
    return NextResponse.json({ error: "无更新字段" }, { status: 400 });
  }

  values.push(id);
  db.prepare(`UPDATE photos SET ${sets.join(", ")} WHERE id = ?`).run(...values);

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const db = getDb();
  const photo = db.prepare("SELECT url, thumbnail FROM photos WHERE id = ?").get(id) as
    | { url: string; thumbnail: string | null }
    | undefined;

  if (!photo) {
    return NextResponse.json({ error: "照片不存在" }, { status: 404 });
  }

  deleteFile(photo.url);
  if (photo.thumbnail) deleteFile(photo.thumbnail);
  db.prepare("DELETE FROM photos WHERE id = ?").run(id);

  return NextResponse.json({ success: true });
}
