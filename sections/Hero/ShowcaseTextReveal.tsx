"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useReducedMotion } from "@/hooks";
import { wordRevealOpacity } from "@/lib/motion";
import { cn } from "@/lib/utils";

let scrollTriggerRegistered = false;

function ensureScrollTriggerRegistered() {
  if (!scrollTriggerRegistered) {
    gsap.registerPlugin(ScrollTrigger);
    scrollTriggerRegistered = true;
  }
}

type Line = {
  text: string;
  className?: string;
};

type ShowcaseTextRevealProps = {
  lines: Line[];
  className?: string;
  /** The element ScrollTrigger pins — required when this text lives inside a pin. */
  pinnedContainerRef?: React.RefObject<HTMLElement | null>;
  /**
   * Element whose pin scroll should drive the reveal (usually the pin trigger).
   * When set, progress maps 1:1 to that pin's scrub range so words animate while scrolling.
   */
  scrollTriggerRef?: React.RefObject<HTMLElement | null>;
  animationStart?: string;
  /** Scroll distance after start. Prefer a string so the effect stays stable across renders. */
  animationEnd?: string;
  baseOpacity?: number;
};

export function ShowcaseTextReveal({
  lines,
  className,
  pinnedContainerRef,
  scrollTriggerRef,
  animationStart = "top top+=80",
  animationEnd = "+=120%",
  baseOpacity = 0.2,
}: ShowcaseTextRevealProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const wordEls = useRef<(HTMLSpanElement | null)[]>([]);
  const prefersReducedMotion = useReducedMotion();

  const parsedLines = useMemo(
    () =>
      lines.map((line) => ({
        ...line,
        words: line.text.split(" ").filter(Boolean),
      })),
    [lines],
  );

  const flatWords = useMemo(() => {
    const items: { lineIndex: number; word: string; className?: string }[] =
      [];
    parsedLines.forEach((line, lineIndex) => {
      line.words.forEach((word) => {
        items.push({ lineIndex, word, className: line.className });
      });
    });
    return items;
  }, [parsedLines]);

  const totalWords = flatWords.length;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || totalWords === 0) return;

    const applyProgress = (progress: number) => {
      for (let i = 0; i < totalWords; i++) {
        const el = wordEls.current[i];
        if (!el) continue;
        const opacity = wordRevealOpacity(progress, i, totalWords);
        const mapped =
          baseOpacity + ((opacity - 0.12) / 0.88) * (1 - baseOpacity);
        el.style.opacity = String(mapped);
      }
    };

    if (prefersReducedMotion) {
      applyProgress(1);
      return;
    }

    ensureScrollTriggerRegistered();
    applyProgress(0);

    const pinTrigger = scrollTriggerRef?.current ?? null;
    const pinnedContainer = pinnedContainerRef?.current ?? undefined;

    const ctx = gsap.context(() => {
      // Drive from the pin trigger when available so progress advances for the
      // whole pinned scrub — the text itself stays fixed in the viewport.
      ScrollTrigger.create({
        trigger: pinTrigger ?? root,
        start: animationStart,
        // Match the hero pin distance (1.2vh) so words reveal across the scrub.
        end: pinTrigger
          ? () => `+=${Math.round(window.innerHeight * 1.2)}`
          : animationEnd,
        scrub: true,
        pinnedContainer: pinTrigger ? undefined : pinnedContainer,
        invalidateOnRefresh: true,
        onUpdate: (self) => applyProgress(self.progress),
        onRefresh: (self) => applyProgress(self.progress),
      });

      ScrollTrigger.refresh();
    }, root);

    return () => ctx.revert();
  }, [
    animationEnd,
    animationStart,
    baseOpacity,
    pinnedContainerRef,
    prefersReducedMotion,
    scrollTriggerRef,
    totalWords,
  ]);

  return (
    <div ref={rootRef} className={className}>
      {parsedLines.map((line, lineIndex) => {
        const lineWords = flatWords.filter(
          (item) => item.lineIndex === lineIndex,
        );
        const startIndex = flatWords.findIndex(
          (item) => item.lineIndex === lineIndex,
        );

        return (
          <p
            key={`line-${lineIndex}`}
            className={cn(lineIndex === 0 ? "m-0" : "mt-0", line.className)}
          >
            {lineWords.map((item, localIndex) => {
              const index = startIndex + localIndex;
              return (
                <span
                  key={`${lineIndex}-${index}-${item.word}`}
                  ref={(node) => {
                    wordEls.current[index] = node;
                  }}
                  className="inline"
                  style={{ opacity: prefersReducedMotion ? 1 : baseOpacity }}
                >
                  {item.word}{" "}
                </span>
              );
            })}
          </p>
        );
      })}
    </div>
  );
}
