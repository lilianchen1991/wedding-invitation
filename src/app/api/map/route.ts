import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
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
