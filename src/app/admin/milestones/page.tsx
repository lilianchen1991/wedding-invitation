"use client";

import { useEffect, useState, useRef } from "react";

interface Milestone {
  id: number;
  date: string;
  title: string;
  content: string;
  link: string | null;
  photo: string | null;
  sort_order: number;
}

interface EditingMilestone {
  id?: number;
  date: string;
  title: string;
  content: string;
  link: string | null;
  photo: string | null;
  photoFile?: File | null;
  removePhoto?: boolean;
}

const EMPTY: EditingMilestone = {
  date: "",
  title: "",
  content: "",
  link: null,
  photo: null,
};

export default function AdminMilestones() {
  const [items, setItems] = useState<Milestone[]>([]);
  const [editing, setEditing] = useState<EditingMilestone | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const load = () => {
    fetch("/api/milestones")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setItems(data); });
  };

  useEffect(load, []);

  const save = async () => {
    if (!editing || !editing.date?.trim() || !editing.title?.trim() || !editing.content?.trim()) return;
    setSaving(true);

    const isNew = !editing.id;

    if (editing.photoFile || (!isNew && editing.removePhoto)) {
      const form = new FormData();
      if (!isNew) form.append("id", String(editing.id));
      form.append("date", editing.date);
      form.append("title", editing.title);
      form.append("content", editing.content);
      if (editing.link) form.append("link", editing.link);
      if (editing.photoFile) form.append("photo", editing.photoFile);
      if (editing.removePhoto && !editing.photoFile) form.append("remove_photo", "1");

      const res = await fetch("/api/milestones", {
        method: isNew ? "POST" : "PUT",
        body: form,
      });
      if (res.ok) { load(); setEditing(null); }
    } else {
      const body: Record<string, unknown> = {
        date: editing.date,
        title: editing.title,
        content: editing.content,
        link: editing.link,
      };
      if (!isNew) body.id = editing.id;

      const res = await fetch("/api/milestones", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) { load(); setEditing(null); }
    }

    setSaving(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const remove = async (id: number) => {
    if (!confirm("确定删除这条时间轴？")) return;
    await fetch(`/api/milestones?id=${id}`, { method: "DELETE" });
    load();
  };

  const move = async (id: number, direction: -1 | 1) => {
    const idx = items.findIndex((m) => m.id === id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= items.length) return;

    const a = items[idx];
    const b = items[swapIdx];
    await Promise.all([
      fetch("/api/milestones", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: a.id, sort_order: b.sort_order }),
      }),
      fetch("/api/milestones", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: b.id, sort_order: a.sort_order }),
      }),
    ]);
    load();
  };

  const inputCls = "w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-accent/50 transition-colors";
  const labelCls = "block text-sm text-text-light mb-1";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-primary mb-1">故事时间轴</h1>
          <p className="text-sm text-text-light">管理「我们的故事」时间轴内容，每条可上传照片。</p>
        </div>
        <button
          onClick={() => setEditing({ ...EMPTY })}
          className="bg-accent text-white px-4 py-2 text-sm tracking-wide hover:bg-accent/90 transition-colors"
        >
          + 添加
        </button>
      </div>

      {editing && (
        <div className="bg-white border border-accent/30 p-5 mb-6">
          <h3 className="font-serif text-base text-primary mb-4">
            {editing.id ? "编辑时间轴" : "新增时间轴"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelCls}>日期 *</label>
              <input className={inputCls} value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} placeholder="如：1991.12.14 或 2022.05.08 - 2025.11.27" />
            </div>
            <div>
              <label className={labelCls}>标题 *</label>
              <input className={inputCls} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="如：初次相遇" />
            </div>
          </div>
          <div className="mb-4">
            <label className={labelCls}>内容 *（如需超链接，在链接字段填写 URL）</label>
            <textarea className={`${inputCls} min-h-[80px]`} value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} placeholder="如：那一天，我们的故事悄然开始。" />
          </div>
          <div className="mb-4">
            <label className={labelCls}>链接（可选，填写后内容显示为可点击）</label>
            <input className={inputCls} value={editing.link || ""} onChange={(e) => setEditing({ ...editing, link: e.target.value || null })} placeholder="如：https://v.douyin.com/xxx" />
          </div>
          <div className="mb-4">
            <label className={labelCls}>照片（可选，以圆形头像展示在时间线上）</label>
            {(editing.photo && !editing.removePhoto) || editing.photoFile ? (
              <div className="flex items-center gap-4 mt-2">
                <img
                  src={editing.photoFile ? URL.createObjectURL(editing.photoFile) : editing.photo!}
                  alt="预览"
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow"
                />
                <div className="flex gap-2">
                  <label className="cursor-pointer text-sm text-accent border border-accent px-3 py-1.5 hover:bg-accent hover:text-white transition-colors">
                    更换
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setEditing({ ...editing, photoFile: f, removePhoto: false });
                      }}
                    />
                  </label>
                  <button
                    onClick={() => {
                      setEditing({ ...editing, photo: null, photoFile: null, removePhoto: true });
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="text-sm text-text-light border border-border px-3 py-1.5 hover:text-red-500 hover:border-red-300 transition-colors"
                  >
                    移除
                  </button>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer inline-block mt-2 text-sm text-accent border border-accent px-4 py-2 hover:bg-accent hover:text-white transition-colors">
                上传照片
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setEditing({ ...editing, photoFile: f, removePhoto: false });
                  }}
                />
              </label>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={save} disabled={saving} className="bg-accent text-white px-5 py-2 text-sm hover:bg-accent/90 transition-colors disabled:opacity-50">
              {saving ? "保存中..." : "保存"}
            </button>
            <button onClick={() => { setEditing(null); if (fileRef.current) fileRef.current.value = ""; }} className="border border-border px-5 py-2 text-sm text-text-light hover:text-primary transition-colors">
              取消
            </button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="border-2 border-dashed border-border bg-white py-16 text-center">
          <p className="text-text-light text-sm">暂无时间轴内容</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={item.id} className="bg-white border border-border p-4 flex items-start gap-4">
              <div className="flex flex-col gap-1 pt-1">
                <button
                  onClick={() => move(item.id, -1)}
                  disabled={idx === 0}
                  className="text-text-light hover:text-primary disabled:opacity-20 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => move(item.id, 1)}
                  disabled={idx === items.length - 1}
                  className="text-text-light hover:text-primary disabled:opacity-20 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {item.photo && (
                <img src={item.photo} alt={item.title} className="w-12 h-12 rounded-full object-cover border border-border flex-shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs text-accent font-mono">{item.date}</span>
                  <span className="font-serif text-primary">{item.title}</span>
                </div>
                <p className="text-sm text-text-light line-clamp-2">{item.content}</p>
                {item.link && (
                  <p className="text-xs text-accent mt-1 truncate">🔗 {item.link}</p>
                )}
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setEditing({ ...item, photoFile: null, removePhoto: false })}
                  className="text-sm text-accent hover:text-accent/70 transition-colors"
                >
                  编辑
                </button>
                <button
                  onClick={() => remove(item.id)}
                  className="text-sm text-text-light hover:text-red-500 transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
