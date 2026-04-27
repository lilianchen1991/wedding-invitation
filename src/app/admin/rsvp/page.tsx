"use client";

import { useEffect, useState } from "react";

interface RsvpEntry {
  id: number;
  name: string;
  phone: string;
  attending: string;
  guests: number;
  created_at: string;
}

export default function AdminRsvp() {
  const [list, setList] = useState<RsvpEntry[]>([]);

  useEffect(() => {
    fetch("/api/rsvp")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setList(data); });
  }, []);

  const attending = list.filter((r) => r.attending === "yes");
  const totalGuests = attending.reduce((sum, r) => sum + r.guests, 0);

  const exportCsv = () => {
    const header = "姓名,电话,是否出席,人数,提交时间\n";
    const rows = list
      .map(
        (r) =>
          `${r.name},${r.phone},${r.attending === "yes" ? "出席" : "不出席"},${r.guests},${r.created_at}`
      )
      .join("\n");

    const blob = new Blob(["﻿" + header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rsvp-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-primary">RSVP 回复</h1>
          <p className="text-sm text-text-light mt-1">
            共 {list.length} 条回复，{attending.length} 人确认出席，预计 {totalGuests} 人到场
          </p>
        </div>
        {list.length > 0 && (
          <button
            onClick={exportCsv}
            className="bg-accent text-white px-4 py-2 text-sm tracking-wide hover:bg-accent/90 transition-colors"
          >
            导出 CSV
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <div className="text-center py-20 text-text-light text-sm">
          暂无 RSVP 回复
        </div>
      ) : (
        <div className="bg-white border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-text-light font-normal">姓名</th>
                <th className="px-4 py-3 text-text-light font-normal">电话</th>
                <th className="px-4 py-3 text-text-light font-normal">出席</th>
                <th className="px-4 py-3 text-text-light font-normal">人数</th>
                <th className="px-4 py-3 text-text-light font-normal">时间</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-primary">{r.name}</td>
                  <td className="px-4 py-3 text-text-light">{r.phone || "-"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 ${
                        r.attending === "yes"
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      {r.attending === "yes" ? "出席" : "不出席"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-light">{r.guests}</td>
                  <td className="px-4 py-3 text-text-light text-xs">
                    {new Date(r.created_at).toLocaleString("zh-CN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
