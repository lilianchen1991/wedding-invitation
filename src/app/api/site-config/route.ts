import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const CONFIG_KEYS = [
  "groom_name",
  "bride_name",
  "wedding_date",
  "rsvp_deadline",
  "logo_image",
  "logo_title",
  "logo_desc",
  "ceremony_datetime",
  "ceremony_venue",
  "ceremony_address",
  "ceremony_note",
  "venue_lat",
  "venue_lng",
  "venue_keyword",
  "venue_city",
];

export async function GET() {
  const db = getDb();

  const placeholders = CONFIG_KEYS.map(() => "?").join(",");
  const rows = db.prepare(`SELECT key, value FROM settings WHERE key IN (${placeholders})`).all(...CONFIG_KEYS) as { key: string; value: string }[];
  const config: Record<string, string | null> = {};
  for (const k of CONFIG_KEYS) config[k] = null;
  for (const row of rows) config[row.key] = row.value;

  const milestones = db.prepare("SELECT * FROM milestones ORDER BY sort_order ASC, id ASC").all();

  const activeMusic = db.prepare("SELECT title FROM music WHERE active = 1 LIMIT 1").get() as { title: string } | undefined;

  return NextResponse.json({
    ...config,
    milestones,
    bgm_title: activeMusic?.title || null,
  });
}
