import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getClientIp, geolocateIp } from "@/lib/geo";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!ip) return NextResponse.json({ skipped: true });

  const geo = await geolocateIp(ip);
  if (!geo) return NextResponse.json({ skipped: true });

  const db = getDb();
  db.prepare(
    `INSERT INTO map_locations (type, city, province, lat, lng)
     VALUES ('visit', ?, ?, ?, ?)
     ON CONFLICT(type, city) DO UPDATE SET
       count = count + 1,
       last_seen = CURRENT_TIMESTAMP`
  ).run(geo.city, geo.province, geo.lat, geo.lng);

  return NextResponse.json({ success: true });
}
