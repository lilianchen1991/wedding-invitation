const store = new Map<string, number[]>();

export function rateLimit(ip: string, windowMs: number, maxRequests: number): boolean {
  const now = Date.now();
  const timestamps = store.get(ip) || [];
  const valid = timestamps.filter((t) => now - t < windowMs);
  if (valid.length >= maxRequests) return false;
  valid.push(now);
  store.set(ip, valid);
  return true;
}

const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

export function checkLoginLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (record && record.lockedUntil > now) {
    return { allowed: false, retryAfter: Math.ceil((record.lockedUntil - now) / 1000) };
  }
  if (record && record.lockedUntil <= now && record.lockedUntil > 0) {
    loginAttempts.delete(ip);
  }
  return { allowed: true };
}

export function recordLoginFailure(ip: string) {
  const record = loginAttempts.get(ip) || { count: 0, lockedUntil: 0 };
  record.count += 1;
  if (record.count >= 5) {
    record.lockedUntil = Date.now() + 5 * 60 * 1000;
    record.count = 0;
  }
  loginAttempts.set(ip, record);
}

export function clearLoginAttempts(ip: string) {
  loginAttempts.delete(ip);
}
