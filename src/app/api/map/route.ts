import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const db = getDb();

  if (request.nextUrl.searchParams.get("admin") === "1") {
    const denied = await requireAdmin();
    if (denied) return denied;
    const rows = db
      .prepare("SELECT id, type, city, province, lat, lng, count, last_seen FROM map_locations ORDER BY last_seen DESC")
      .all();
    return NextResponse.json(rows);
  }

  const rows = db
    .prepare("SELECT type, city, lat, lng, count FROM map_locations")
    .all() as { type: string; city: string; lat: number; lng: number; count: number }[];

  const wishes: typeof rows = [];
  const visits: typeof rows = [];
  const rsvps: typeof rows = [];
  for (const row of rows) {
    if (row.type === "wish") wishes.push(row);
    else if (row.type === "rsvp") rsvps.push(row);
    else visits.push(row);
  }

  return NextResponse.json({ wishes, visits, rsvps });
}

export async function DELETE(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "缺少 id" }, { status: 400 });

  const db = getDb();
  db.prepare("DELETE FROM map_locations WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}
