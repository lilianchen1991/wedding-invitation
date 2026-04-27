"use client";

import { useState, useEffect } from "react";

interface CountdownProps {
  targetDate: string;
}

export default function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const target = new Date(targetDate).getTime();

    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!mounted) return null;

  const blocks = [
    { value: timeLeft.days, label: "天" },
    { value: timeLeft.hours, label: "时" },
    { value: timeLeft.minutes, label: "分" },
    { value: timeLeft.seconds, label: "秒" },
  ];

  return (
    <div className="flex justify-center gap-4 md:gap-8">
      {blocks.map((block) => (
        <div key={block.label} className="text-center">
          <div className="text-3xl md:text-5xl font-light tabular-nums">
            {String(block.value).padStart(2, "0")}
          </div>
          <div className="text-xs tracking-widest text-white/60 mt-2 uppercase">
            {block.label}
          </div>
        </div>
      ))}
    </div>
  );
}
