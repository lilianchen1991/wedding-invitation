import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { getClientIp, geolocateIp } from "@/lib/geo";

export async function GET(request: NextRequest) {
  const db = getDb();
  const all = request.nextUrl.searchParams.get("all");

  if (all === "1" && (await isAdmin())) {
    const wishes = db
      .prepare("SELECT * FROM wishes ORDER BY created_at DESC")
      .all();
    return NextResponse.json(wishes);
  }

  const wishes = db
    .prepare("SELECT id, name, message, created_at FROM wishes WHERE visible = 1 ORDER BY created_at DESC")
    .all();
  return NextResponse.json(wishes);
}

export async function POST(request: NextRequest) {
  const { name, message } = await request.json();

  if (!name?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "姓名和祝福内容必填" }, { status: 400 });
  }

  const db = getDb();
  const result = db
    .prepare("INSERT INTO wishes (name, message) VALUES (?, ?)")
    .run(name.trim(), message.trim());

  const ip = getClientIp(request);
  if (ip) {
    geolocateIp(ip).then((geo) => {
      if (!geo) return;
      db.prepare("UPDATE wishes SET city = ? WHERE id = ?").run(geo.city, result.lastInsertRowid);
      db.prepare(
        `INSERT INTO map_locations (type, city, province, lat, lng)
         VALUES ('wish', ?, ?, ?, ?)
         ON CONFLICT(type, city) DO UPDATE SET
           count = count + 1,
           last_seen = CURRENT_TIMESTAMP`
      ).run(geo.city, geo.province, geo.lat, geo.lng);
    }).catch(() => {});
  }

  return NextResponse.json({
    id: result.lastInsertRowid,
    name: name.trim(),
    message: message.trim(),
    created_at: new Date().toISOString(),
  });
}
