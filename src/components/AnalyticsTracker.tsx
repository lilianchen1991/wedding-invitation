"use client";

import { useEffect } from "react";

export default function AnalyticsTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname.startsWith("/admin")) return;
    if ((navigator as unknown as { webdriver?: boolean }).webdriver) return;

    let sessionId = sessionStorage.getItem("_a_sid");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem("_a_sid", sessionId);
    }

    const startTime = Date.now();
    let sent = false;

    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        page_path: window.location.pathname,
        referrer: document.referrer,
      }),
    }).catch(() => {});

    const sendDuration = () => {
      if (sent) return;
      sent = true;
      const duration = Math.round((Date.now() - startTime) / 1000);
      if (duration < 1) return;
      const payload = JSON.stringify({ session_id: sessionId, duration });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/analytics/heartbeat", payload);
      } else {
        fetch("/api/analytics/heartbeat", {
          method: "POST",
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        sendDuration();
      } else {
        sent = false;
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", sendDuration);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", sendDuration);
    };
  }, []);

  return null;
}
