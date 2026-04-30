"use client";

import { useEffect, useState, useRef } from "react";

export default function AdminQrcode() {
  const [qrcodeUrl, setQrcodeUrl] = useState<string | null>(null);
  const [qrcodeText, setQrcodeText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/settings?key=payment_qrcode,payment_qrcode_text")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          data.forEach((item: { key: string; value: string }) => {
            if (item.key === "payment_qrcode") setQrcodeUrl(item.value);
            if (item.key === "payment_qrcode_text") setQrcodeText(item.value);
          });
        } else if (data.value) {
          setQrcodeUrl(data.value);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveText = async () => {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "payment_qrcode_text", value: qrcodeText }),
    });
    setSaving(false);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || !files[0]) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      alert("请选择图片文件");
      return;
    }
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("key", "payment_qrcode");
    try {
      const res = await fetch("/api/settings", { method: "POST", body: form });
      if (res.ok) {
        const data = await res.json();
        setQrcodeUrl(data.url);
      } else {
        alert("上传失败");
      }
    } catch {
      alert("上传失败");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleRemove = async () => {
    if (!confirm("确定移除收款码？")) return;
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "payment_qrcode", value: "" }),
    });
    setQrcodeUrl(null);
  };

  return (
    <div>
      <h1 className="font-serif text-2xl text-primary mb-2">收款码配置</h1>
      <p className="text-sm text-text-light mb-4">
        上传微信收款码图片，将在祝福留言区展示「发个红包」按钮。
      </p>
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded px-4 py-3">
        <p className="text-sm text-amber-800 font-medium mb-1">⚠️ 备案提示</p>
        <p className="text-xs text-amber-700 leading-relaxed">
          网站需要完成 ICP 备案后，方可在页面中使用长按识别二维码功能。微信会针对未备案域名的部分高级能力（如长按识别二维码、JS-SDK）进行降级或禁用。
        </p>
      </div>

      {qrcodeUrl ? (
        <div className="space-y-4">
          <div className="border border-border overflow-hidden inline-block">
            <img src={qrcodeUrl} alt="收款码" className="max-w-xs h-auto" />
          </div>
          <div className="flex gap-3">
            <label className="cursor-pointer bg-accent text-white px-4 py-2 text-sm tracking-wide hover:bg-accent/90 transition-colors">
              {uploading ? "上传中..." : "更换收款码"}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
                disabled={uploading}
              />
            </label>
            <button
              onClick={handleRemove}
              className="border border-border px-4 py-2 text-sm text-text-light hover:text-red-500 hover:border-red-300 transition-colors"
            >
              移除收款码
            </button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-border bg-white py-20 text-center" style={{ maxWidth: 480 }}>
          <svg className="w-16 h-16 mx-auto mb-4 text-accent/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M3 10h2v4H3zm4-3h2v10H7zm4-4h2v18h-2zm4 7h2v4h-2zm4-2h2v8h-2z" />
          </svg>
          <p className="text-text-light text-sm mb-4">暂无收款码</p>
          <label className="cursor-pointer inline-block bg-accent text-white px-6 py-2.5 text-sm tracking-wide hover:bg-accent/90 transition-colors">
            {uploading ? "上传中..." : "上传收款码"}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
              disabled={uploading}
            />
          </label>
        </div>
      )}

      <div className="mt-10 pt-8 border-t border-border" style={{ maxWidth: 480 }}>
        <h2 className="font-serif text-lg text-primary mb-2">弹窗文案</h2>
        <p className="text-sm text-text-light mb-4">
          展示在「发个红包」标题下方的提示文字，留空则不显示。
        </p>
        <input
          type="text"
          value={qrcodeText}
          onChange={(e) => setQrcodeText(e.target.value)}
          className="w-full border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors mb-3"
          placeholder="例如：感谢您的心意 🧧"
        />
        <button
          onClick={handleSaveText}
          disabled={saving}
          className="bg-accent text-white px-5 py-2 text-sm tracking-wide hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存文案"}
        </button>
      </div>
    </div>
  );
}
