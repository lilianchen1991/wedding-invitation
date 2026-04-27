"use client";

import { useState, useEffect, useMemo } from "react";
import {
  CHINA_PATH,
  CHINA_VIEWBOX,
  SCA_VIEWBOX,
  SCA_PATH,
  NINE_DASH_PATH,
  geoToSvg,
} from "@/lib/chinaMapPath";

interface MapDot {
  city: string;
  lat: number;
  lng: number;
  count: number;
}

interface MapData {
  wishes: MapDot[];
  visits: MapDot[];
  rsvps: MapDot[];
}

const VENUE = { lat: 44.57, lng: 129.38, city: "海林" };

export default function ChinaMap({ refreshKey }: { refreshKey?: number }) {
  const [data, setData] = useState<MapData | null>(null);

  useEffect(() => {
    fetch("/api/map")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, [refreshKey]);

  const dots = useMemo(() => {
    if (!data) return [];

    const items: {
      x: number;
      y: number;
      r: number;
      color: string;
      city: string;
      delay: number;
      type: "wish" | "visit" | "rsvp";
    }[] = [];

    data.visits.filter((d) => d.city !== VENUE.city).forEach((d, i) => {
      const { x, y } = geoToSvg(d.lat, d.lng);
      const r = 0.18 + Math.log2(1 + d.count) * 0.08;
      items.push({
        x, y, r: Math.min(r, 0.7),
        color: "#4A9ECC",
        city: d.city,
        delay: (i * 0.7) % 4,
        type: "visit",
      });
    });

    data.wishes.filter((d) => d.city !== VENUE.city).forEach((d, i) => {
      const { x, y } = geoToSvg(d.lat, d.lng);
      const r = 0.22 + Math.log2(1 + d.count) * 0.12;
      items.push({
        x, y, r: Math.min(r, 0.9),
        color: "#C9A96E",
        city: d.city,
        delay: (i * 0.9 + 0.3) % 4,
        type: "wish",
      });
    });

    data.rsvps.filter((d) => d.city !== VENUE.city).forEach((d, i) => {
      const { x, y } = geoToSvg(d.lat, d.lng);
      const r = 0.22 + Math.log2(1 + d.count) * 0.12;
      items.push({
        x, y, r: Math.min(r, 0.9),
        color: "#5EC269",
        city: d.city,
        delay: (i * 0.8 + 0.6) % 4,
        type: "rsvp",
      });
    });

    return items;
  }, [data]);

  const rsvpDots = dots.filter((d) => d.type === "rsvp");
  const hasDataDots = dots.length > 0;
  const venuePos = geoToSvg(VENUE.lat, VENUE.lng);

  const arcs = useMemo(() => {
    return rsvpDots
      .filter((d) => Math.hypot(d.x - venuePos.x, d.y - venuePos.y) > 1)
      .map((d, i) => {
        const mx = (d.x + venuePos.x) / 2;
        const my = (d.y + venuePos.y) / 2;
        const dist = Math.hypot(d.x - venuePos.x, d.y - venuePos.y);
        const bulge = Math.min(dist * 0.35, 6);
        const cx = mx;
        const cy = my - bulge;
        return {
          d: `M${d.x} ${d.y} Q${cx} ${cy} ${venuePos.x} ${venuePos.y}`,
          delay: (i * 1.2) % 4,
        };
      });
  }, [rsvpDots, venuePos]);

  return (
    <div className="relative rounded-xl overflow-hidden bg-[#0f1529] mb-8">
      <svg
        viewBox={CHINA_VIEWBOX}
        className="w-full h-[220px] md:h-[300px]"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="glow-gold" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="0.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-blue" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="0.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-green" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="0.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-pink" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="0.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="venue-pulse" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E88BA7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#E88BA7" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* China outline */}
        <path d={CHINA_PATH} fill="none" stroke="#1e2a4a" strokeWidth="0.3" />
        <path d={CHINA_PATH} fill="#111d35" fillOpacity="0.5" stroke="none" />

        {/* 南海诸岛 inset box */}
        <rect
          x="101" y="25" width="8" height="12"
          fill="#0f1529"
          stroke="#1e2a4a"
          strokeWidth="0.2"
        />
        <svg
          x="101" y="25" width="8" height="12"
          viewBox={SCA_VIEWBOX}
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            d={SCA_PATH}
            fill="#111d35"
            fillOpacity="0.5"
            stroke="#1e2a4a"
            strokeWidth="0.4"
          />
          <path
            d={NINE_DASH_PATH}
            fill="none"
            stroke="#1e2a4a"
            strokeWidth="0.5"
            strokeDasharray="1.2 0.8"
          />
        </svg>
        <text
          x="105" y="26"
          textAnchor="middle"
          fill="#1e2a4a"
          fontSize="1"
          fontFamily="sans-serif"
        >
          南海诸岛
        </text>

        {/* Data dots */}
        {dots.map((dot, i) => {
          const filter =
            dot.type === "wish" ? "url(#glow-gold)" :
            dot.type === "rsvp" ? "url(#glow-green)" :
            "url(#glow-blue)";
          return (
            <circle
              key={`${dot.type}-${dot.city}-${i}`}
              cx={dot.x}
              cy={dot.y}
              r={dot.r}
              fill={dot.color}
              filter={filter}
              className="map-twinkle"
              style={{ animationDelay: `${dot.delay}s` }}
            />
          );
        })}

        {/* RSVP arcs to venue */}
        {arcs.map((arc, i) => (
          <path
            key={`arc-${i}`}
            d={arc.d}
            fill="none"
            stroke="#5EC269"
            strokeWidth="0.12"
            opacity="0.5"
            pathLength="1"
            className="map-arc"
            style={{ animationDelay: `${arc.delay}s` }}
          />
        ))}

        {/* Legend */}
        <g opacity="0.7">
          <circle cx="59.5" cy="29" r="0.5" fill="#E88BA7" />
          <text x="60.6" y="29.5" fill="#aaa" fontSize="1.3" fontFamily="sans-serif">婚礼地点</text>
          <circle cx="59.5" cy="31.2" r="0.45" fill="#5EC269" />
          <text x="60.6" y="31.7" fill="#aaa" fontSize="1.3" fontFamily="sans-serif">出席宾客</text>
          <circle cx="59.5" cy="33.4" r="0.45" fill="#C9A96E" />
          <text x="60.6" y="33.9" fill="#aaa" fontSize="1.3" fontFamily="sans-serif">送上祝福</text>
          <circle cx="59.5" cy="35.6" r="0.4" fill="#4A9ECC" />
          <text x="60.6" y="36.1" fill="#aaa" fontSize="1.3" fontFamily="sans-serif">到访来客</text>
        </g>

        {/* Venue marker — rendered last so it's always on top */}
        <circle
          cx={venuePos.x}
          cy={venuePos.y}
          r="2.5"
          fill="url(#venue-pulse)"
          className="map-venue-pulse"
        />
        <circle
          cx={venuePos.x}
          cy={venuePos.y}
          r="0.45"
          fill="#E88BA7"
          filter="url(#glow-pink)"
          className="map-twinkle"
          style={{ animationDelay: "0s" }}
        />
      </svg>

      {!hasDataDots && (
        <div className="absolute inset-x-0 bottom-3 text-center pointer-events-none">
          <span className="text-[11px] text-[#C9A96E]/60 tracking-wider">
            送上祝福，点亮地图 ✨
          </span>
        </div>
      )}
    </div>
  );
}
