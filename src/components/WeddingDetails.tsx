"use client";

import { useEffect, useRef } from "react";
import { useInView } from "@/hooks/useInView";
import { useSiteConfig } from "@/contexts/SiteConfigContext";

export default function WeddingDetails() {
  const config = useSiteConfig();
  const { ref: headingRef, inView: headingInView } = useInView();
  const { ref: cardsRef, inView: cardsInView } = useInView();
  const { ref: mapRef, inView: mapInView } = useInView();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  const ceremonyTime = config?.ceremony_datetime || "";
  const ceremonyVenue = config?.ceremony_venue || "";
  const ceremonyAddress = config?.ceremony_address || "";
  const ceremonyNote = config?.ceremony_note || "";
  const venueLat = config?.venue_lat ? parseFloat(config.venue_lat) : 0;
  const venueLng = config?.venue_lng ? parseFloat(config.venue_lng) : 0;
  const venueKeyword = config?.venue_keyword || "";
  const venueCity = config?.venue_city || "";

  useEffect(() => {
    if (mapInstanceRef.current || !mapContainerRef.current || !venueLat || !venueLng) return;

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
        center: [venueLat, venueLng] as unknown as Record<string, unknown>,
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
      } as Record<string, unknown>);
      mapInstanceRef.current = map;

      L.tileLayer(
        "https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
        { subdomains: ["1", "2", "3", "4"], maxZoom: 18 }
      ).addTo(map);

      const popupText = ceremonyVenue
        ? `<b>${ceremonyVenue}</b><br/>婚礼举办地`
        : "婚礼举办地";

      L.marker([venueLat, venueLng])
        .addTo(map)
        .bindPopup(popupText)
        .openPopup();
    };
    document.head.appendChild(script);
  }, [venueLat, venueLng, ceremonyVenue]);

  const amapUrl = venueKeyword && venueCity
    ? `https://uri.amap.com/search?keyword=${encodeURIComponent(venueKeyword)}&city=${encodeURIComponent(venueCity)}`
    : "";
  const qqMapUrl = venueKeyword && venueCity
    ? `https://apis.map.qq.com/uri/v1/search?keyword=${encodeURIComponent(venueKeyword)}&region=${encodeURIComponent(venueCity)}&referer=wedding`
    : "";
  const baiduUrl = venueKeyword && venueCity
    ? `https://api.map.baidu.com/search?query=${encodeURIComponent(venueKeyword)}&region=${encodeURIComponent(venueCity)}&output=html&src=wedding`
    : "";

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
          <div
            className={`bg-white border border-border p-8 text-center hover:shadow-md transition-shadow flex flex-col reveal ${
              cardsInView ? "in-view" : ""
            }`}
            style={{ "--stagger": 0 } as React.CSSProperties}
          >
            <div>
              <div className="text-accent flex justify-center mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-serif text-xl text-primary mb-4">婚礼仪式</h3>
              <div className="space-y-2 text-sm text-text-light">
                {ceremonyTime && <p className="font-medium text-primary">{ceremonyTime}</p>}
                {ceremonyVenue && <p>{ceremonyVenue}</p>}
                {ceremonyAddress && <p>{ceremonyAddress}</p>}
              </div>
            </div>
            {ceremonyNote && (
              <div className="mt-auto pt-4 mt-6 border-t border-border">
                <p className="text-sm text-accent">{ceremonyNote}</p>
              </div>
            )}
          </div>

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
            {ceremonyAddress && venueKeyword && (
              <p className="text-xs text-text-light text-center mb-3">
                {ceremonyAddress} · {venueKeyword}
              </p>
            )}
            {(amapUrl || qqMapUrl || baiduUrl) && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {amapUrl && (
                  <a href={amapUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-accent border border-accent px-3 py-1.5 hover:bg-accent hover:text-white transition-colors">
                    高德地图
                  </a>
                )}
                {qqMapUrl && (
                  <a href={qqMapUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-accent border border-accent px-3 py-1.5 hover:bg-accent hover:text-white transition-colors">
                    腾讯地图
                  </a>
                )}
                {baiduUrl && (
                  <a href={baiduUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-accent border border-accent px-3 py-1.5 hover:bg-accent hover:text-white transition-colors">
                    百度地图
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
