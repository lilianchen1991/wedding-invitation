"use client";

import { useInView } from "@/hooks/useInView";
import { useSiteConfig } from "@/contexts/SiteConfigContext";

interface MilestoneItem {
  date: string;
  title: string;
  content: string;
  photo?: string | null;
  link?: string | null;
}

export default function OurStory() {
  const config = useSiteConfig();
  const { ref: headingRef, inView: headingInView } = useInView();
  const { ref: timelineRef, inView: timelineInView } = useInView();

  const milestones: MilestoneItem[] = config?.milestones ?? [];

  if (milestones.length === 0 && config !== null) return null;

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
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" />

          {milestones.map((item, i) => (
            <div
              key={i}
              className={`relative flex items-start mb-12 last:mb-0 reveal ${
                timelineInView ? "in-view" : ""
              } ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
              style={{ "--stagger": i } as React.CSSProperties}
            >
              <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-accent rounded-full -translate-x-1.5 mt-1.5 z-10" />

              <div
                className={`ml-12 md:ml-0 md:w-1/2 ${
                  i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"
                }`}
              >
                {item.photo ? (
                  <div className="flex items-center gap-4">
                    {i % 2 !== 0 && (
                      <img
                        src={item.photo}
                        alt={item.title}
                        className="w-14 h-14 md:w-20 md:h-20 rounded-full object-cover border-2 border-white shadow-lg shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-xs tracking-widest text-accent uppercase">{item.date}</span>
                      <h3 className="font-serif text-xl text-primary mt-1 mb-2">{item.title}</h3>
                      {item.link ? (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="group text-accent text-sm leading-relaxed hover:text-accent/70 transition-colors">
                          {item.content}
                          <span className="inline-block ml-1 group-hover:translate-x-1 transition-transform animate-bounce-x"> →</span>
                        </a>
                      ) : (
                        <p className="text-text-light text-sm leading-relaxed">{item.content}</p>
                      )}
                    </div>
                    {i % 2 === 0 && (
                      <img
                        src={item.photo}
                        alt={item.title}
                        className="w-14 h-14 md:w-20 md:h-20 rounded-full object-cover border-2 border-white shadow-lg shrink-0"
                      />
                    )}
                  </div>
                ) : (
                  <>
                    <span className="text-xs tracking-widest text-accent uppercase">{item.date}</span>
                    <h3 className="font-serif text-xl text-primary mt-1 mb-2">{item.title}</h3>
                    {item.link ? (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="group text-accent text-sm leading-relaxed hover:text-accent/70 transition-colors">
                        {item.content}
                        <span className="inline-block ml-1 group-hover:translate-x-1 transition-transform animate-bounce-x"> →</span>
                      </a>
                    ) : (
                      <p className="text-text-light text-sm leading-relaxed">{item.content}</p>
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
