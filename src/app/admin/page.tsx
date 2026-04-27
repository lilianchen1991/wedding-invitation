"use client";

import { useEffect, useState } from "react";

interface Stats {
  totalRsvp: number;
  attending: number;
  totalGuests: number;
  totalWishes: number;
  totalPhotos: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/rsvp").then((r) => r.json()),
      fetch("/api/wishes").then((r) => r.json()),
      fetch("/api/photos").then((r) => r.json()),
    ]).then(([rsvpData, wishesData, photosData]) => {
      const rsvpList = Array.isArray(rsvpData) ? rsvpData : [];
      const attendingList = rsvpList.filter((r: { attending: string }) => r.attending === "yes");
      setStats({
        totalRsvp: rsvpList.length,
        attending: attendingList.length,
        totalGuests: attendingList.reduce((sum: number, r: { guests: number }) => sum + r.guests, 0),
        totalWishes: Array.isArray(wishesData) ? wishesData.length : 0,
        totalPhotos: Array.isArray(photosData) ? photosData.length : 0,
      });
    }).catch(() => {});
  }, []);

  const cards = stats
    ? [
        { label: "RSVP 回复", value: stats.totalRsvp, sub: `${stats.attending} 人确认出席` },
        { label: "预计到场", value: `${stats.totalGuests} 人`, sub: "含随行宾客" },
        { label: "祝福留言", value: stats.totalWishes, sub: "条祝福" },
        { label: "照片总数", value: stats.totalPhotos, sub: "张照片" },
      ]
    : [];

  return (
    <div>
      <h1 className="font-serif text-2xl text-primary mb-6">仪表盘</h1>

      {!stats ? (
        <p className="text-text-light text-sm">加载中...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div key={card.label} className="bg-white border border-border p-5">
              <p className="text-sm text-text-light mb-1">{card.label}</p>
              <p className="text-2xl font-serif text-primary">{card.value}</p>
              <p className="text-xs text-text-light mt-1">{card.sub}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
