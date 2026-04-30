import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, changePassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { oldPassword, newPassword } = await request.json();

  if (!oldPassword || !newPassword) {
    return NextResponse.json({ error: "请填写完整" }, { status: 400 });
  }

  if (newPassword.length < 4) {
    return NextResponse.json({ error: "新密码至少 4 位" }, { status: 400 });
  }

  const success = await changePassword(oldPassword, newPassword);
  if (!success) {
    return NextResponse.json({ error: "旧密码错误" }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
