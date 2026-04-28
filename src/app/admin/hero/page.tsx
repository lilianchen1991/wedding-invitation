"use client";

import { useEffect, useState, useRef } from "react";

type BgType = "video" | "image";

export default function AdminHero() {
  const [bgType, setBgType] = useState<BgType>("video");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/settings?key=hero_bg_type").then((r) => r.json()),
      fetch("/api/settings?key=hero_video").then((r) => r.json()),
    ]).then(([typeData, mediaData]) => {
      if (typeData.value === "image" || typeData.value === "video") {
        setBgType(typeData.value);
      }
      if (mediaData.value) setMediaUrl(mediaData.value);
    });
  }, []);

  const saveBgType = async (type: BgType) => {
    setBgType(type);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "hero_bg_type", value: type }),
    });
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || !files[0]) return;
    setUploading(true);

    const form = new FormData();
    form.append("file", files[0]);
    form.append("key", "hero_video");

    const res = await fetch("/api/upload-video", { method: "POST", body: form });
    if (res.ok) {
      const data = await res.json();
      setMediaUrl(data.url);
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleRemove = async () => {
    const label = bgType === "video" ? "背景视频" : "背景图片";
    if (!confirm(`确定移除${label}？移除后首页将显示渐变背景。`)) return;

    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "hero_video", value: "" }),
    });
    setMediaUrl(null);
  };

  const isVideo = bgType === "video";
  const acceptType = isVideo ? "video/*" : "image/*";
  const labelText = isVideo ? "视频" : "图片";

  return (
    <div>
      <h1 className="font-serif text-2xl text-primary mb-2">首页背景</h1>
      <p className="text-sm text-text-light mb-6">
        选择背景类型并上传素材，作为首页第一屏的背景。
      </p>

      {/* Type Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => saveBgType("video")}
          className={`px-4 py-2 text-sm border transition-colors ${
            isVideo
              ? "bg-accent text-white border-accent"
              : "bg-white text-text-light border-border hover:border-accent/50"
          }`}
        >
          🎬 视频背景
        </button>
        <button
          onClick={() => saveBgType("image")}
          className={`px-4 py-2 text-sm border transition-colors ${
            !isVideo
              ? "bg-accent text-white border-accent"
              : "bg-white text-text-light border-border hover:border-accent/50"
          }`}
        >
          🖼️ 图片背景
        </button>
      </div>

      <p className="text-xs text-text-light mb-4">
        {isVideo
          ? "建议 15-30 秒循环短片，1080p，文件不超过 50MB。"
          : "建议 1920×1080 或更高分辨率，JPG/PNG 格式。"}
      </p>

      {mediaUrl ? (
        <div className="space-y-4">
          <div
            className="relative border border-border bg-black overflow-hidden"
            style={{ maxWidth: 640 }}
          >
            {isVideo ? (
              <video
                src={mediaUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full"
              />
            ) : (
              <img
                src={mediaUrl}
                alt="背景预览"
                className="w-full"
              />
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white/70 text-sm">预览效果（含蒙层）</span>
            </div>
          </div>

          <div className="flex gap-3">
            <label className="cursor-pointer bg-accent text-white px-4 py-2 text-sm tracking-wide hover:bg-accent/90 transition-colors">
              {uploading ? "上传中..." : `更换${labelText}`}
              <input
                ref={fileRef}
                type="file"
                accept={acceptType}
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
                disabled={uploading}
              />
            </label>
            <button
              onClick={handleRemove}
              className="border border-border px-4 py-2 text-sm text-text-light hover:text-red-500 hover:border-red-300 transition-colors"
            >
              移除{labelText}
            </button>
          </div>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-border bg-white py-20 text-center"
          style={{ maxWidth: 640 }}
        >
          {isVideo ? (
            <svg className="w-16 h-16 mx-auto mb-4 text-accent/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          ) : (
            <svg className="w-16 h-16 mx-auto mb-4 text-accent/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
          <p className="text-text-light text-sm mb-4">
            暂无背景{labelText}，将显示渐变背景
          </p>
          <label className="cursor-pointer inline-block bg-accent text-white px-6 py-2.5 text-sm tracking-wide hover:bg-accent/90 transition-colors">
            {uploading ? "上传中..." : `上传${labelText}`}
            <input
              ref={fileRef}
              type="file"
              accept={acceptType}
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
