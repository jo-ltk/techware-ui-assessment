"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

type MobileScrollStackProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Mobile Scroll Stack — simple JS pin/scale (no CSS sticky).
 * Sticky never produced a visible stack with these tall cards.
 */
export default function MobileScrollStack({
  children,
  className = "",
}: MobileScrollStackProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const cards = Array.from(
      root.querySelectorAll<HTMLElement>(".scroll-stack-card"),
    );
    if (cards.length < 2) return;

    const tops: number[] = [];
    let viewport = 0;
    let pinEnd = 0;
    let raf = 0;
    const last = cards.map(() => ({ y: 0, s: 1 }));

    const STACK_TOP = 0.1;
    const STACK_STEP = 16;
    const BASE_SCALE = 0.9;
    const SCALE_STEP = 0.035;
    const GAP = 48;

    const measure = () => {
      viewport = window.innerHeight;
      const pinY = viewport * STACK_TOP;

      for (let i = 0; i < cards.length; i++) {
        const prev = cards[i].style.transform;
        cards[i].style.transform = "none";
        tops[i] = cards[i].getBoundingClientRect().top + window.scrollY;
        cards[i].style.transform = prev || "";
      }

      // Release stack once the last card has reached the pin line
      const lastIdx = cards.length - 1;
      pinEnd = tops[lastIdx] - pinY - STACK_STEP * lastIdx + viewport * 0.35;

      // Room for the pinned translate so the footer isn't covered
      const firstStart = tops[0] - pinY;
      const overflow = Math.max(0, Math.round(pinEnd - firstStart));
      root.style.paddingBottom = `${overflow + 24}px`;
    };

    const paint = () => {
      const y = window.scrollY;
      const pinY = viewport * STACK_TOP;

      for (let i = 0; i < cards.length; i++) {
        const start = tops[i] - pinY - STACK_STEP * i;

        let translate = 0;
        if (y > start && y < pinEnd) {
          translate = y - start;
        } else if (y >= pinEnd) {
          translate = Math.max(0, pinEnd - start);
        }

        let covered = 0;
        for (let j = i + 1; j < cards.length; j++) {
          const jStart = tops[j] - pinY - STACK_STEP * j;
          if (y > jStart) covered++;
        }
        const scale = Math.max(BASE_SCALE, 1 - covered * SCALE_STEP);

        const ty = Math.round(translate);
        const sc = Math.round(scale * 1000) / 1000;
        if (last[i].y !== ty || last[i].s !== sc) {
          cards[i].style.transform = `translate3d(0,${ty}px,0) scale(${sc})`;
          last[i] = { y: ty, s: sc };
        }
      }
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        paint();
      });
    };

    const onResize = () => {
      measure();
      for (const L of last) {
        L.y = -1;
        L.s = -1;
      }
      paint();
    };

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      card.style.marginBottom = i < cards.length - 1 ? `${GAP}px` : "0";
      card.style.zIndex = String(i + 1);
      card.style.transformOrigin = "top center";
      card.style.willChange = "transform";
      card.style.backfaceVisibility = "hidden";
    }

    measure();
    paint();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    const imgs = root.querySelectorAll("img");
    imgs.forEach((img) => {
      if (!img.complete) {
        img.addEventListener("load", onResize, { once: true });
      }
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
      root.style.paddingBottom = "";
      for (const card of cards) {
        card.style.transform = "";
        card.style.willChange = "";
        card.style.marginBottom = "";
        card.style.zIndex = "";
      }
    };
  }, []);

  return (
    <div ref={rootRef} className={`relative w-full ${className}`.trim()}>
      {children}
    </div>
  );
}
