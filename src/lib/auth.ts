import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getDb } from "./db";

const COOKIE_NAME = "admin_token";

function getSettingValue(key: string): string | null {
  const db = getDb();
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

function setSettingValue(key: string, value: string) {
  const db = getDb();
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(key, value);
}

function getJwtSecret(): string {
  let secret = getSettingValue("jwt_secret");
  if (!secret) {
    secret = crypto.randomBytes(32).toString("hex");
    setSettingValue("jwt_secret", secret);
  }
  return secret;
}

function getPasswordHash(): string {
  let hash = getSettingValue("admin_password_hash");
  if (!hash) {
    hash = bcrypt.hashSync("admin", 10);
    setSettingValue("admin_password_hash", hash);
  }
  return hash;
}

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = getPasswordHash();
  return bcrypt.compare(password, hash);
}

export async function isDefaultPassword(): Promise<boolean> {
  const hash = getPasswordHash();
  return bcrypt.compare("admin", hash);
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
  const valid = await verifyPassword(oldPassword);
  if (!valid) return false;
  const hash = await bcrypt.hash(newPassword, 10);
  setSettingValue("admin_password_hash", hash);
  return true;
}

export function signToken(): string {
  return jwt.sign({ role: "admin" }, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): { role: string } | null {
  try {
    return jwt.verify(token, getJwtSecret()) as { role: string };
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
