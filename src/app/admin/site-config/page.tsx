"use client";

import { useEffect, useState, useRef } from "react";

interface ConfigState {
  logo_image: string;
  logo_title: string;
  logo_desc: string;
}

const KEYS = [
  "logo_image", "logo_title", "logo_desc",
] as const;

const EMPTY: ConfigState = Object.fromEntries(KEYS.map((k) => [k, ""])) as unknown as ConfigState;

export default function AdminSiteConfig() {
  const [config, setConfig] = useState<ConfigState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        const next = { ...EMPTY };
        for (const k of KEYS) {
          if (data[k]) (next as Record<string, string>)[k] = data[k];
        }
        setConfig(next);
      });
  }, []);

  const update = (key: keyof ConfigState, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const saveAll = async () => {
    setSaving(true);
    const promises = (["logo_title", "logo_desc"] as const).map((key) =>
      fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: config[key] }),
      })
    );
    await Promise.all(promises);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogoUpload = async (files: FileList | null) => {
    if (!files || !files[0]) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", files[0]);
    form.append("key", "logo_image");
    const res = await fetch("/api/settings", { method: "POST", body: form });
    if (res.ok) {
      const data = await res.json();
      setConfig((prev) => ({ ...prev, logo_image: data.url }));
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeLogo = async () => {
    if (!confirm("确定移除自定义 Logo？将恢复默认 SVG Logo。")) return;
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "logo_image", value: "" }),
    });
    setConfig((prev) => ({ ...prev, logo_image: "" }));
  };

  const inputCls = "w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-accent/50 transition-colors";
  const labelCls = "block text-sm text-text-light mb-1";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-primary mb-1">网站配置</h1>
          <p className="text-sm text-text-light">配置 Logo 信息，修改后点击保存生效。</p>
        </div>
        <button
          onClick={saveAll}
          disabled={saving}
          className="bg-accent text-white px-6 py-2 text-sm tracking-wide hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {saving ? "保存中..." : saved ? "已保存 ✓" : "保存配置"}
        </button>
      </div>

      <div className="space-y-6">
        <section className="bg-white border border-border p-5">
          <h2 className="font-serif text-lg text-primary mb-4">Logo 配置</h2>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>自定义 Logo 图片</label>
              {config.logo_image ? (
                <div className="flex items-center gap-4">
                  <img src={config.logo_image} alt="Logo" className="h-16 object-contain border border-border p-2" />
                  <div className="flex gap-2">
                    <label className="cursor-pointer bg-accent text-white px-3 py-1.5 text-sm hover:bg-accent/90 transition-colors">
                      {uploading ? "上传中..." : "更换"}
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e.target.files)} disabled={uploading} />
                    </label>
                    <button onClick={removeLogo} className="border border-border px-3 py-1.5 text-sm text-text-light hover:text-red-500 hover:border-red-300 transition-colors">
                      移除
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-light">未上传（使用默认 SVG Logo）</span>
                  <label className="cursor-pointer bg-accent text-white px-3 py-1.5 text-sm hover:bg-accent/90 transition-colors">
                    {uploading ? "上传中..." : "上传 Logo"}
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e.target.files)} disabled={uploading} />
                  </label>
                </div>
              )}
            </div>
            <div>
              <label className={labelCls}>Logo 标题</label>
              <input className={inputCls} value={config.logo_title} onChange={(e) => update("logo_title", e.target.value)} placeholder="如：L & H" />
            </div>
            <div>
              <label className={labelCls}>Logo 解释文字（换行用 \n 分隔段落）</label>
              <textarea className={`${inputCls} min-h-[120px]`} value={config.logo_desc} onChange={(e) => update("logo_desc", e.target.value)} placeholder="如：LOGO 以新郎与新娘的首字母为核心创作原型..." />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
