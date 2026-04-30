"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Lightbox from "./Lightbox";

interface Photo {
  id: number;
  url: string;
  thumbnail: string | null;
  alt: string;
}

export default function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const offsetRef = useRef(0);
  const touchOffsetRef = useRef(0);

  useEffect(() => {
    fetch("/api/photos?category=gallery")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPhotos(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || photos.length === 0) return;
    const canvas = el.firstElementChild as HTMLElement;
    if (!canvas) return;

    let raf: number;
    let prev = performance.now();
    const SPEED = 40;

    const wrapOffset = () => {
      const halfWidth = canvas.scrollWidth / 2;
      if (halfWidth > 0) {
        while (offsetRef.current >= halfWidth) offsetRef.current -= halfWidth;
        while (offsetRef.current < 0) offsetRef.current += halfWidth;
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(now - prev, 50);
      prev = now;
      if (!pausedRef.current) {
        offsetRef.current += SPEED * dt / 1000;
        wrapOffset();
      }
      canvas.style.transform = `translateX(-${offsetRef.current}px)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    let startX = 0;
    let startY = 0;
    let dirLocked: "h" | "v" | null = null;

    const onTouchStart = (e: TouchEvent) => {
      pausedRef.current = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      touchOffsetRef.current = offsetRef.current;
      dirLocked = null;
    };

    const onTouchMove = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;

      if (!dirLocked) {
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
          dirLocked = Math.abs(dx) >= Math.abs(dy) ? "h" : "v";
        }
        return;
      }

      if (dirLocked === "h") {
        e.preventDefault();
        offsetRef.current = touchOffsetRef.current - dx;
        wrapOffset();
      }
    };

    const onTouchEnd = () => {
      pausedRef.current = false;
      dirLocked = null;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [photos]);


  const openLightbox = useCallback((globalIndex: number) => {
    setLightbox(globalIndex);
  }, []);

  return (
    <section id="gallery" className="py-12 bg-bg-alt overflow-hidden">
      <div className="px-6">
        <div className="text-center mb-8">
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
            <div>
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
        <div>
          <div
            ref={scrollRef}
            className="gallery-scroll-container"
          >
            {(() => {
              const minCount = Math.max(12, photos.length);
              const repeatTimes = Math.ceil(minCount / photos.length);
              const basePhotos = Array.from({ length: repeatTimes }, () => photos).flat();
              const allPhotos = [...basePhotos, ...basePhotos];
              return (
            <div className="gallery-canvas h-[420px] md:h-[560px]">
              {allPhotos.map((photo, i) => {
                const idx = i % photos.length;
                const pattern = idx % 2;
                const isTall = pattern === 0;
                const widths = [
                  "w-[200px] md:w-[280px]",
                  "w-[180px] md:w-[240px]",
                ];
                return (
                  <div
                    key={`g-${i}`}
                    onClick={() => openLightbox(idx)}
                    className={`cursor-pointer overflow-hidden group ${widths[pattern]} ${
                      isTall ? "gallery-tall" : ""
                    }`}
                  >
                    <img
                      src={photo.thumbnail || photo.url}
                      alt={photo.alt}
                      className="w-full h-full object-cover rounded transition-transform duration-500 group-hover:scale-105"
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

      {lightbox !== null && photos[lightbox] && (
        <Lightbox
          photos={photos}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onChangeIndex={setLightbox}
        />
      )}
    </section>
  );
}
