"use client";

import { useEffect, useState, useRef } from "react";

interface Photo {
  id: number;
  url: string;
  thumbnail: string | null;
  alt: string;
  sort_order: number;
}

export default function AdminGallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    fetch("/api/photos?category=gallery")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setPhotos(data); });
  };

  useEffect(load, []);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      form.append("category", "gallery");
      await fetch("/api/photos", { method: "POST", body: form });
    }

    setUploading(false);
    load();
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定删除这张照片？")) return;
    await fetch(`/api/photos/${id}`, { method: "DELETE" });
    setPhotos(photos.filter((p) => p.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-primary">甜蜜瞬间</h1>
        <label className="cursor-pointer bg-accent text-white px-4 py-2 text-sm tracking-wide hover:bg-accent/90 transition-colors">
          {uploading ? "上传中..." : "上传照片"}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
            disabled={uploading}
          />
        </label>
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-20 text-text-light text-sm">
          暂无照片，点击上方按钮上传
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <img
                src={photo.thumbnail || photo.url}
                alt={photo.alt}
                className="w-full aspect-square object-cover border border-border"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="bg-red-500 text-white px-3 py-1.5 text-xs rounded hover:bg-red-600"
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
