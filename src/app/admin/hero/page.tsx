"use client";

import { useEffect, useState, useRef } from "react";

export default function AdminHero() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/settings?key=hero_video")
      .then((r) => r.json())
      .then((data) => setVideoUrl(data.value));
  }, []);

  const handleUpload = async (files: FileList | null) => {
    if (!files || !files[0]) return;
    setUploading(true);

    const form = new FormData();
    form.append("file", files[0]);
    form.append("key", "hero_video");

    const res = await fetch("/api/settings", { method: "POST", body: form });
    if (res.ok) {
      const data = await res.json();
      setVideoUrl(data.url);
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleRemove = async () => {
    if (!confirm("确定移除背景视频？移除后首页将显示渐变背景。")) return;

    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "hero_video", value: "" }),
    });
    setVideoUrl(null);
  };

  return (
    <div>
      <h1 className="font-serif text-2xl text-primary mb-2">首页背景视频</h1>
      <p className="text-sm text-text-light mb-6">
        上传视频作为首页第一屏的背景。建议 15-30 秒循环短片，1080p，文件不超过 50MB。
      </p>

      {videoUrl ? (
        <div className="space-y-4">
          <div className="relative border border-border bg-black overflow-hidden" style={{ maxWidth: 640 }}>
            <video
              src={videoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="w-full"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white/70 text-sm">预览效果（含蒙层）</span>
            </div>
          </div>

          <div className="flex gap-3">
            <label className="cursor-pointer bg-accent text-white px-4 py-2 text-sm tracking-wide hover:bg-accent/90 transition-colors">
              {uploading ? "上传中..." : "更换视频"}
              <input
                ref={fileRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
                disabled={uploading}
              />
            </label>
            <button
              onClick={handleRemove}
              className="border border-border px-4 py-2 text-sm text-text-light hover:text-red-500 hover:border-red-300 transition-colors"
            >
              移除视频
            </button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-border bg-white py-20 text-center" style={{ maxWidth: 640 }}>
          <svg className="w-16 h-16 mx-auto mb-4 text-accent/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-text-light text-sm mb-4">暂无背景视频，将显示渐变背景</p>
          <label className="cursor-pointer inline-block bg-accent text-white px-6 py-2.5 text-sm tracking-wide hover:bg-accent/90 transition-colors">
            {uploading ? "上传中..." : "上传视频"}
            <input
              ref={fileRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
              disabled={uploading}
            />
          </label>
        </div>
      )}
    </div>
  );
}
