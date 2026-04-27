"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useInView } from "@/hooks/useInView";

interface Photo {
  id: number;
  url: string;
  thumbnail: string | null;
  alt: string;
}

export default function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const touchStartX = useRef(0);
  const { ref: sectionRef, inView } = useInView();

  useEffect(() => {
    fetch("/api/photos?category=gallery")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPhotos(data);
      })
      .catch(() => {});
  }, []);

  const closeLightbox = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setLightbox(null);
      setClosing(false);
      setShowHint(true);
    }, 300);
  }, []);

  const goTo = useCallback(
    (dir: 1 | -1) => {
      if (lightbox === null) return;
      setLightbox((lightbox + dir + photos.length) % photos.length);
    },
    [lightbox, photos.length]
  );

  useEffect(() => {
    if (lightbox === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goTo(-1);
      else if (e.key === "ArrowRight") goTo(1);
      else if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightbox, goTo, closeLightbox]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goTo(diff > 0 ? 1 : -1);
    }
  };

  const openLightbox = (globalIndex: number) => {
    setLightbox(globalIndex);
    setShowHint(true);
  };

  return (
    <section id="gallery" className="py-12 bg-bg-alt overflow-hidden">
      <div ref={sectionRef} className="px-6">
        <div
          className={`text-center mb-8 reveal ${inView ? "in-view" : ""}`}
        >
          <p className="text-sm tracking-[0.2em] text-accent uppercase mb-3">
            Gallery
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-primary">
            甜蜜瞬间
          </h2>
        </div>
      </div>

      {photos.length === 0 ? (
        <div className="px-6">
          <div className="max-w-5xl mx-auto">
            <div
              className={`reveal ${inView ? "in-view" : ""}`}
              style={{ "--stagger": 1 } as React.CSSProperties}
            >
              <div className="border border-border bg-white py-20 px-8 text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-6 text-accent/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={0.8}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="font-serif text-xl text-primary mb-3">
                  照片即将更新
                </p>
                <p className="text-sm text-text-light">敬请期待 ✦</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`reveal ${inView ? "in-view" : ""}`}
          style={{ "--stagger": 1 } as React.CSSProperties}
        >
          <div className="overflow-hidden">
            {(() => {
              const minCount = Math.max(12, photos.length);
              const repeatTimes = Math.ceil(minCount / photos.length);
              const basePhotos = Array.from({ length: repeatTimes }, () => photos).flat();
              const allPhotos = [...basePhotos, ...basePhotos];
              return (
            <div
              className="gallery-canvas h-[420px] md:h-[560px]"
              style={{ "--scroll-duration": `${Math.max(basePhotos.length * 4, 35)}s` } as React.CSSProperties}
            >
              {allPhotos.map((photo, i) => {
                const idx = i % photos.length;
                const pattern = idx % 3;
                const isTall = pattern === 0;
                const widths = [
                  "w-[200px] md:w-[280px]",
                  "w-[180px] md:w-[240px]",
                  "w-[160px] md:w-[220px]",
                ];
                return (
                  <div
                    key={`g-${i}`}
                    onClick={() => openLightbox(idx)}
                    className={`cursor-pointer overflow-hidden group ${
                      isTall ? "gallery-tall" : ""
                    }`}
                  >
                    <img
                      src={photo.thumbnail || photo.url}
                      alt={photo.alt}
                      className={`h-full object-cover rounded transition-transform duration-500 group-hover:scale-105 ${widths[pattern]}`}
                      loading="lazy"
                    />
                  </div>
                );
              })}
            </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && photos[lightbox] && (
        <div
          className={`fixed inset-0 z-50 bg-black/90 flex items-center justify-center ${
            closing
              ? "opacity-0 transition-opacity duration-300"
              : "lightbox-backdrop"
          }`}
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Counter */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white/50 text-sm">
            {lightbox + 1} / {photos.length}
          </div>

          {/* Close button */}
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
            onClick={closeLightbox}
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Left arrow */}
          <button
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-10 p-2"
            onClick={(e) => {
              e.stopPropagation();
              goTo(-1);
            }}
          >
            <svg
              className="w-8 h-8 md:w-10 md:h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Right arrow */}
          <button
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-10 p-2"
            onClick={(e) => {
              e.stopPropagation();
              goTo(1);
            }}
          >
            <svg
              className="w-8 h-8 md:w-10 md:h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Image */}
          <img
            src={photos[lightbox].url}
            alt={photos[lightbox].alt}
            className={`max-w-[85vw] max-h-[80vh] w-auto h-auto object-contain select-none ${
              closing
                ? "opacity-0 scale-95 transition-all duration-300"
                : "lightbox-content"
            }`}
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />

          {/* Swipe hint */}
          {showHint && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 lightbox-hint">
              <p className="text-white/40 text-xs tracking-wide">
                ← 左右滑动查看更多 →
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
