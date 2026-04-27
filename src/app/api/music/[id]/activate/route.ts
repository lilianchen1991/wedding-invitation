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

  db.prepare("UPDATE music SET active = 0").run();
  db.prepare("UPDATE music SET active = 1 WHERE id = ?").run(id);

  return NextResponse.json({ success: true });
}
