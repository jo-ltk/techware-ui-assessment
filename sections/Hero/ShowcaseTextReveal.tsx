"use client";

import {
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  type Ref,
} from "react";
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

/** Midpoint of the 30–50% visibility window requested for the reveal. */
const VISIBLE_RATIO = 0.4;

const IO_THRESHOLDS = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.75, 1];

type Line = {
  text: string;
  className?: string;
};

export type ShowcaseTextRevealHandle = {
  setProgress: (progress: number) => void;
};

type ShowcaseTextRevealProps = {
  lines: Line[];
  className?: string;
  /** Reveal scrub length in px after the text becomes visible. */
  pinDistance?: () => number;
  baseOpacity?: number;
  /**
   * When true, parent drives reveal via ref.setProgress.
   * Skips the independent ScrollTrigger so scene sequencing stays exclusive.
   */
  controlled?: boolean;
  ref?: Ref<ShowcaseTextRevealHandle | null>;
};

function defaultPinDistance() {
  return Math.round(window.innerHeight * 1.2);
}

function visibilityRatio(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const visible =
    Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
  if (visible <= 0) return 0;
  return visible / Math.max(rect.height, 1);
}

export function ShowcaseTextReveal({
  lines,
  className,
  pinDistance = defaultPinDistance,
  baseOpacity = 0.2,
  controlled = false,
  ref,
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

  useImperativeHandle(
    ref,
    () => ({
      setProgress: (progress: number) => {
        applyProgress(Math.min(1, Math.max(0, progress)));
      },
    }),
    // applyProgress closes over totalWords/baseOpacity; recreate when those change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [baseOpacity, totalWords],
  );

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || totalWords === 0) return;

    if (prefersReducedMotion) {
      applyProgress(1);
      return;
    }

    applyProgress(0);

    // Parent timeline owns scene-3 reveal progress.
    if (controlled) return;

    ensureScrollTriggerRegistered();

    let revealST: ScrollTrigger | null = null;

    const armReveal = () => {
      if (revealST) return;

      // Start the scrub from the moment the copy is actually on screen so the
      // word reveal never plays ahead of visibility (e.g. during the hero pin).
      const startScroll = window.scrollY;
      revealST = ScrollTrigger.create({
        start: startScroll,
        end: () => startScroll + pinDistance(),
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => applyProgress(self.progress),
        onRefresh: (self) => applyProgress(self.progress),
      });
    };

    const tryArm = () => {
      if (visibilityRatio(root) >= VISIBLE_RATIO) armReveal();
    };

    tryArm();

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting && entry.intersectionRatio >= VISIBLE_RATIO) {
          armReveal();
        }
      },
      { threshold: IO_THRESHOLDS },
    );
    io.observe(root);

    const onRefresh = () => tryArm();
    ScrollTrigger.addEventListener("refresh", onRefresh);
    requestAnimationFrame(() => {
      tryArm();
      ScrollTrigger.refresh();
    });

    return () => {
      io.disconnect();
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      revealST?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseOpacity, controlled, pinDistance, prefersReducedMotion, totalWords]);

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
