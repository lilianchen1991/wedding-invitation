import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const db = getDb();
  db.prepare("UPDATE wishes SET visible = CASE WHEN visible = 1 THEN 0 ELSE 1 END WHERE id = ?").run(id);

  const wish = db.prepare("SELECT visible FROM wishes WHERE id = ?").get(id) as { visible: number } | undefined;
  return NextResponse.json({ visible: wish?.visible === 1 });
}
