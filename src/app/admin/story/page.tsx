"use client";

import { useEffect, useState, useRef } from "react";

const PHOTO_SLOTS = [
  { key: "story_photo_lilianchen", label: "连宸小时候" },
  { key: "story_photo_handan", label: "韩丹小时候" },
];

export default function AdminStory() {
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    PHOTO_SLOTS.forEach(({ key }) => {
      fetch(`/api/settings?key=${key}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.value) {
            setPhotos((prev) => ({ ...prev, [key]: data.value }));
          }
        })
        .catch(() => {});
    });
  }, []);

  const handleUpload = async (key: string, files: FileList | null) => {
    if (!files || !files[0]) return;
    setUploading(key);

    const form = new FormData();
    form.append("file", files[0]);
    form.append("key", key);

    const res = await fetch("/api/settings", { method: "POST", body: form });
    if (res.ok) {
      const data = await res.json();
      setPhotos((prev) => ({ ...prev, [key]: data.url }));
    }

    setUploading(null);
    const input = fileRefs.current[key];
    if (input) input.value = "";
  };

  const handleRemove = async (key: string, label: string) => {
    if (!confirm(`确定移除「${label}」的照片？`)) return;

    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: "" }),
    });
    setPhotos((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  return (
    <div>
      <h1 className="font-serif text-2xl text-primary mb-2">故事照片</h1>
      <p className="text-sm text-text-light mb-8">
        上传两人小时候的照片，将以圆形头像展示在「我们的故事」时间线上。建议正方形或接近正方形的照片。
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8" style={{ maxWidth: 640 }}>
        {PHOTO_SLOTS.map(({ key, label }) => (
          <div key={key} className="text-center">
            <p className="text-sm font-medium text-primary mb-4">{label}</p>

            {photos[key] ? (
              <div className="space-y-4">
                <img
                  src={photos[key]}
                  alt={label}
                  className="w-32 h-32 rounded-full object-cover border-2 border-white shadow-lg mx-auto"
                />
                <div className="flex justify-center gap-3">
                  <label className="cursor-pointer bg-accent text-white px-4 py-2 text-sm tracking-wide hover:bg-accent/90 transition-colors">
                    {uploading === key ? "上传中..." : "更换"}
                    <input
                      ref={(el) => { fileRefs.current[key] = el; }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUpload(key, e.target.files)}
                      disabled={uploading === key}
                    />
                  </label>
                  <button
                    onClick={() => handleRemove(key, label)}
                    className="border border-border px-4 py-2 text-sm text-text-light hover:text-red-500 hover:border-red-300 transition-colors"
                  >
                    移除
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border bg-white py-10 px-4">
                <div className="w-20 h-20 rounded-full bg-bg-alt mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-accent/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <label className="cursor-pointer inline-block bg-accent text-white px-5 py-2 text-sm tracking-wide hover:bg-accent/90 transition-colors">
                  {uploading === key ? "上传中..." : "上传照片"}
                  <input
                    ref={(el) => { fileRefs.current[key] = el; }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUpload(key, e.target.files)}
                    disabled={uploading === key}
                  />
                </label>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
