import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  let body: { session_id?: string; duration?: number };
  try {
    const text = await request.text();
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const { session_id, duration } = body;
  if (!session_id || typeof duration !== "number") {
    return NextResponse.json({ error: "invalid params" }, { status: 400 });
  }

  const cappedDuration = Math.min(Math.max(0, Math.round(duration)), 3600);
  const db = getDb();
  db.prepare(
    `UPDATE page_views SET duration = ?
     WHERE id = (SELECT MAX(id) FROM page_views WHERE session_id = ?)`
  ).run(cappedDuration, session_id);

  return NextResponse.json({ ok: true });
}
