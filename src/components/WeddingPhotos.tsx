"use client";

import { useState, useEffect, useCallback } from "react";
import { useInView } from "@/hooks/useInView";

interface Photo {
  id: number;
  url: string;
  thumbnail: string | null;
  alt: string;
}

export default function WeddingPhotos() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);
  const { ref, inView } = useInView();

  useEffect(() => {
    fetch("/api/photos?category=wedding")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setPhotos(data); })
      .catch(() => {});
  }, []);

  const closeLightbox = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setLightbox(null);
      setClosing(false);
    }, 300);
  }, []);

  return (
    <section id="wedding-photos" className="py-24 px-6 bg-bg">
      <div ref={ref} className="max-w-5xl mx-auto">
        <div className={`text-center mb-16 reveal ${inView ? "in-view" : ""}`}>
          <p className="text-sm tracking-[0.2em] text-accent uppercase mb-3">Wedding Photos</p>
          <h2 className="font-serif text-3xl md:text-4xl text-primary">婚礼照片</h2>
        </div>

        {photos.length === 0 ? (
          <div
            className={`max-w-3xl mx-auto reveal ${inView ? "in-view" : ""}`}
            style={{ "--stagger": 1 } as React.CSSProperties}
          >
            <div className="border border-border bg-white py-20 px-8 text-center">
              <svg className="w-16 h-16 mx-auto mb-6 text-accent/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="font-serif text-xl text-primary mb-3">敬请期待</p>
              <p className="text-sm text-text-light">婚礼后会陆续更新当天的精彩瞬间</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {photos.map((photo, i) => (
              <div
                key={photo.id}
                onClick={() => setLightbox(i)}
                className={`relative cursor-pointer overflow-hidden group reveal ${
                  inView ? "in-view" : ""
                }`}
                style={{ "--stagger": i } as React.CSSProperties}
              >
                <img
                  src={photo.thumbnail || photo.url}
                  alt={photo.alt}
                  className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>
            ))}
          </div>
        )}
      </div>

      {lightbox !== null && photos[lightbox] && (
        <div
          className={`fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 ${
            closing ? "opacity-0 transition-opacity duration-300" : "lightbox-backdrop"
          }`}
          onClick={closeLightbox}
        >
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
            onClick={closeLightbox}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={photos[lightbox].url}
            alt={photos[lightbox].alt}
            className={`max-w-4xl max-h-[85vh] w-auto h-auto object-contain ${
              closing ? "opacity-0 scale-95 transition-all duration-300" : "lightbox-content"
            }`}
          />
        </div>
      )}
    </section>
  );
}
