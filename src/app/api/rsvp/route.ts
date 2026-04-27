import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getClientIp, geolocateIp } from "@/lib/geo";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const db = getDb();
  const list = db.prepare("SELECT * FROM rsvp ORDER BY created_at DESC").all();
  return NextResponse.json(list);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, phone, attending, guests } = body;

  if (!name || !attending) {
    return NextResponse.json({ error: "姓名和出席状态必填" }, { status: 400 });
  }

  if (!["yes", "no"].includes(attending)) {
    return NextResponse.json({ error: "无效的出席状态" }, { status: 400 });
  }

  const db = getDb();
  db.prepare("INSERT INTO rsvp (name, phone, attending, guests) VALUES (?, ?, ?, ?)")
    .run(name, phone || "", attending, guests || 1);

  if (attending === "yes") {
    const ip = getClientIp(request);
    if (ip) {
      geolocateIp(ip).then((geo) => {
        if (!geo) return;
        db.prepare(
          `INSERT INTO map_locations (type, city, province, lat, lng)
           VALUES ('rsvp', ?, ?, ?, ?)
           ON CONFLICT(type, city) DO UPDATE SET
             count = count + 1,
             last_seen = CURRENT_TIMESTAMP`
        ).run(geo.city, geo.province, geo.lat, geo.lng);
      }).catch(() => {});
    }
  }

  return NextResponse.json({ success: true });
}
