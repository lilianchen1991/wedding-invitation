import { NextRequest } from "next/server";

export interface GeoResult {
  city: string;
  province: string;
  lat: number;
  lng: number;
}

const cache = new Map<string, GeoResult | null>();

export function getClientIp(request: NextRequest): string | null {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xri = request.headers.get("x-real-ip");
  if (xri) return xri;
  return null;
}

export async function geolocateIp(ip: string): Promise<GeoResult | null> {
  if (cache.has(ip)) return cache.get(ip) ?? null;

  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,city,regionName,lat,lon&lang=zh-CN`,
      { signal: AbortSignal.timeout(3000) }
    );
    const data = await res.json();

    if (data.status !== "success" || !data.city || !data.lat) {
      cache.set(ip, null);
      return null;
    }

    const result: GeoResult = {
      city: data.city,
      province: data.regionName || "",
      lat: data.lat,
      lng: data.lon,
    };
    cache.set(ip, result);
    return result;
  } catch {
    cache.set(ip, null);
    return null;
  }
}
