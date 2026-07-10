"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { wordRevealOpacity } from "@/lib/motion";

import "./ScrollReveal.css";

let scrollTriggerRegistered = false;

function ensureScrollTriggerRegistered() {
  if (!scrollTriggerRegistered) {
    gsap.registerPlugin(ScrollTrigger);
    scrollTriggerRegistered = true;
  }
}

type ScrollRevealProps = {
  children: React.ReactNode;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  /** Parent pin element — required when this text lives inside a pinned hero. */
  pinnedContainerRef?: React.RefObject<HTMLElement | null>;
  /** Optional shared trigger (e.g. the whole showcase text block). */
  triggerRef?: React.RefObject<HTMLElement | null>;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
  rotationStart?: string;
  rotationEnd?: string;
  wordAnimationStart?: string;
  wordAnimationEnd?: string;
  as?: "h2" | "div" | "p";
};

export function ScrollReveal({
  children,
  pinnedContainerRef,
  triggerRef,
  enableBlur = false,
  baseOpacity = 0.12,
  baseRotation = 0,
  blurStrength = 4,
  containerClassName = "",
  textClassName = "",
  wordAnimationStart = "center center",
  wordAnimationEnd = "+=160%",
  as: ContainerTag = "h2",
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLHeadingElement | HTMLDivElement | HTMLParagraphElement>(null);
  const wordEls = useRef<(HTMLSpanElement | null)[]>([]);

  const words = useMemo(() => {
    const text = typeof children === "string" ? children : "";
    return text.split(/(\s+)/).filter((part) => part.length > 0);
  }, [children]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    ensureScrollTriggerRegistered();

    const wordNodes = wordEls.current.filter(
      (node): node is HTMLSpanElement => node !== null && !node.dataset.space,
    );

    const applyProgress = (progress: number) => {
      const total = wordNodes.length;
      for (let i = 0; i < total; i++) {
        const opacity = wordRevealOpacity(progress, i, total);
        // Remap from 0.12..1 into baseOpacity..1
        const mapped =
          baseOpacity +
          ((opacity - 0.12) / 0.88) * (1 - baseOpacity);
        wordNodes[i].style.opacity = String(mapped);
        if (enableBlur) {
          const blur = (1 - mapped) * blurStrength;
          wordNodes[i].style.filter =
            blur > 0.05 ? `blur(${blur}px)` : "none";
        }
      }
    };

    applyProgress(0);

    if (baseRotation !== 0) {
      gsap.set(el, { transformOrigin: "0% 50%", rotate: baseRotation });
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: triggerRef?.current ?? el,
        start: wordAnimationStart,
        end: wordAnimationEnd,
        scrub: 1.3,
        pinnedContainer: pinnedContainerRef?.current ?? undefined,
        onUpdate: (self) => {
          applyProgress(self.progress);
          if (baseRotation !== 0) {
            gsap.set(el, { rotate: baseRotation * (1 - self.progress) });
          }
        },
      });

      ScrollTrigger.refresh();
    }, el);

    return () => ctx.revert();
  }, [
    baseOpacity,
    baseRotation,
    blurStrength,
    enableBlur,
    pinnedContainerRef,
    triggerRef,
    wordAnimationEnd,
    wordAnimationStart,
    words,
  ]);

  return (
    <ContainerTag
      ref={containerRef}
      className={`scroll-reveal ${containerClassName}`}
    >
      <span className={`scroll-reveal-text ${textClassName}`}>
        {words.map((part, index) => {
          const isSpace = /^\s+$/.test(part);
          if (isSpace) {
            return (
              <span
                key={`space-${index}`}
                ref={(node) => {
                  wordEls.current[index] = node;
                }}
                data-space="true"
              >
                {part}
              </span>
            );
          }
          return (
            <span
              key={`word-${index}`}
              ref={(node) => {
                wordEls.current[index] = node;
              }}
              className="word"
              style={{ opacity: baseOpacity }}
            >
              {part}
            </span>
          );
        })}
      </span>
    </ContainerTag>
  );
}
