import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { ids } = await request.json() as { ids: number[] };
  if (!Array.isArray(ids)) {
    return NextResponse.json({ error: "ids 必须是数组" }, { status: 400 });
  }

  const db = getDb();
  const stmt = db.prepare("UPDATE photos SET sort_order = ? WHERE id = ?");
  const batch = db.transaction((orderedIds: number[]) => {
    orderedIds.forEach((id, index) => stmt.run(index, id));
  });
  batch(ids);

  return NextResponse.json({ success: true });
}
