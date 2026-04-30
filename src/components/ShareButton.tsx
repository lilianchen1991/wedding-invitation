"use client";

import { useState, useCallback, useEffect } from "react";

function isWeChat() {
  if (typeof navigator === "undefined") return false;
  return /MicroMessenger/i.test(navigator.userAgent);
}

export default function ShareButton() {
  const [showGuide, setShowGuide] = useState(false);
  const [copied, setCopied] = useState(false);
  const [names, setNames] = useState({ groom: "", bride: "", date: "" });

  useEffect(() => {
    fetch("/api/settings?key=groom_name,bride_name,wedding_date")
      .then((r) => r.json())
      .then((data: { key: string; value: string }[]) => {
        if (!Array.isArray(data)) return;
        const map: Record<string, string> = {};
        data.forEach((i) => { map[i.key] = i.value; });
        setNames({ groom: map.groom_name || "", bride: map.bride_name || "", date: map.wedding_date || "" });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (copied) {
      const t = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(t);
    }
  }, [copied]);

  const handleShare = useCallback(async () => {
    if (isWeChat()) {
      setShowGuide(true);
      return;
    }

    const title = names.groom && names.bride ? `${names.groom} & ${names.bride} | 婚礼邀请` : "婚礼邀请";
    const text = names.date ? `我们诚挚地邀请您参加我们的婚礼 — ${names.date}` : "我们诚挚地邀请您参加我们的婚礼";
    const shareData = {
      title,
      text,
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
    } catch {
      // fallback
    }
  }, [names]);

  return (
    <>
      <button
        onClick={handleShare}
        className="fixed bottom-20 right-6 z-40 w-12 h-12 bg-white/90 backdrop-blur-sm border border-border rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
        aria-label="分享"
      >
        {copied ? (
          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        )}
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-[70] bg-black/70 animate-fade-in"
          onClick={() => setShowGuide(false)}
        >
          <div className="absolute top-4 right-4 flex flex-col items-end">
            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
            </svg>
            <div className="bg-white rounded-lg px-6 py-4 mr-2 max-w-[240px] text-center">
              <p className="text-primary text-[15px] font-medium mb-1">
                点击右上角 ··· 按钮
              </p>
              <p className="text-text-light text-sm">
                选择「发送给朋友」或「分享到朋友圈」
              </p>
            </div>
          </div>
          <p className="absolute bottom-12 left-0 right-0 text-center text-white/70 text-sm">
            点击任意处关闭
          </p>
        </div>
      )}
    </>
  );
}
