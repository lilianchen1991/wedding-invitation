import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, signToken, setTokenCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  if (!password) {
    return NextResponse.json({ error: "密码不能为空" }, { status: 400 });
  }

  const valid = await verifyPassword(password);
  if (!valid) {
    return NextResponse.json({ error: "密码错误" }, { status: 401 });
  }

  const token = signToken();
  const response = NextResponse.json({ success: true });
  return setTokenCookie(response, token);
}
