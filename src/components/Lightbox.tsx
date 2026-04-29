"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface LightboxProps {
  photos: { url: string; alt: string }[];
  index: number;
  onClose: () => void;
  onChangeIndex?: (index: number) => void;
}

export default function Lightbox({ photos, index, onClose, onChangeIndex }: LightboxProps) {
  const [closing, setClosing] = useState(false);
  const [entered, setEntered] = useState(false);
  const [showHint, setShowHint] = useState(!!onChangeIndex);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [dismissY, setDismissY] = useState(0);
  const [swipeX, setSwipeX] = useState(0);
  const [bgOpacity, setBgOpacity] = useState(0.9);
  const [dismissing, setDismissing] = useState(false);
  const [settling, setSettling] = useState(false);

  const activeRef = useRef(false);
  const ts = useRef({
    startX: 0,
    startY: 0,
    startDist: 0,
    startScale: 1,
    startTr: { x: 0, y: 0 },
    mode: "" as "" | "pinch" | "pan" | "swipe-x" | "swipe-y",
    lastTap: 0,
    lastTapX: 0,
    lastTapY: 0,
  });

  useEffect(() => {
    let cancelled = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) setEntered(true);
      });
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setDismissY(0);
    setSwipeX(0);
    setBgOpacity(0.9);
    setSettling(false);
  }, [index]);

  useEffect(() => {
    if (!showHint) return;
    const t = setTimeout(() => setShowHint(false), 3500);
    return () => clearTimeout(t);
  }, [showHint]);

  const animateClose = useCallback(() => {
    if (dismissing || settling) return;
    setClosing(true);
    setTimeout(onClose, 300);
  }, [onClose, dismissing, settling]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") animateClose();
      else if (e.key === "ArrowLeft" && onChangeIndex)
        onChangeIndex((index - 1 + photos.length) % photos.length);
      else if (e.key === "ArrowRight" && onChangeIndex)
        onChangeIndex((index + 1) % photos.length);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [index, photos.length, onChangeIndex, animateClose]);

  const pinchDist = (touches: React.TouchList | TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (dismissing || closing || settling) return;
    const s = ts.current;
    activeRef.current = true;

    if (e.touches.length === 2) {
      s.mode = "pinch";
      s.startDist = pinchDist(e.touches);
      s.startScale = scale;
      s.startTr = { ...translate };
    } else if (e.touches.length === 1) {
      s.startX = e.touches[0].clientX;
      s.startY = e.touches[0].clientY;
      s.startTr = { ...translate };
      s.mode = "";
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (dismissing || closing || settling) return;
    const s = ts.current;

    if (s.mode === "pinch" && e.touches.length === 2) {
      e.preventDefault();
      const d = pinchDist(e.touches);
      const next = Math.min(Math.max(s.startScale * (d / s.startDist), 1), 5);
      setScale(next);
      return;
    }

    if (e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - s.startX;
    const dy = e.touches[0].clientY - s.startY;

    if (scale > 1.05) {
      s.mode = "pan";
      e.preventDefault();
      setTranslate({ x: s.startTr.x + dx, y: s.startTr.y + dy });
      return;
    }

    if (!s.mode && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      s.mode = Math.abs(dy) > Math.abs(dx) ? "swipe-y" : "swipe-x";
    }

    if (s.mode === "swipe-x") {
      e.preventDefault();
      setSwipeX(dx);
    }

    if (s.mode === "swipe-y") {
      e.preventDefault();
      setDismissY(dy);
      setBgOpacity(0.9 - Math.min(Math.abs(dy) / 400, 0.5));
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (dismissing || closing || settling) return;
    const s = ts.current;
    activeRef.current = false;

    if (s.mode === "pinch") {
      if (scale < 1.1) {
        setScale(1);
        setTranslate({ x: 0, y: 0 });
      }
      if (e.touches.length === 1) {
        s.startX = e.touches[0].clientX;
        s.startY = e.touches[0].clientY;
        s.startTr = { ...translate };
      }
      s.mode = "";
      return;
    }

    if (s.mode === "pan") {
      if (e.changedTouches.length === 1) {
        const dy = e.changedTouches[0].clientY - s.startY;
        const dx = e.changedTouches[0].clientX - s.startX;
        if (dy > 120 && Math.abs(dy) > Math.abs(dx) * 1.5) {
          setScale(1);
          setTranslate({ x: 0, y: 0 });
          setDismissing(true);
          setDismissY(window.innerHeight);
          setBgOpacity(0);
          setTimeout(onClose, 300);
          s.mode = "";
          return;
        }
      }
      s.mode = "";
      return;
    }

    if (s.mode === "swipe-y") {
      if (Math.abs(dismissY) > 120) {
        setDismissing(true);
        setDismissY(dismissY > 0 ? window.innerHeight : -window.innerHeight);
        setBgOpacity(0);
        setTimeout(onClose, 300);
      } else {
        setDismissY(0);
        setBgOpacity(0.9);
      }
      s.mode = "";
      return;
    }

    if (s.mode === "swipe-x" && onChangeIndex) {
      if (Math.abs(swipeX) > 80) {
        const dir = swipeX > 0 ? -1 : 1;
        setSettling(true);
        setSwipeX(swipeX > 0 ? window.innerWidth : -window.innerWidth);
        setTimeout(() => {
          activeRef.current = true;
          setSwipeX(0);
          setSettling(false);
          onChangeIndex((index + dir + photos.length) % photos.length);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => { activeRef.current = false; });
          });
        }, 280);
      } else {
        setSwipeX(0);
      }
      s.mode = "";
      return;
    }

    if (!s.mode && e.changedTouches.length === 1) {
      const now = Date.now();
      const tapX = e.changedTouches[0].clientX;
      const tapY = e.changedTouches[0].clientY;

      if (
        now - s.lastTap < 300 &&
        Math.abs(tapX - s.lastTapX) < 30 &&
        Math.abs(tapY - s.lastTapY) < 30
      ) {
        if (scale > 1.05) {
          setScale(1);
          setTranslate({ x: 0, y: 0 });
        } else {
          const S = 2.5;
          const cx = window.innerWidth / 2;
          const cy = window.innerHeight / 2;
          setScale(S);
          setTranslate({ x: (S - 1) * (cx - tapX), y: (S - 1) * (cy - tapY) });
        }
        s.lastTap = 0;
      } else {
        s.lastTap = now;
        s.lastTapX = tapX;
        s.lastTapY = tapY;
      }
    }

    s.mode = "";
  };

  const photo = photos[index];
  if (!photo) return null;

  const isZoomed = scale > 1.05;
  const prevPhoto = photos[(index - 1 + photos.length) % photos.length];
  const nextPhoto = photos[(index + 1) % photos.length];

  const imgClass = "max-w-[90vw] max-h-[80vh] w-auto h-auto object-contain select-none";

  function getPhotoStyle(): React.CSSProperties {
    if (closing) {
      return { transform: "scale(0.95)", opacity: 0, transition: "transform 0.3s ease-out, opacity 0.3s ease-out" };
    }
    if (!entered) {
      return { transform: "scale(0.95)", opacity: 0 };
    }
    if (isZoomed) {
      return {
        transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
        transition: activeRef.current ? "none" : "transform 0.3s cubic-bezier(.2,.8,.4,1)",
      };
    }
    return {
      transform: `translateY(${dismissY}px) scale(${1 - Math.abs(dismissY) * 0.0008})`,
      opacity: 1,
      transition: activeRef.current ? "none" : "transform 0.3s cubic-bezier(.2,.8,.4,1), opacity 0.4s ease-out",
    };
  }

  function getStripStyle(): React.CSSProperties {
    return {
      width: "300vw",
      transform: `translateX(calc(-100vw + ${swipeX}px))`,
      transition: activeRef.current ? "none" : "transform 0.28s cubic-bezier(.2,.8,.4,1)",
    };
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        closing ? "opacity-0 transition-opacity duration-300" : "lightbox-backdrop"
      }`}
      style={{
        backgroundColor: `rgba(0,0,0,${bgOpacity})`,
        touchAction: "none",
        transition: activeRef.current ? "none" : "background-color 0.3s ease-out",
      }}
      onClick={animateClose}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {onChangeIndex && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white/50 text-sm z-10">
          {index + 1} / {photos.length}
        </div>
      )}

      <button
        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
        onClick={animateClose}
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {onChangeIndex && (
        <>
          <button
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-10 p-2"
            onClick={(e) => { e.stopPropagation(); onChangeIndex((index - 1 + photos.length) % photos.length); }}
          >
            <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-10 p-2"
            onClick={(e) => { e.stopPropagation(); onChangeIndex((index + 1) % photos.length); }}
          >
            <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {onChangeIndex ? (
        <div className="absolute inset-0 overflow-hidden">
          <div className="flex h-full" style={isZoomed ? undefined : getStripStyle()}>
            <div className="w-screen flex-shrink-0 flex items-center justify-center" style={isZoomed ? { display: "none" } : undefined}>
              <img src={prevPhoto.url} alt={prevPhoto.alt} className={imgClass} draggable={false} />
            </div>
            <div className={`flex-shrink-0 flex items-center justify-center ${isZoomed ? "w-full h-full" : "w-screen"}`} style={getPhotoStyle()}>
              <img
                src={photo.url}
                alt={photo.alt}
                className={imgClass}
                onClick={(e) => e.stopPropagation()}
                draggable={false}
              />
            </div>
            <div className="w-screen flex-shrink-0 flex items-center justify-center" style={isZoomed ? { display: "none" } : undefined}>
              <img src={nextPhoto.url} alt={nextPhoto.alt} className={imgClass} draggable={false} />
            </div>
          </div>
        </div>
      ) : (
        <div style={getPhotoStyle()}>
          <img
            src={photo.url}
            alt={photo.alt}
            className={imgClass}
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />
        </div>
      )}

      {showHint && onChangeIndex && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 lightbox-hint">
          <p className="text-white/40 text-xs tracking-wide">左右滑动切换 · 下滑关闭</p>
        </div>
      )}
    </div>
  );
}
