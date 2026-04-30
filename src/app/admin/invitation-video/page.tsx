"use client";

import { useEffect, useState, useRef } from "react";

export default function AdminInvitationVideo() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [posterUploading, setPosterUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const posterRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/settings?key=invitation_video,invitation_video_poster")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          data.forEach((item: { key: string; value: string }) => {
            if (item.key === "invitation_video") setVideoUrl(item.value);
            if (item.key === "invitation_video_poster") setPosterUrl(item.value);
          });
        } else if (data.value) {
          setVideoUrl(data.value);
        }
      });
  }, []);

  const handleUpload = (files: FileList | null) => {
    if (!files || !files[0]) return;

    const file = files[0];
    if (file.size > 200 * 1024 * 1024) {
      alert("视频文件不能超过 200MB");
      return;
    }

    setUploading(true);
    setProgress(0);

    const form = new FormData();
    form.append("file", file);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          setVideoUrl(data.url);
        } catch {}
      } else {
        alert("上传失败，请重试");
      }
      setUploading(false);
      setProgress(0);
      if (fileRef.current) fileRef.current.value = "";
    });

    xhr.addEventListener("error", () => {
      alert("上传失败，请检查网络连接后重试");
      setUploading(false);
      setProgress(0);
    });

    xhr.open("POST", "/api/upload-video");
    xhr.send(form);
  };

  const handleRemove = async () => {
    if (!confirm("确定移除婚礼邀约视频？")) return;

    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "invitation_video", value: "" }),
    });
    setVideoUrl(null);
  };

  const handlePosterUpload = async (files: FileList | null) => {
    if (!files || !files[0]) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      alert("请选择图片文件");
      return;
    }
    setPosterUploading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("key", "invitation_video_poster");
    try {
      const res = await fetch("/api/settings", { method: "POST", body: form });
      if (res.ok) {
        const data = await res.json();
        setPosterUrl(data.url);
      } else {
        alert("上传失败");
      }
    } catch {
      alert("上传失败");
    }
    setPosterUploading(false);
    if (posterRef.current) posterRef.current.value = "";
  };

  const handlePosterRemove = async () => {
    if (!confirm("确定移除视频封面图？")) return;
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "invitation_video_poster", value: "" }),
    });
    setPosterUrl(null);
  };

  const fileSizeText = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div>
      <h1 className="font-serif text-2xl text-primary mb-2">婚礼邀约视频</h1>
      <p className="text-sm text-text-light mb-6">
        上传婚礼邀约视频，将展示在「我们的故事」下方。建议 200MB 以内。
      </p>

      {uploading && (
        <div className="mb-6" style={{ maxWidth: 640 }}>
          <div className="flex justify-between text-sm text-text-light mb-2">
            <span>上传中...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-bg-alt rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {videoUrl ? (
        <div className="space-y-4">
          <div className="relative border border-border bg-black overflow-hidden" style={{ maxWidth: 640 }}>
            <video
              src={videoUrl}
              controls
              playsInline
              className="w-full"
            />
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
              disabled={uploading}
              className="border border-border px-4 py-2 text-sm text-text-light hover:text-red-500 hover:border-red-300 transition-colors disabled:opacity-50"
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
          <p className="text-text-light text-sm mb-4">暂无婚礼邀约视频</p>
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

      {videoUrl && (
        <div className="mt-10 pt-8 border-t border-border">
          <h2 className="font-serif text-lg text-primary mb-2">视频封面图</h2>
          <p className="text-sm text-text-light mb-4">
            用于 iOS 微信等不支持自动加载视频首帧的环境。未设置时视频区域可能显示黑屏。
          </p>

          {posterUrl ? (
            <div className="space-y-4">
              <div className="border border-border overflow-hidden inline-block">
                <img src={posterUrl} alt="视频封面" className="max-w-xs h-auto" />
              </div>
              <div className="flex gap-3">
                <label className="cursor-pointer bg-accent text-white px-4 py-2 text-sm tracking-wide hover:bg-accent/90 transition-colors">
                  {posterUploading ? "上传中..." : "更换封面"}
                  <input
                    ref={posterRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePosterUpload(e.target.files)}
                    disabled={posterUploading}
                  />
                </label>
                <button
                  onClick={handlePosterRemove}
                  className="border border-border px-4 py-2 text-sm text-text-light hover:text-red-500 hover:border-red-300 transition-colors"
                >
                  移除封面
                </button>
              </div>
            </div>
          ) : (
            <label className="cursor-pointer inline-block bg-accent text-white px-6 py-2.5 text-sm tracking-wide hover:bg-accent/90 transition-colors">
              {posterUploading ? "上传中..." : "上传封面图"}
              <input
                ref={posterRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePosterUpload(e.target.files)}
                disabled={posterUploading}
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}
