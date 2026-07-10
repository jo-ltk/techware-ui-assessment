"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { wordRevealOpacity } from "@/lib/motion";

let scrollTriggerRegistered = false;

function ensureScrollTriggerRegistered() {
  if (!scrollTriggerRegistered) {
    gsap.registerPlugin(ScrollTrigger);
    scrollTriggerRegistered = true;
  }
}

type ScrollRevealWordsProps = {
  text: string;
  className?: string;
  highlightWords?: string[];
  /** Parent pin element — required when this text lives inside a pinned hero. */
  pinnedContainerRef?: React.RefObject<HTMLElement | null>;
  /** Optional shared trigger (e.g. the whole showcase text block). */
  triggerRef?: React.RefObject<HTMLElement | null>;
  /** When the reveal should begin (GSAP ScrollTrigger start). */
  animationStart?: string;
  /** When the reveal should finish (GSAP ScrollTrigger end). Use +=N% for a slow flow. */
  animationEnd?: string;
};

export function ScrollRevealWords({
  text,
  className,
  highlightWords = [],
  pinnedContainerRef,
  triggerRef,
  animationStart = "center center",
  animationEnd = "+=150%",
}: ScrollRevealWordsProps) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const wordEls = useRef<(HTMLSpanElement | null)[]>([]);
  const words = useMemo(() => text.split(" "), [text]);
  const highlightSet = useMemo(
    () => new Set(highlightWords.map((w) => w.toLowerCase())),
    [highlightWords],
  );

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    ensureScrollTriggerRegistered();

    const applyProgress = (progress: number) => {
      const total = words.length;
      for (let i = 0; i < total; i++) {
        const wordEl = wordEls.current[i];
        if (wordEl) {
          wordEl.style.opacity = String(
            wordRevealOpacity(progress, i, total),
          );
        }
      }
    };

    applyProgress(0);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: triggerRef?.current ?? el,
        start: animationStart,
        end: animationEnd,
        scrub: 1.3,
        pinnedContainer: pinnedContainerRef?.current ?? undefined,
        onUpdate: (self) => {
          applyProgress(self.progress);
        },
      });

      ScrollTrigger.refresh();
    }, el);

    return () => ctx.revert();
  }, [
    animationEnd,
    animationStart,
    pinnedContainerRef,
    triggerRef,
    words.length,
  ]);

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => {
        const clean = word.replace(/[—,.;:!?"]/g, "").toLowerCase();
        const isHighlight = highlightSet.has(clean);
        return (
          <span
            key={`${word}-${i}`}
            ref={(node) => {
              wordEls.current[i] = node;
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
