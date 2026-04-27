"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export default function MusicPlayer() {
  const [playing, setPlaying] = useState(false);
  const [hasMusic, setHasMusic] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [musicTitle, setMusicTitle] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pausedByVideo = useRef(false);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.loop = true;

    fetch("/api/music")
      .then((r) => r.json())
      .then((data) => {
        if (data?.url && audioRef.current) {
          audioRef.current.src = data.url;
          setMusicTitle(data.title || "背景音乐");
          setHasMusic(true);
          setTimeout(() => setShowPrompt(true), 800);
        }
      })
      .catch(() => {});

    const handleVideoPlay = () => {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        pausedByVideo.current = true;
        setPlaying(false);
      }
    };
    const handleVideoStop = () => {
      if (pausedByVideo.current && audioRef.current) {
        audioRef.current.play().catch(() => {});
        setPlaying(true);
        pausedByVideo.current = false;
      }
    };
    window.addEventListener("invitation-video-play", handleVideoPlay);
    window.addEventListener("invitation-video-stop", handleVideoStop);

    return () => {
      audioRef.current?.pause();
      window.removeEventListener("invitation-video-play", handleVideoPlay);
      window.removeEventListener("invitation-video-stop", handleVideoStop);
    };
  }, []);

  const notifyInteraction = () => {
    window.dispatchEvent(new Event("user-interaction"));
  };

  const playMusic = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.play().catch(() => {});
    setPlaying(true);
    setShowPrompt(false);
    notifyInteraction();
  }, []);

  const dismissPrompt = useCallback(() => {
    setShowPrompt(false);
    notifyInteraction();
  }, []);

  const toggle = () => {
    if (!audioRef.current || !hasMusic) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setPlaying(!playing);
  };

  if (!hasMusic) return null;

  return (
    <>
      {showPrompt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-sm shadow-2xl max-w-xs w-full p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-accent/10 flex items-center justify-center">
              <svg className="w-7 h-7 text-accent" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
            <p className="font-serif text-lg text-primary mb-2">播放背景音乐？</p>
            <p className="text-sm text-text-light mb-6">{musicTitle}</p>
            <div className="flex gap-3">
              <button
                onClick={dismissPrompt}
                className="flex-1 py-2.5 text-sm text-text-light border border-border hover:bg-bg transition-colors"
              >
                稍后再说
              </button>
              <button
                onClick={playMusic}
                className="flex-1 py-2.5 text-sm text-white bg-accent hover:bg-accent/90 transition-colors"
              >
                播放音乐
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={toggle}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-white/90 backdrop-blur-sm border border-border rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
        aria-label={playing ? "暂停音乐" : "播放音乐"}
      >
        <div className={playing ? "animate-gentle-spin" : ""}>
          <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        </div>
      </button>
    </>
  );
}
