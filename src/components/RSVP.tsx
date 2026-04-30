"use client";

import { useState, type FormEvent } from "react";
import { useInView } from "@/hooks/useInView";
import { useSiteConfig } from "@/contexts/SiteConfigContext";

export default function RSVP() {
  const config = useSiteConfig();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    guests: "1",
  });
  const { ref: sectionRef, inView: sectionInView } = useInView();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          guests: parseInt(form.guests),
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section id="rsvp" className="py-24 px-6 bg-bg-alt">
        <div className="max-w-lg mx-auto text-center">
          <div className="text-accent text-5xl mb-6">♥</div>
          <h2 className="font-serif text-3xl text-primary mb-4">感谢您的回复！</h2>
          <p className="text-text-light">我们期待在婚礼当天与您相见。</p>
        </div>
      </section>
    );
  }

  return (
    <section id="rsvp" className="py-24 px-6 bg-bg-alt">
      <div ref={sectionRef} className="max-w-lg mx-auto">
        <div
          className={`text-center mb-12 reveal ${sectionInView ? "in-view" : ""}`}
        >
          <p className="text-sm tracking-[0.2em] text-accent uppercase mb-3">RSVP</p>
          <h2 className="font-serif text-3xl md:text-4xl text-primary mb-3">敬请回复</h2>
          {config?.rsvp_deadline && (
            <p className="text-text-light text-sm">
              请于 {(() => { const d = new Date(config.rsvp_deadline + "T00:00:00+08:00"); return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`; })()} 前回复
            </p>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className={`space-y-5 reveal ${sectionInView ? "in-view" : ""}`}
          style={{ "--stagger": 1 } as React.CSSProperties}
        >
          <div>
            <label className="block text-sm text-text-light mb-1.5">您的姓名 *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
              placeholder="请输入姓名"
            />
          </div>

          <div>
            <label className="block text-sm text-text-light mb-1.5">联系电话</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
              placeholder="方便我们联系您"
            />
          </div>

          <div>
            <label className="block text-sm text-text-light mb-1.5">出席人数</label>
            <select
              value={form.guests}
              onChange={(e) => setForm({ ...form, guests: e.target.value })}
              className="w-full border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n} 人</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-white py-3 text-sm tracking-widest uppercase hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {submitting ? "提交中..." : "提交回复"}
          </button>
        </form>
      </div>
    </section>
  );
}
