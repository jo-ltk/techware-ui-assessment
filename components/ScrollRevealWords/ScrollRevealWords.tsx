"use client";

import { useMotionValueEvent, useScroll } from "framer-motion";
import * as React from "react";

import { useIsMobile } from "@/hooks/useIsMobile";
import { wordRevealOpacity } from "@/lib/motion";

type ScrollRevealWordsProps = {
  text: string;
  className?: string;
  highlightWords?: string[];
};

export function ScrollRevealWords({
  text,
  className,
  highlightWords = [],
}: ScrollRevealWordsProps) {
  const isMobile = useIsMobile();
  const ref = React.useRef<HTMLParagraphElement | null>(null);
  const wordEls = React.useRef<(HTMLSpanElement | null)[]>([]);
  const words = React.useMemo(() => text.split(" "), [text]);
  const highlightSet = React.useMemo(
    () => new Set(highlightWords.map((w) => w.toLowerCase())),
    [highlightWords],
  );

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: isMobile ? ["start 0.92", "end 0.45"] : ["start 0.9", "end 0.2"],
  });

  const applyWordOpacities = React.useCallback(
    (progress: number) => {
      const total = words.length;
      for (let i = 0; i < total; i++) {
        const el = wordEls.current[i];
        if (el) {
          el.style.opacity = String(wordRevealOpacity(progress, i, total));
        }
      }
    },
    [words.length],
  );

  useMotionValueEvent(scrollYProgress, "change", applyWordOpacities);

  React.useLayoutEffect(() => {
    applyWordOpacities(scrollYProgress.get());
  }, [applyWordOpacities, scrollYProgress]);

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => {
        const clean = word.replace(/[—,.;:!?"]/g, "").toLowerCase();
        const isHighlight = highlightSet.has(clean);
        return (
          <span
            key={`${word}-${i}`}
            ref={(el) => {
              wordEls.current[i] = el;
            }}
            style={{ opacity: 0.12 }}
            className={isHighlight ? "italic" : undefined}
          >
            {word}{" "}
          </span>
        );
      })}
    </p>
  );
}
