import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getClientIp, geolocateIp } from "@/lib/geo";
import { rateLimit } from "@/lib/rate-limit";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const db = getDb();
  const list = db.prepare("SELECT * FROM rsvp ORDER BY created_at DESC").all();
  return NextResponse.json(list);
}

export async function DELETE(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "缺少 id" }, { status: 400 });
  }

  const db = getDb();
  db.prepare("DELETE FROM rsvp WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(ip, 60_000, 3)) {
    return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });
  }

  const body = await request.json();
  const { name, phone, guests } = body;

  if (!name) {
    return NextResponse.json({ error: "姓名必填" }, { status: 400 });
  }

  const db = getDb();
  db.prepare("INSERT INTO rsvp (name, phone, attending, guests) VALUES (?, ?, 'yes', ?)")
    .run(name, phone || "", guests || 1);

  {
    const ip = getClientIp(request);
    if (ip) {
      try {
        const geo = await geolocateIp(ip);
        if (geo) {
          db.prepare(
            `INSERT INTO map_locations (type, city, province, lat, lng)
             VALUES ('rsvp', ?, ?, ?, ?)
             ON CONFLICT(type, city) DO UPDATE SET
               count = count + 1,
               last_seen = CURRENT_TIMESTAMP`
          ).run(geo.city, geo.province, geo.lat, geo.lng);
        }
      } catch {}
    }
  }

  return NextResponse.json({ success: true });
}
