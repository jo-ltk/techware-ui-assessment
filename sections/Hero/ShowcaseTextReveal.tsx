"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
  pinnedContainerRef?: React.RefObject<HTMLElement | null>;
  animationStart?: string;
  animationEnd?: string;
  baseOpacity?: number;
};

export function ShowcaseTextReveal({
  lines,
  className,
  pinnedContainerRef,
  animationStart = "center center",
  animationEnd = "+=160%",
  baseOpacity = 0.2,
}: ShowcaseTextRevealProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const wordEls = useRef<(HTMLSpanElement | null)[]>([]);

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

    ensureScrollTriggerRegistered();

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

    applyProgress(0);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root,
        start: animationStart,
        end: animationEnd,
        scrub: 1.3,
        pinnedContainer: pinnedContainerRef?.current ?? undefined,
        onUpdate: (self) => applyProgress(self.progress),
      });

      ScrollTrigger.refresh();
    }, root);

    return () => ctx.revert();
  }, [
    animationEnd,
    animationStart,
    baseOpacity,
    pinnedContainerRef,
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
                  style={{ opacity: baseOpacity }}
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
