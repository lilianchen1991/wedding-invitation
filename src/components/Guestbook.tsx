"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { useInView } from "@/hooks/useInView";
import ChinaMap from "./ChinaMap";

interface Wish {
  id: number;
  name: string;
  message: string;
  created_at: string;
}

export default function Guestbook() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [qrcodeUrl, setQrcodeUrl] = useState<string | null>(null);
  const [qrcodeText, setQrcodeText] = useState<string>("");
  const [showQrModal, setShowQrModal] = useState(false);
  const { ref: sectionRef, inView: sectionInView } = useInView();

  useEffect(() => {
    fetch("/api/wishes")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setWishes(data);
      })
      .catch(() => {});

    if (!sessionStorage.getItem("map-visited")) {
      sessionStorage.setItem("map-visited", "1");
      fetch("/api/map/visit", { method: "POST" }).catch(() => {});
    }

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), message: message.trim() }),
      });
      if (res.ok) {
        const wish = await res.json();
        setWishes([wish, ...wishes]);
        setName("");
        setMessage("");
        setMapKey((k) => k + 1);
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="guestbook" className="py-24 px-6 bg-bg">
      <div ref={sectionRef} className="max-w-2xl mx-auto">
        <div
          className={`text-center mb-12 reveal ${sectionInView ? "in-view" : ""}`}
        >
          <p className="text-sm tracking-[0.2em] text-accent uppercase mb-3">
            Wishes
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-primary mb-3">
            送上祝福
          </h2>
          <p className="text-text-light text-sm">写下您对新人的美好祝愿，点亮地图吧</p>
        </div>

        <div
          className={`reveal ${sectionInView ? "in-view" : ""}`}
          style={{ "--stagger": 0.5 } as React.CSSProperties}
        >
          <ChinaMap refreshKey={mapKey} />
        </div>

        <form
          onSubmit={handleSubmit}
          className={`mb-12 reveal ${sectionInView ? "in-view" : ""}`}
          style={{ "--stagger": 1 } as React.CSSProperties}
        >
          <div className="flex gap-3 mb-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
              placeholder="您的姓名"
              required
            />
          </div>
          <div className="flex gap-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors resize-none"
              rows={3}
              placeholder="写下您的祝福..."
              required
            />
          </div>
          <div className="mt-3 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-accent text-white px-6 py-3 text-sm tracking-widest hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {submitting ? "发送中..." : "发送祝福"}
            </button>
            {qrcodeUrl && (
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="border border-accent text-accent px-6 py-3 text-sm tracking-widest hover:bg-accent hover:text-white transition-colors"
              >
                发个红包
              </button>
            )}
          </div>
        </form>

        {wishes.length > 0 && (
          <div
            className={`relative h-[280px] md:h-[320px] overflow-hidden reveal ${sectionInView ? "in-view" : ""}`}
            style={{ "--stagger": 2 } as React.CSSProperties}
          >
            <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-bg to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-bg to-transparent z-10 pointer-events-none" />

            <div className="danmaku-vertical">
              {[...wishes, ...wishes].map((wish, i) => (
                <div
                  key={`w-${i}`}
                  className="bg-white border border-border rounded-lg px-5 py-4 mb-3"
                >
                  <span className="font-medium text-sm text-primary">
                    {wish.name}
                  </span>
                  <p className="text-sm text-text-light mt-1 leading-relaxed">
                    {wish.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showQrModal && qrcodeUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowQrModal(false)}
          />
          <div className="relative bg-white rounded-lg p-6 mx-4 max-w-sm w-full z-10">
            <button
              className="absolute top-3 right-3 text-text-light hover:text-primary transition-colors z-10"
              onClick={() => setShowQrModal(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="font-serif text-lg text-primary text-center mb-2">发个红包</h3>
            {qrcodeText && <p className="text-sm text-text-light text-center mb-4">{qrcodeText}</p>}
            <img
              src={qrcodeUrl}
              alt="微信收款码"
              className="w-full h-auto"
            />
            <p className="text-xs text-text-light text-center mt-3">长按图片识别二维码</p>
          </div>
        </div>
      )}
    </section>
  );
}
