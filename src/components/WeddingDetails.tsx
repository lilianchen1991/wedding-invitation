"use client";

import { useEffect, useRef } from "react";
import { useInView } from "@/hooks/useInView";

const CEREMONY = {
  icon: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  title: "婚礼仪式",
  time: "2026年6月5日 上午 11:18",
  location: "林海大厦 · 吉祥厅",
  address: "黑龙江省海林市",
  note: "诚邀您共同见证我们的幸福时刻",
};

const VENUE_LNG = 129.3841;
const VENUE_LAT = 44.5741;

export default function WeddingDetails() {
  const { ref: headingRef, inView: headingInView } = useInView();
  const { ref: cardsRef, inView: cardsInView } = useInView();
  const { ref: mapRef, inView: mapInView } = useInView();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (mapInstanceRef.current || !mapContainerRef.current) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      const L = (window as unknown as Record<string, unknown>).L as {
        map: (el: HTMLElement, opts: Record<string, unknown>) => unknown;
        tileLayer: (url: string, opts: Record<string, unknown>) => { addTo: (map: unknown) => void };
        marker: (latlng: [number, number]) => {
          addTo: (map: unknown) => { bindPopup: (html: string) => { openPopup: () => void } };
        };
      };
      if (!L || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [VENUE_LAT, VENUE_LNG] as unknown as Record<string, unknown>,
        zoom: 15,
        zoomControl: true,
        attributionControl: false,
      } as Record<string, unknown>);
      mapInstanceRef.current = map;

      L.tileLayer(
        "https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
        { subdomains: ["1", "2", "3", "4"], maxZoom: 18 }
      ).addTo(map);

      L.marker([VENUE_LAT, VENUE_LNG])
        .addTo(map)
        .bindPopup("<b>林海大厦 · 吉祥厅</b><br/>婚礼举办地")
        .openPopup();
    };
    document.head.appendChild(script);
  }, []);

  return (
    <section id="details" className="py-24 px-6 bg-bg">
      <div className="max-w-4xl mx-auto">
        <div
          ref={headingRef}
          className={`text-center mb-16 reveal ${headingInView ? "in-view" : ""}`}
        >
          <p className="text-sm tracking-[0.2em] text-accent uppercase mb-3">Details</p>
          <h2 className="font-serif text-3xl md:text-4xl text-primary">婚礼详情</h2>
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-2 gap-8">
          {/* Ceremony card */}
          <div
            className={`bg-white border border-border p-8 text-center hover:shadow-md transition-shadow flex flex-col reveal ${
              cardsInView ? "in-view" : ""
            }`}
            style={{ "--stagger": 0 } as React.CSSProperties}
          >
            <div>
              <div className="text-accent flex justify-center mb-4">{CEREMONY.icon}</div>
              <h3 className="font-serif text-xl text-primary mb-4">{CEREMONY.title}</h3>
              <div className="space-y-2 text-sm text-text-light">
                <p className="font-medium text-primary">{CEREMONY.time}</p>
                <p>{CEREMONY.location}</p>
                <p>{CEREMONY.address}</p>
              </div>
            </div>
            <div className="mt-auto pt-4 mt-6 border-t border-border">
              <p className="text-sm text-accent">{CEREMONY.note}</p>
            </div>
          </div>

          {/* Map card */}
          <div
            ref={mapRef}
            className={`bg-white border border-border p-6 hover:shadow-md transition-shadow reveal ${
              mapInView ? "in-view" : ""
            }`}
            style={{ "--stagger": 1 } as React.CSSProperties}
          >
            <div className="text-accent flex justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-serif text-lg text-primary mb-3 text-center">交通指引</h3>
            <div
              ref={mapContainerRef}
              className="aspect-[4/3] bg-bg-alt rounded z-0 mb-3"
            />
            <p className="text-xs text-text-light text-center mb-3">黑龙江省海林市 · 林海大厦</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <a
                href="https://uri.amap.com/search?keyword=林海大厦&city=海林"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent border border-accent px-3 py-1.5 hover:bg-accent hover:text-white transition-colors"
              >
                高德地图
              </a>
              <a
                href="https://apis.map.qq.com/uri/v1/search?keyword=林海大厦&region=海林&referer=wedding"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent border border-accent px-3 py-1.5 hover:bg-accent hover:text-white transition-colors"
              >
                腾讯地图
              </a>
              <a
                href="https://api.map.baidu.com/search?query=林海大厦&region=海林&output=html&src=wedding"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent border border-accent px-3 py-1.5 hover:bg-accent hover:text-white transition-colors"
              >
                百度地图
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
