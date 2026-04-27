"use client";

import { useEffect, useState, useRef } from "react";

interface Music {
  id: number;
  url: string;
  title: string;
  active: number;
}

export default function AdminMusic() {
  const [list, setList] = useState<Music[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    fetch("/api/music?all=1")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setList(data); });
  };

  useEffect(load, []);

  const handleUpload = async (files: FileList | null) => {
    if (!files || !files[0]) return;
    setUploading(true);

    const form = new FormData();
    form.append("file", files[0]);
    form.append("title", files[0].name.replace(/\.[^.]+$/, ""));

    const res = await fetch("/api/music", { method: "POST", body: form });
    if (res.ok) {
      const newMusic = await res.json();
      await fetch(`/api/music/${newMusic.id}/activate`, { method: "PUT" });
      load();
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleActivate = async (id: number) => {
    await fetch(`/api/music/${id}/activate`, { method: "PUT" });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-primary">背景音乐</h1>
        <label className="cursor-pointer bg-accent text-white px-4 py-2 text-sm tracking-wide hover:bg-accent/90 transition-colors">
          {uploading ? "上传中..." : "上传音乐"}
          <input
            ref={fileRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
            disabled={uploading}
          />
        </label>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-20 text-text-light text-sm">
          暂无音乐，点击上方按钮上传
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((music) => (
            <div key={music.id} className="bg-white border border-border p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-primary">{music.title || "未命名"}</p>
                <audio controls src={music.url} className="mt-2 h-8" />
              </div>
              <div className="flex items-center gap-3">
                {music.active ? (
                  <span className="text-xs text-accent font-medium">当前播放</span>
                ) : (
                  <button
                    onClick={() => handleActivate(music.id)}
                    className="text-xs text-text-light hover:text-accent transition-colors"
                  >
                    设为播放
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
