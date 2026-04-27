"use client";

import { useState, useEffect } from "react";
import { useInView } from "@/hooks/useInView";

interface Milestone {
  date: string;
  title: string;
  description: string;
  photoKey?: string;
  link?: string;
}

const MILESTONES: Milestone[] = [
  {
    date: "1991.12.14",
    title: "他来到这个世界",
    description: "冬日里的一份礼物，连宸带着温暖降临。",
    photoKey: "story_photo_lilianchen",
  },
  {
    date: "1994.04.27",
    title: "她来到这个世界",
    description: "春风里的一抹明媚，韩丹带着笑意而来。",
    photoKey: "story_photo_handan",
  },
  {
    date: "2021.10.20",
    title: "初次相遇",
    description: "那一天，我们的故事悄然开始。",
  },
  {
    date: "2022.05.08",
    title: "确定心意",
    description: "当心动变成心定，我们决定携手走下去。",
  },
  {
    date: "2022.05.08 - 2025.11.27",
    title: "我们更多的故事",
    description: "点击查看我们一路走来的甜蜜瞬间",
    link: "https://v.douyin.com/jC9ZgTZhW4c/",
  },
  {
    date: "2025.11.27",
    title: "许下承诺",
    description: "交换戒指的那一刻，未来有了最笃定的方向。",
  },
  {
    date: "2026.06.05",
    title: "携手一生",
    description: "在亲朋好友的见证下，我们将许下一生的承诺。",
  },
];

export default function OurStory() {
  const { ref: headingRef, inView: headingInView } = useInView();
  const { ref: timelineRef, inView: timelineInView } = useInView();
  const [photos, setPhotos] = useState<Record<string, string>>({});

  useEffect(() => {
    const keys = MILESTONES.filter((m) => m.photoKey).map((m) => m.photoKey!);
    keys.forEach((key) => {
      fetch(`/api/settings?key=${key}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.value) {
            setPhotos((prev) => ({ ...prev, [key]: data.value }));
          }
        })
        .catch(() => {});
    });
  }, []);

  return (
    <section id="story" className="py-24 px-6 bg-bg">
      <div className="max-w-3xl mx-auto">
        <div
          ref={headingRef}
          className={`text-center mb-16 reveal ${headingInView ? "in-view" : ""}`}
        >
          <p className="text-sm tracking-[0.2em] text-accent uppercase mb-3">Our Story</p>
          <h2 className="font-serif text-3xl md:text-4xl text-primary">我们的故事</h2>
        </div>

        <div ref={timelineRef} className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" />

          {MILESTONES.map((item, i) => (
            <div
              key={i}
              className={`relative flex items-start mb-12 last:mb-0 reveal ${
                timelineInView ? "in-view" : ""
              } ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
              style={{ "--stagger": i } as React.CSSProperties}
            >
              {/* Dot */}
              <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-accent rounded-full -translate-x-1.5 mt-1.5 z-10" />

              {/* Content */}
              <div
                className={`ml-12 md:ml-0 md:w-1/2 ${
                  i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"
                }`}
              >
                {item.photoKey && photos[item.photoKey] ? (
                  <div className="flex items-center gap-4">
                    {i % 2 !== 0 && (
                      <img
                        src={photos[item.photoKey]}
                        alt={item.title}
                        className="w-14 h-14 md:w-20 md:h-20 rounded-full object-cover border-2 border-white shadow-lg shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      {item.date && (
                        <span className="text-xs tracking-widest text-accent uppercase">
                          {item.date}
                        </span>
                      )}
                      <h3 className="font-serif text-xl text-primary mt-1 mb-2">
                        {item.title}
                      </h3>
                      {item.link ? (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="group text-accent text-sm leading-relaxed hover:text-accent/70 transition-colors">
                          {item.description}
                          <span className="inline-block ml-1 group-hover:translate-x-1 transition-transform animate-bounce-x"> →</span>
                        </a>
                      ) : (
                        <p className="text-text-light text-sm leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                    {i % 2 === 0 && (
                      <img
                        src={photos[item.photoKey]}
                        alt={item.title}
                        className="w-14 h-14 md:w-20 md:h-20 rounded-full object-cover border-2 border-white shadow-lg shrink-0"
                      />
                    )}
                  </div>
                ) : (
                  <>
                    {item.date && (
                      <span className="text-xs tracking-widest text-accent uppercase">
                        {item.date}
                      </span>
                    )}
                    <h3 className="font-serif text-xl text-primary mt-1 mb-2">
                      {item.title}
                    </h3>
                    {item.link ? (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="group text-accent text-sm leading-relaxed hover:text-accent/70 transition-colors">
                        {item.description}
                        <span className="inline-block ml-1 group-hover:translate-x-1 transition-transform animate-bounce-x"> →</span>
                      </a>
                    ) : (
                      <p className="text-text-light text-sm leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
