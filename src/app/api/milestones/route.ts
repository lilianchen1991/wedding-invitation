import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { saveFile, deleteFile } from "@/lib/upload";

export const dynamic = "force-dynamic";

function normalizeLink(link: string | null | undefined): string | null {
  if (!link?.trim()) return null;
  const trimmed = link.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export async function GET() {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM milestones ORDER BY sort_order ASC, id ASC").all();
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const contentType = request.headers.get("content-type") || "";
  let date: string, title: string, content: string, link: string | null = null, photo: string | null = null;

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    date = (form.get("date") as string) || "";
    title = (form.get("title") as string) || "";
    content = (form.get("content") as string) || "";
    link = (form.get("link") as string) || null;
    const file = form.get("photo") as File | null;
    if (file && file.size > 0) {
      photo = await saveFile(file, "milestones");
    }
  } else {
    const body = await request.json();
    date = body.date || "";
    title = body.title || "";
    content = body.content || "";
    link = body.link || null;
  }

  if (!date.trim() || !title.trim() || !content.trim()) {
    return NextResponse.json({ error: "日期、标题、内容必填" }, { status: 400 });
  }

  const db = getDb();
  const maxOrder = db.prepare("SELECT MAX(sort_order) as m FROM milestones").get() as { m: number | null };
  const sortOrder = (maxOrder?.m ?? -1) + 1;

  const result = db.prepare(
    "INSERT INTO milestones (date, title, content, link, photo, sort_order) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(date.trim(), title.trim(), content.trim(), normalizeLink(link), photo, sortOrder);

  return NextResponse.json({ id: result.lastInsertRowid, sort_order: sortOrder, photo });
}

export async function PUT(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const contentType = request.headers.get("content-type") || "";
  let id: number | undefined;
  let date: string | undefined, title: string | undefined, content: string | undefined;
  let link: string | undefined, photo: string | undefined, sort_order: number | undefined;
  let removePhoto = false;
  let newPhotoFile: File | null = null;

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    id = Number(form.get("id"));
    const d = form.get("date") as string | null;
    const t = form.get("title") as string | null;
    const c = form.get("content") as string | null;
    const l = form.get("link") as string | null;
    const so = form.get("sort_order") as string | null;
    if (d !== null) date = d;
    if (t !== null) title = t;
    if (c !== null) content = c;
    if (l !== null) link = l;
    if (so !== null) sort_order = Number(so);
    removePhoto = form.get("remove_photo") === "1";
    const file = form.get("photo") as File | null;
    if (file && file.size > 0) newPhotoFile = file;
  } else {
    const body = await request.json();
    id = body.id;
    date = body.date;
    title = body.title;
    content = body.content;
    link = body.link;
    sort_order = body.sort_order;
  }

  if (!id) {
    return NextResponse.json({ error: "缺少 id" }, { status: 400 });
  }

  const db = getDb();
  const fields: string[] = [];
  const values: unknown[] = [];

  if (date !== undefined) { fields.push("date = ?"); values.push(date.trim()); }
  if (title !== undefined) { fields.push("title = ?"); values.push(title.trim()); }
  if (content !== undefined) { fields.push("content = ?"); values.push(content.trim()); }
  if (link !== undefined) { fields.push("link = ?"); values.push(normalizeLink(link)); }
  if (sort_order !== undefined) { fields.push("sort_order = ?"); values.push(sort_order); }

  if (newPhotoFile) {
    const existing = db.prepare("SELECT photo FROM milestones WHERE id = ?").get(id) as { photo: string | null } | undefined;
    if (existing?.photo) deleteFile(existing.photo);
    const url = await saveFile(newPhotoFile, "milestones");
    fields.push("photo = ?");
    values.push(url);
  } else if (removePhoto) {
    const existing = db.prepare("SELECT photo FROM milestones WHERE id = ?").get(id) as { photo: string | null } | undefined;
    if (existing?.photo) deleteFile(existing.photo);
    fields.push("photo = ?");
    values.push(null);
  }

  if (fields.length === 0) {
    return NextResponse.json({ error: "没有要更新的字段" }, { status: 400 });
  }

  values.push(id);
  db.prepare(`UPDATE milestones SET ${fields.join(", ")} WHERE id = ?`).run(...values);

  const updated = db.prepare("SELECT * FROM milestones WHERE id = ?").get(id);
  return NextResponse.json(updated || { success: true });
}

export async function DELETE(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "缺少 id" }, { status: 400 });
  }

  const db = getDb();
  const existing = db.prepare("SELECT photo FROM milestones WHERE id = ?").get(id) as { photo: string | null } | undefined;
  if (existing?.photo) deleteFile(existing.photo);

  db.prepare("DELETE FROM milestones WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}
