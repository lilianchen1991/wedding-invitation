"use client";

import { useState, useEffect, useRef } from "react";

export default function InvitationVideo() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [showPause, setShowPause] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    fetch("/api/settings?key=invitation_video,invitation_video_poster")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const map: Record<string, string> = {};
          data.forEach((item: { key: string; value: string }) => { map[item.key] = item.value; });
          if (map.invitation_video) setVideoUrl(map.invitation_video);
          if (map.invitation_video_poster) setPosterUrl(map.invitation_video_poster);
        } else if (data.value) {
          setVideoUrl(data.value);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [videoUrl]);

  if (!videoUrl) return null;

  const clearHideTimer = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  };

  const handlePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (ended) video.currentTime = 0;
    video.play();
    setEnded(false);
  };

  const handleTap = () => {
    if (!playing) return;
    if (showPause) {
      videoRef.current?.pause();
      setShowPause(false);
    } else {
      setShowPause(true);
      clearHideTimer();
      hideTimer.current = setTimeout(() => setShowPause(false), 3000);
    }
  };

  const handleVideoPlay = () => {
    setStarted(true);
    setPlaying(true);
    setEnded(false);
    setShowPause(false);
    window.dispatchEvent(new Event("invitation-video-play"));
  };

  const handleVideoPause = () => {
    setPlaying(false);
    setShowPause(false);
    clearHideTimer();
    window.dispatchEvent(new Event("invitation-video-stop"));
  };

  const handleVideoEnded = () => {
    setPlaying(false);
    setEnded(true);
    setShowPause(false);
    clearHideTimer();
    window.dispatchEvent(new Event("invitation-video-stop"));
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if ((video as unknown as { webkitEnterFullscreen?: () => void }).webkitEnterFullscreen) {
      (video as unknown as { webkitEnterFullscreen: () => void }).webkitEnterFullscreen();
    }
  };

  const showPoster = posterUrl && !started;

  return (
    <section ref={sectionRef} className="relative bg-black h-[100dvh] overflow-hidden">
      {/* Blurred poster background - only before first play */}
      {showPoster && (
        <img
          src={posterUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-60"
        />
      )}

      {/* Poster image - only shown before first play */}
      {showPoster && (
        <img
          src={posterUrl}
          alt="视频封面"
          className="absolute inset-0 w-full h-full object-contain portrait:object-cover z-10"
        />
      )}

      {/* Main video */}
      <video
        ref={videoRef}
        src={posterUrl ? videoUrl : `${videoUrl}#t=0.001`}
        playsInline
        webkit-playsinline="true"
        x5-playsinline="true"
        x5-video-player-type="h5-page"
        x5-video-player-fullscreen="false"
        preload="metadata"
        className={`absolute inset-0 w-full h-full object-contain z-10 ${showPoster ? "opacity-0" : ""}`}
        onPlay={handleVideoPlay}
        onPause={handleVideoPause}
        onEnded={handleVideoEnded}
      />

      {/* Play/pause overlay */}
      <button
        onClick={playing ? handleTap : handlePlay}
        className={`absolute inset-0 z-20 flex items-center justify-center transition-colors ${
          playing && !showPause ? "" : "bg-black/30"
        }`}
      >
        {playing && !showPause ? null : (
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors">
            {playing && showPause ? (
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : ended ? (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        )}
      </button>

      {/* Fullscreen button - always visible once started */}
      {started && (
        <button
          onClick={(e) => { e.stopPropagation(); handleFullscreen(); }}
          className="absolute bottom-6 left-6 z-30 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
          </svg>
        </button>
      )}
    </section>
  );
}
