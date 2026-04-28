"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Countdown from "./Countdown";

declare global {
  interface Window {
    WeixinJSBridge?: { invoke: (method: string, params: unknown, cb: () => void) => void };
  }
}

export default function Hero() {
  const [bgType, setBgType] = useState<"video" | "image">("video");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/settings?key=hero_bg_type").then((r) => r.json()),
      fetch("/api/settings?key=hero_video").then((r) => r.json()),
    ])
      .then(([typeData, mediaData]) => {
        if (typeData.value === "image" || typeData.value === "video") {
          setBgType(typeData.value);
        }
        if (mediaData.value) {
          setMediaUrl(mediaData.value);
          if (typeData.value !== "image") {
            const dir = mediaData.value.substring(0, mediaData.value.lastIndexOf("/"));
            setPosterUrl(`${dir}/hero-poster.jpg`);
          }
        }
      })
      .catch(() => {});
  }, []);

  const tryPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {});
  }, []);

  useEffect(() => {
    if (!mediaUrl || bgType !== "video") return;

    tryPlay();

    if (window.WeixinJSBridge) {
      window.WeixinJSBridge.invoke("getNetworkType", {}, tryPlay);
    } else {
      document.addEventListener("WeixinJSBridgeReady", () => {
        window.WeixinJSBridge?.invoke("getNetworkType", {}, tryPlay);
      });
    }

    document.addEventListener("touchstart", tryPlay, { once: true });
    window.addEventListener("user-interaction", tryPlay, { once: true });

    return () => {
      document.removeEventListener("touchstart", tryPlay);
      window.removeEventListener("user-interaction", tryPlay);
    };
  }, [mediaUrl, bgType, tryPlay]);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center text-center text-white"
    >
      {/* Background: gradient fallback → image or video */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#3a3a3a] via-[#5a5a5a] to-[#8a7a6a]" />
      {mediaUrl && bgType === "image" && (
        <img
          src={mediaUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {bgType === "video" && posterUrl && (
        <img
          src={posterUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {mediaUrl && bgType === "video" && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={posterUrl || undefined}
          className="absolute inset-0 w-full h-full object-cover"
          src={mediaUrl}
          webkit-playsinline="true"
          x5-playsinline="true"
          x5-video-player-type="h5-page"
          x5-video-player-fullscreen="false"
        />
      )}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 px-6 max-w-2xl">
        <p
          className="text-sm tracking-[0.3em] uppercase text-white/70 mb-6 hero-reveal"
          style={{ "--stagger": 0 } as React.CSSProperties}
        >
          We&apos;re Getting Married
        </p>

        <h1
          className="font-serif text-5xl md:text-7xl font-semibold mb-2 hero-reveal"
          style={{ "--stagger": 1 } as React.CSSProperties}
        >
          李连宸
        </h1>

        <div
          className="flex items-center justify-center gap-4 my-4 hero-reveal"
          style={{ "--stagger": 2 } as React.CSSProperties}
        >
          <div
            className="h-px w-12 bg-white/40 hero-line"
            style={{ "--stagger": 2 } as React.CSSProperties}
          />
          <span className="font-serif text-2xl text-accent">&</span>
          <div
            className="h-px w-12 bg-white/40 hero-line"
            style={{ "--stagger": 2 } as React.CSSProperties}
          />
        </div>

        <h1
          className="font-serif text-5xl md:text-7xl font-semibold mb-8 hero-reveal"
          style={{ "--stagger": 3 } as React.CSSProperties}
        >
          韩丹
        </h1>

        <p
          className="text-lg text-white/80 tracking-wide mb-12 hero-reveal"
          style={{ "--stagger": 4 } as React.CSSProperties}
        >
          2026 年 6 月 5 日 · 星期五
        </p>

        <div
          className="hero-reveal"
          style={{ "--stagger": 5 } as React.CSSProperties}
        >
          <Countdown targetDate="2026-06-05T11:00:00+08:00" />
        </div>

        <div
          className="mt-16 hero-reveal"
          style={{ "--stagger": 6 } as React.CSSProperties}
        >
          <a
            href="#details"
            className="inline-block border border-white/40 text-white/90 px-8 py-3 text-sm tracking-widest uppercase hover:bg-white/10 transition-all"
          >
            查看详情
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hero-pulse">
        <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7" />
        </svg>
      </div>
    </section>
  );
}
