"use client";

import { useEffect, useState } from "react";

interface Wish {
  id: number;
  name: string;
  message: string;
  visible: number;
  created_at: string;
}

export default function AdminWishes() {
  const [wishes, setWishes] = useState<Wish[]>([]);

  useEffect(() => {
    fetch("/api/wishes?all=1")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setWishes(data); });
  }, []);

  const handleToggle = async (id: number) => {
    const res = await fetch(`/api/wishes/${id}/toggle`, { method: "PUT" });
    if (res.ok) {
      const { visible } = await res.json();
      setWishes(wishes.map((w) => (w.id === id ? { ...w, visible: visible ? 1 : 0 } : w)));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定删除这条祝福？")) return;
    await fetch(`/api/wishes/${id}`, { method: "DELETE" });
    setWishes(wishes.filter((w) => w.id !== id));
  };

  return (
    <div>
      <h1 className="font-serif text-2xl text-primary mb-6">祝福留言</h1>

      {wishes.length === 0 ? (
        <div className="text-center py-20 text-text-light text-sm">
          暂无祝福留言
        </div>
      ) : (
        <div className="space-y-3">
          {wishes.map((wish) => (
            <div
              key={wish.id}
              className={`bg-white border border-border p-4 ${
                !wish.visible ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-primary">{wish.name}</span>
                    <span className="text-xs text-text-light">
                      {new Date(wish.created_at).toLocaleString("zh-CN")}
                    </span>
                    {!wish.visible && (
                      <span className="text-xs text-orange-500">已隐藏</span>
                    )}
                  </div>
                  <p className="text-sm text-text-light">{wish.message}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggle(wish.id)}
                    className="text-xs text-text-light hover:text-accent transition-colors"
                  >
                    {wish.visible ? "隐藏" : "显示"}
                  </button>
                  <button
                    onClick={() => handleDelete(wish.id)}
                    className="text-xs text-text-light hover:text-red-500 transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
