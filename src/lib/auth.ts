import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "wedding-admin-secret-change-me";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const COOKIE_NAME = "admin_token";

export async function verifyPassword(password: string): Promise<boolean> {
  if (ADMIN_PASSWORD.startsWith("$2a$") || ADMIN_PASSWORD.startsWith("$2b$")) {
    return bcrypt.compare(password, ADMIN_PASSWORD);
  }
  return password === ADMIN_PASSWORD;
}

export function signToken(): string {
  return jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { role: string };
  } catch {
    return null;
  }
}

export async function getAdminToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function isAdmin(): Promise<boolean> {
  const token = await getAdminToken();
  if (!token) return false;
  const payload = verifyToken(token);
  return payload?.role === "admin";
}

export async function requireAdmin(): Promise<NextResponse | null> {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export function setTokenCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return response;
}

export function clearTokenCookie(response: NextResponse): NextResponse {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
