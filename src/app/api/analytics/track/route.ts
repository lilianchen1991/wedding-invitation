import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getClientIp, geolocateIp } from "@/lib/geo";

export async function POST(request: NextRequest) {
  let body: { session_id?: string; page_path?: string; referrer?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const { session_id, page_path, referrer } = body;
  if (!session_id) {
    return NextResponse.json({ error: "missing session_id" }, { status: 400 });
  }

  const db = getDb();

  const recent = db
    .prepare(
      "SELECT id FROM page_views WHERE session_id = ? AND entered_at > datetime('now', '-5 seconds')"
    )
    .get(session_id) as { id: number } | undefined;
  if (recent) {
    return NextResponse.json({ id: recent.id });
  }

  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || "";

  let city: string | null = null;
  let province: string | null = null;
  if (ip) {
    const geo = await geolocateIp(ip);
    if (geo) {
      city = geo.city;
      province = geo.province;
    }
  }

  const result = db
    .prepare(
      `INSERT INTO page_views (session_id, ip, city, province, user_agent, referrer, page_path)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(session_id, ip, city, province, userAgent, referrer || "", page_path || "/");

  return NextResponse.json({ id: result.lastInsertRowid });
}
