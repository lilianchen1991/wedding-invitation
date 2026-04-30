"use client";

import { useEffect, useState } from "react";

interface MapEntry {
  id: number;
  type: string;
  city: string;
  province: string | null;
  lat: number;
  lng: number;
  count: number;
  last_seen: string;
}

const TYPE_MAP: Record<string, { label: string; color: string }> = {
  visit: { label: "到访来客", color: "#4A9ECC" },
  wish: { label: "送上祝福", color: "#C9A96E" },
  rsvp: { label: "出席宾客", color: "#5EC269" },
};

export default function AdminMap() {
  const [list, setList] = useState<MapEntry[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    load();
  }, []);

  const load = () => {
    fetch("/api/map?admin=1")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setList(data);
      });
  };

  const handleDelete = async (id: number, city: string) => {
    if (!confirm(`确定删除「${city}」的记录？`)) return;
    const res = await fetch(`/api/map?id=${id}`, { method: "DELETE" });
    if (res.ok) load();
  };

  const filtered = filter === "all" ? list : list.filter((r) => r.type === filter);

  const totalCities = new Set(list.map((r) => r.city)).size;
  const visitCount = list.filter((r) => r.type === "visit").length;
  const wishCount = list.filter((r) => r.type === "wish").length;
  const rsvpCount = list.filter((r) => r.type === "rsvp").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-primary">地图点亮</h1>
        <p className="text-sm text-text-light mt-1">
          共点亮 {totalCities} 个城市 · 到访 {visitCount} · 祝福 {wishCount} · 出席 {rsvpCount}
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { key: "all", label: "全部" },
          { key: "visit", label: "到访来客" },
          { key: "wish", label: "送上祝福" },
          { key: "rsvp", label: "出席宾客" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 text-xs tracking-wide transition-colors ${
              filter === tab.key
                ? "bg-accent text-white"
                : "bg-white text-text-light border border-border hover:text-primary"
            }`}
          >
            {tab.label}
            {tab.key !== "all" && (
              <span className="ml-1 opacity-70">
                {list.filter((r) => r.type === tab.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-text-light text-sm">
          暂无记录
        </div>
      ) : (
        <div className="bg-white border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-text-light font-normal">类型</th>
                <th className="px-4 py-3 text-text-light font-normal">城市</th>
                <th className="px-4 py-3 text-text-light font-normal">省份</th>
                <th className="px-4 py-3 text-text-light font-normal">坐标</th>
                <th className="px-4 py-3 text-text-light font-normal">次数</th>
                <th className="px-4 py-3 text-text-light font-normal">最后活跃</th>
                <th className="px-4 py-3 text-text-light font-normal">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const typeInfo = TYPE_MAP[r.type] || { label: r.type, color: "#999" };
                return (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs"
                        style={{ color: typeInfo.color }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: typeInfo.color }}
                        />
                        {typeInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-primary">{r.city}</td>
                    <td className="px-4 py-3 text-text-light">{r.province || "-"}</td>
                    <td className="px-4 py-3 text-text-light text-xs">
                      {r.lat.toFixed(2)}, {r.lng.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-text-light">{r.count}</td>
                    <td className="px-4 py-3 text-text-light text-xs">
                      {new Date(r.last_seen.endsWith("Z") ? r.last_seen : r.last_seen + "Z").toLocaleString("zh-CN")}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(r.id, r.city)}
                        className="text-xs text-text-light hover:text-red-500 transition-colors"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
