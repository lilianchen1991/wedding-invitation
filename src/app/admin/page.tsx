"use client";

import { useEffect, useState } from "react";

interface Stats {
  totalRsvp: number;
  attending: number;
  totalGuests: number;
  totalWishes: number;
  totalPhotos: number;
}

interface AnalyticsStats {
  totalPV: number;
  totalUV: number;
  todayPV: number;
  todayUV: number;
  avgVisitsPerUser: number;
  avgDuration: number;
  dailyStats: { date: string; pv: number; uv: number }[];
  topCities: { city: string; count: number }[];
  deviceBreakdown: { mobile: number; desktop: number; tablet: number };
  recentVisits: {
    ip: string;
    city: string;
    enteredAt: string;
    duration: number;
    device: "mobile" | "tablet" | "desktop";
  }[];
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hour = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${month}-${day} ${hour}:${min}`;
}

const DEVICE_LABEL: Record<string, string> = {
  mobile: "📱 手机",
  desktop: "💻 电脑",
  tablet: "📱 平板",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsStats | null>(null);

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

    fetch("/api/analytics/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setAnalytics(data);
      })
      .catch(() => {});
  }, []);

  const cards = stats
    ? [
        { label: "RSVP 回复", value: stats.totalRsvp, sub: `${stats.attending} 人确认出席` },
        { label: "预计到场", value: `${stats.totalGuests} 人`, sub: "含随行宾客" },
        { label: "祝福留言", value: stats.totalWishes, sub: "条祝福" },
        { label: "照片总数", value: stats.totalPhotos, sub: "张照片" },
      ]
    : [];

  const maxPV = analytics
    ? Math.max(...analytics.dailyStats.map((d) => d.pv), 1)
    : 1;
  const deviceTotal = analytics
    ? analytics.deviceBreakdown.mobile + analytics.deviceBreakdown.desktop + analytics.deviceBreakdown.tablet
    : 0;

  return (
    <div>
      <h1 className="font-serif text-2xl text-primary mb-6">仪表盘</h1>

      {/* Business Stats */}
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

      {/* Analytics Section */}
      {analytics && (
        <>
          <div className="h-px bg-border my-8" />
          <h2 className="font-serif text-xl text-primary mb-5">数据统计</h2>

          {/* Analytics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              { label: "累计访问 (PV)", value: analytics.totalPV, sub: "页面浏览量" },
              { label: "独立访客 (UV)", value: analytics.totalUV, sub: "按 IP 去重" },
              { label: "今日 PV", value: analytics.todayPV, sub: "今日浏览量" },
              { label: "今日 UV", value: analytics.todayUV, sub: "今日独立访客" },
              { label: "平均停留", value: formatDuration(analytics.avgDuration), sub: "有效停留时长" },
              { label: "人均访问", value: `${analytics.avgVisitsPerUser} 次`, sub: "PV / UV" },
            ].map((card) => (
              <div key={card.label} className="bg-white border border-border p-4">
                <p className="text-xs text-text-light mb-1">{card.label}</p>
                <p className="text-xl font-serif text-primary">{card.value}</p>
                <p className="text-[11px] text-text-light mt-1">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Daily Chart */}
          <div className="bg-white border border-border p-5 mb-8">
            <h3 className="text-sm font-medium text-primary mb-4">最近 14 天趋势</h3>
            {analytics.dailyStats.length === 0 ? (
              <p className="text-text-light text-sm py-8 text-center">暂无数据</p>
            ) : (
              <div className="overflow-x-auto">
                <svg
                  viewBox={`0 0 ${analytics.dailyStats.length * 50 + 20} 160`}
                  className="w-full min-w-[400px] h-[160px]"
                >
                  {[0.25, 0.5, 0.75, 1].map((ratio) => (
                    <g key={ratio}>
                      <line
                        x1="0"
                        y1={120 - 100 * ratio}
                        x2={analytics.dailyStats.length * 50 + 20}
                        y2={120 - 100 * ratio}
                        stroke="#f0f0f0"
                        strokeWidth="0.5"
                      />
                      <text
                        x={analytics.dailyStats.length * 50 + 5}
                        y={120 - 100 * ratio + 3}
                        fill="#bbb"
                        fontSize="8"
                      >
                        {Math.round(maxPV * ratio)}
                      </text>
                    </g>
                  ))}
                  {analytics.dailyStats.map((day, i) => {
                    const pvH = (day.pv / maxPV) * 100;
                    const uvH = (day.uv / maxPV) * 100;
                    const x = i * 50 + 10;
                    const dateLabel = day.date.slice(5);
                    return (
                      <g key={day.date}>
                        <rect x={x} y={120 - pvH} width="16" height={pvH} fill="#C9A96E" rx="2" opacity="0.8" />
                        <rect x={x + 18} y={120 - uvH} width="16" height={uvH} fill="#4A9ECC" rx="2" opacity="0.8" />
                        <text x={x + 17} y="135" textAnchor="middle" fill="#999" fontSize="8">{dateLabel}</text>
                      </g>
                    );
                  })}
                  <rect x="0" y="145" width="8" height="8" fill="#C9A96E" rx="1" opacity="0.8" />
                  <text x="10" y="153" fill="#999" fontSize="8">PV</text>
                  <rect x="30" y="145" width="8" height="8" fill="#4A9ECC" rx="1" opacity="0.8" />
                  <text x="40" y="153" fill="#999" fontSize="8">UV</text>
                </svg>
              </div>
            )}
          </div>

          {/* Cities + Devices */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white border border-border p-5">
              <h3 className="text-sm font-medium text-primary mb-4">Top 10 城市</h3>
              {analytics.topCities.length === 0 ? (
                <p className="text-text-light text-sm py-4 text-center">暂无数据</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-text-light text-xs border-b border-border">
                      <th className="text-left py-2 font-normal">#</th>
                      <th className="text-left py-2 font-normal">城市</th>
                      <th className="text-right py-2 font-normal">访问次数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topCities.map((city, i) => (
                      <tr key={city.city} className="border-b border-border/50 last:border-0">
                        <td className="py-2 text-text-light">{i + 1}</td>
                        <td className="py-2 text-primary">{city.city}</td>
                        <td className="py-2 text-right text-text-light">{city.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="bg-white border border-border p-5">
              <h3 className="text-sm font-medium text-primary mb-4">设备分布</h3>
              {deviceTotal === 0 ? (
                <p className="text-text-light text-sm py-4 text-center">暂无数据</p>
              ) : (
                <div className="space-y-4">
                  {(["mobile", "desktop", "tablet"] as const).map((type) => {
                    const count = analytics.deviceBreakdown[type];
                    const pct = deviceTotal > 0 ? Math.round((count / deviceTotal) * 100) : 0;
                    return (
                      <div key={type}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-primary">{DEVICE_LABEL[type]}</span>
                          <span className="text-text-light">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-bg rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: type === "mobile" ? "#C9A96E" : type === "desktop" ? "#4A9ECC" : "#5EC269",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent Visits */}
          <div className="bg-white border border-border p-5">
            <h3 className="text-sm font-medium text-primary mb-4">最近访问</h3>
            {analytics.recentVisits.length === 0 ? (
              <p className="text-text-light text-sm py-4 text-center">暂无数据</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[500px]">
                  <thead>
                    <tr className="text-text-light text-xs border-b border-border">
                      <th className="text-left py-2 font-normal">时间</th>
                      <th className="text-left py-2 font-normal">IP</th>
                      <th className="text-left py-2 font-normal">城市</th>
                      <th className="text-left py-2 font-normal">设备</th>
                      <th className="text-right py-2 font-normal">停留时长</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentVisits.map((visit, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="py-2 text-text-light whitespace-nowrap">{formatTime(visit.enteredAt)}</td>
                        <td className="py-2 text-primary font-mono text-xs">{visit.ip || "-"}</td>
                        <td className="py-2 text-primary">{visit.city || "-"}</td>
                        <td className="py-2 text-text-light">
                          {visit.device === "mobile" ? "📱" : visit.device === "tablet" ? "📱" : "💻"}
                        </td>
                        <td className="py-2 text-right text-text-light">
                          {visit.duration > 0 ? formatDuration(visit.duration) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
