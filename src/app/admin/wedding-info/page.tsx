"use client";

import { useEffect, useState } from "react";

interface ConfigState {
  groom_name: string;
  bride_name: string;
  wedding_date: string;
  rsvp_deadline: string;
  ceremony_datetime: string;
  ceremony_venue: string;
  ceremony_address: string;
  ceremony_note: string;
  venue_lat: string;
  venue_lng: string;
  venue_keyword: string;
  venue_city: string;
}

const KEYS = [
  "groom_name", "bride_name",
  "wedding_date", "rsvp_deadline",
  "ceremony_datetime", "ceremony_venue", "ceremony_address", "ceremony_note",
  "venue_lat", "venue_lng", "venue_keyword", "venue_city",
] as const;

const EMPTY: ConfigState = Object.fromEntries(KEYS.map((k) => [k, ""])) as unknown as ConfigState;

export default function AdminWeddingInfo() {
  const [config, setConfig] = useState<ConfigState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
    const promises = KEYS.map((key) =>
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

  const inputCls = "w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-accent/50 transition-colors";
  const labelCls = "block text-sm text-text-light mb-1";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-primary mb-1">婚礼信息</h1>
          <p className="text-sm text-text-light">配置新人信息、婚礼日期、仪式地点及交通指引。</p>
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
          <h2 className="font-serif text-lg text-primary mb-4">新人信息</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>新郎姓名</label>
              <input className={inputCls} value={config.groom_name} onChange={(e) => update("groom_name", e.target.value)} placeholder="如：张三" />
            </div>
            <div>
              <label className={labelCls}>新娘姓名</label>
              <input className={inputCls} value={config.bride_name} onChange={(e) => update("bride_name", e.target.value)} placeholder="如：李四" />
            </div>
          </div>
        </section>

        <section className="bg-white border border-border p-5">
          <h2 className="font-serif text-lg text-primary mb-4">婚礼日期</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>婚礼日期</label>
              <input type="date" className={inputCls} value={config.wedding_date} onChange={(e) => update("wedding_date", e.target.value)} />
              <p className="text-xs text-text-light mt-1.5">首页显示文字和倒计时自动生成</p>
            </div>
            <div>
              <label className={labelCls}>RSVP 回复截止日期</label>
              <input type="date" className={inputCls} value={config.rsvp_deadline} onChange={(e) => update("rsvp_deadline", e.target.value)} />
              <p className="text-xs text-text-light mt-1.5">前台 RSVP 区域展示的回复截止时间</p>
            </div>
          </div>
        </section>

        <section className="bg-white border border-border p-5">
          <h2 className="font-serif text-lg text-primary mb-4">婚礼仪式</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>日期时间</label>
              <input className={inputCls} value={config.ceremony_datetime} onChange={(e) => update("ceremony_datetime", e.target.value)} placeholder="如：2026年6月5日 上午 11:18" />
            </div>
            <div>
              <label className={labelCls}>地点名称</label>
              <input className={inputCls} value={config.ceremony_venue} onChange={(e) => update("ceremony_venue", e.target.value)} placeholder="如：林海大厦 · 吉祥厅" />
            </div>
            <div>
              <label className={labelCls}>省市地址</label>
              <input className={inputCls} value={config.ceremony_address} onChange={(e) => update("ceremony_address", e.target.value)} placeholder="如：北京市朝阳区幸福路 88 号" />
            </div>
            <div>
              <label className={labelCls}>备注文字</label>
              <input className={inputCls} value={config.ceremony_note} onChange={(e) => update("ceremony_note", e.target.value)} placeholder="如：诚邀您共同见证我们的幸福时刻" />
            </div>
          </div>
        </section>

        <section className="bg-white border border-border p-5">
          <h2 className="font-serif text-lg text-primary mb-4">交通指引</h2>
          <p className="text-xs text-text-light mb-4">配置地图中心点坐标和导航链接关键词。</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>场地纬度</label>
              <input className={inputCls} value={config.venue_lat} onChange={(e) => update("venue_lat", e.target.value)} placeholder="如：44.5741" />
            </div>
            <div>
              <label className={labelCls}>场地经度</label>
              <input className={inputCls} value={config.venue_lng} onChange={(e) => update("venue_lng", e.target.value)} placeholder="如：129.3841" />
            </div>
            <div>
              <label className={labelCls}>地图搜索关键词</label>
              <input className={inputCls} value={config.venue_keyword} onChange={(e) => update("venue_keyword", e.target.value)} placeholder="如：林海大厦" />
            </div>
            <div>
              <label className={labelCls}>地图搜索城市</label>
              <input className={inputCls} value={config.venue_city} onChange={(e) => update("venue_city", e.target.value)} placeholder="如：北京" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
