"use client";

import { useInView } from "@/hooks/useInView";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
export default function AboutLogo() {
  const config = useSiteConfig();
  const { ref, inView } = useInView();

  const logoImage = config?.logo_image || null;
  const logoTitle = config?.logo_title || "";
  const logoDesc = config?.logo_desc || "";
  const descParagraphs = logoDesc ? logoDesc.split("\\n").filter(Boolean) : [];

  if (!logoImage && !logoTitle && descParagraphs.length === 0 && config !== null) return null;

  return (
    <section id="about-logo" className="py-24 px-6 bg-bg">
      <div ref={ref} className="max-w-3xl mx-auto">
        <div className={`text-center mb-16 reveal ${inView ? "in-view" : ""}`}>
          <p className="text-sm tracking-[0.2em] text-accent uppercase mb-3">
            About Logo
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-primary">
            关于我们的标志
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-12 md:gap-16">
          <div
            className={`flex-shrink-0 reveal ${inView ? "in-view" : ""}`}
            style={{ "--stagger": 1 } as React.CSSProperties}
          >
            <div className="flex flex-col items-center">
              {logoImage && (
                <img src={logoImage} alt="Logo" className="h-40 md:h-52 object-contain" />
              )}
              {logoTitle && (
                <p className="mt-4 text-sm tracking-[0.25em] text-primary/70 font-light">
                  {logoTitle}
                </p>
              )}
            </div>
          </div>

          {descParagraphs.length > 0 && (
            <div
              className={`reveal ${inView ? "in-view" : ""}`}
              style={{ "--stagger": 2 } as React.CSSProperties}
            >
              {descParagraphs.map((p, i) => (
                <p key={i} className={`text-text-light text-[15px] leading-relaxed ${i < descParagraphs.length - 1 ? "mb-4" : ""}`}>
                  {p}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
