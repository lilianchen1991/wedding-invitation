import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";

function maskIp(ip: string | null): string {
  if (!ip) return "";
  const parts = ip.split(".");
  if (parts.length === 4) {
    parts[3] = "x";
    return parts.join(".");
  }
  return ip.replace(/:[\da-f]+$/i, ":xxxx");
}

function detectDevice(ua: string): "mobile" | "tablet" | "desktop" {
  if (/iPad|Android(?!.*Mobile)|tablet/i.test(ua)) return "tablet";
  if (/Mobile|Android|iPhone|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i.test(ua))
    return "mobile";
  return "desktop";
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const db = getDb();

  const totalPV =
    (db.prepare("SELECT COUNT(*) as c FROM page_views").get() as { c: number }).c;

  const totalUV =
    (
      db
        .prepare("SELECT COUNT(DISTINCT ip) as c FROM page_views WHERE ip IS NOT NULL")
        .get() as { c: number }
    ).c;

  const todayPV =
    (
      db
        .prepare("SELECT COUNT(*) as c FROM page_views WHERE DATE(entered_at) = DATE('now')")
        .get() as { c: number }
    ).c;

  const todayUV =
    (
      db
        .prepare(
          "SELECT COUNT(DISTINCT ip) as c FROM page_views WHERE DATE(entered_at) = DATE('now') AND ip IS NOT NULL"
        )
        .get() as { c: number }
    ).c;

  const avgDurationRow = db
    .prepare("SELECT AVG(duration) as avg FROM page_views WHERE duration > 0")
    .get() as { avg: number | null };
  const avgDuration = Math.round(avgDurationRow.avg || 0);

  const avgVisitsPerUser = totalUV > 0 ? Math.round((totalPV / totalUV) * 100) / 100 : 0;

  const dailyStats = db
    .prepare(
      `SELECT DATE(entered_at) as date, COUNT(*) as pv, COUNT(DISTINCT ip) as uv
       FROM page_views
       WHERE entered_at >= DATE('now', '-13 days')
       GROUP BY DATE(entered_at)
       ORDER BY date`
    )
    .all() as { date: string; pv: number; uv: number }[];

  const topCities = db
    .prepare(
      `SELECT city, COUNT(*) as count
       FROM page_views
       WHERE city IS NOT NULL AND city != ''
       GROUP BY city
       ORDER BY count DESC
       LIMIT 10`
    )
    .all() as { city: string; count: number }[];

  const recentRows = db
    .prepare(
      `SELECT ip, city, entered_at as enteredAt, duration, user_agent as userAgent
       FROM page_views
       ORDER BY entered_at DESC
       LIMIT 20`
    )
    .all() as {
    ip: string | null;
    city: string | null;
    enteredAt: string;
    duration: number;
    userAgent: string;
  }[];

  const recentVisits = recentRows.map((r) => ({
    ip: maskIp(r.ip),
    city: r.city || "",
    enteredAt: r.enteredAt.replace(" ", "T") + "Z",
    duration: r.duration,
    device: detectDevice(r.userAgent || ""),
  }));

  const allUa = db
    .prepare("SELECT user_agent FROM page_views WHERE user_agent IS NOT NULL")
    .all() as { user_agent: string }[];

  const deviceBreakdown = { mobile: 0, desktop: 0, tablet: 0 };
  for (const row of allUa) {
    deviceBreakdown[detectDevice(row.user_agent)]++;
  }

  return NextResponse.json({
    totalPV,
    totalUV,
    todayPV,
    todayUV,
    avgVisitsPerUser,
    avgDuration,
    dailyStats,
    topCities,
    deviceBreakdown,
    recentVisits,
  });
}
