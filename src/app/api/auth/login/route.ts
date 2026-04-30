import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, signToken, setTokenCookie, isDefaultPassword } from "@/lib/auth";
import { checkLoginLimit, recordLoginFailure, clearLoginAttempts } from "@/lib/rate-limit";

export async function GET() {
  return NextResponse.json({ isDefault: await isDefaultPassword() });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  const limit = checkLoginLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `登录尝试过多，请 ${limit.retryAfter} 秒后再试` },
      { status: 429 }
    );
  }

  const { password } = await request.json();
  if (!password) {
    return NextResponse.json({ error: "密码不能为空" }, { status: 400 });
  }

  const valid = await verifyPassword(password);
  if (!valid) {
    recordLoginFailure(ip);
    return NextResponse.json({ error: "密码错误" }, { status: 401 });
  }

  clearLoginAttempts(ip);
  const token = signToken();
  const response = NextResponse.json({ success: true });
  return setTokenCookie(response, token);
}
