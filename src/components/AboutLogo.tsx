"use client";

import { useInView } from "@/hooks/useInView";
import Logo from "./Logo";

export default function AboutLogo() {
  const { ref, inView } = useInView();

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
          {/* Logo display */}
          <div
            className={`flex-shrink-0 reveal ${inView ? "in-view" : ""}`}
            style={{ "--stagger": 1 } as React.CSSProperties}
          >
            <div className="flex flex-col items-center">
              <Logo className="h-40 md:h-52" color="var(--color-primary)" />
              <p className="mt-4 text-sm tracking-[0.25em] text-primary/70 font-light">
                L & H
              </p>
            </div>
          </div>

          {/* Description */}
          <div
            className={`reveal ${inView ? "in-view" : ""}`}
            style={{ "--stagger": 2 } as React.CSSProperties}
          >
            <p className="text-text-light text-[15px] leading-relaxed mb-4">
              LOGO
              以李连宸（L）与韩丹（H）的首字母为核心创作原型，将两个字母进行极简融合设计：
            </p>
            <p className="text-text-light text-[15px] leading-relaxed mb-4">
              字母「H」以挺拔的衬线字体为骨架，自带高级质感与稳定的支撑感，象征着关系里的可靠与笃定；
            </p>
            <p className="text-text-light text-[15px] leading-relaxed">
              字母「L」则以一条流畅的弧线，嵌入「H」的结构中，既是对「L」的形态化表达，也像一道温柔的桥梁，将两个独立的字母紧紧联结为一体，一眼就能识别出
              &ldquo;两个人的专属印记&rdquo;。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
