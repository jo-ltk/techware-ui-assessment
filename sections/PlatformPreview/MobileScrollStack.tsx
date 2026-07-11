"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

interface MobileScrollStackProps {
  className?: string;
  children: ReactNode;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  rotationAmount?: number;
  blurAmount?: number;
  useWindowScroll?: boolean;
  onStackComplete?: () => void;
}

type CardTransform = {
  translateY: number;
  scale: number;
};

function parseLength(value: string | number, containerHeight: number) {
  if (typeof value === "string" && value.includes("%")) {
    return (parseFloat(value) / 100) * containerHeight;
  }
  return Number(value);
}

function progress(scrollTop: number, start: number, end: number) {
  if (scrollTop <= start) return 0;
  if (scrollTop >= end) return 1;
  if (end === start) return 1;
  return (scrollTop - start) / (end - start);
}

/**
 * Mobile Scroll Stack — same pin/scale effect, touch-tuned hot path:
 * - native window scroll (no Lenis)
 * - one rAF update per frame
 * - cached card tops (no layout reads while scrolling)
 * - stable viewport height (no iOS chrome jump)
 * - resize/remeasure only after scroll settles
 */
export default function MobileScrollStack({
  children,
  className = "",
  itemDistance = 80,
  itemScale = 0.03,
  itemStackDistance = 28,
  stackPosition = "18%",
  scaleEndPosition = "10%",
  baseScale = 0.88,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = true,
  onStackComplete,
}: MobileScrollStackProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const topsRef = useRef<Float64Array>(new Float64Array(0));
  const endTopRef = useRef(0);
  const viewportRef = useRef(0);
  const lastRef = useRef<CardTransform[]>([]);
  const scrollRafRef = useRef(0);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollingRef = useRef(false);
  const pendingMeasureRef = useRef(false);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onStackComplete);

  useLayoutEffect(() => {
    onCompleteRef.current = onStackComplete;
  }, [onStackComplete]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !useWindowScroll) return;

    const inner = root.querySelector<HTMLElement>(".scroll-stack-inner");
    const endEl = root.querySelector<HTMLElement>(".scroll-stack-end");
    const cards = Array.from(
      root.querySelectorAll<HTMLElement>(".scroll-stack-card"),
    );
    if (!cards.length || !inner) return;

    cardsRef.current = cards;
    lastRef.current = cards.map(() => ({ translateY: 0, scale: 1 }));
    topsRef.current = new Float64Array(cards.length);

    const applyRotation = rotationAmount !== 0;

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      card.style.marginBottom =
        i < cards.length - 1 ? `${itemDistance}px` : "0px";
      card.style.zIndex = String(i + 1);
      card.style.transformOrigin = "top center";
      card.style.backfaceVisibility = "hidden";
      card.style.willChange = "auto";
      card.style.transform = "translate3d(0,0,0) scale(1)";
      card.style.filter = "none";
    }

    const readViewport = () =>
      document.documentElement.clientHeight || window.innerHeight;

    const measure = () => {
      // offsetTop walk ignores CSS transforms — no need to clear them (avoids flash).
      for (let i = 0; i < cards.length; i++) {
        let top = 0;
        let node: HTMLElement | null = cards[i];
        while (node) {
          top += node.offsetTop;
          node = node.offsetParent as HTMLElement | null;
        }
        topsRef.current[i] = top;
      }

      if (endEl) {
        let top = 0;
        let node: HTMLElement | null = endEl;
        while (node) {
          top += node.offsetTop;
          node = node.offsetParent as HTMLElement | null;
        }
        endTopRef.current = top;
      } else {
        endTopRef.current = 0;
      }

      viewportRef.current = readViewport();

      const vh = viewportRef.current;
      const stackPx = parseLength(stackPosition, vh);
      const last = cards.length - 1;
      const lastTop = topsRef.current[last] ?? 0;
      const pinEnd = endTopRef.current - vh / 2;
      const overflow =
        pinEnd - lastTop + stackPx + itemStackDistance * last;
      const pad = `${Math.max(0, Math.round(overflow)) + 24}px`;
      if (inner.style.paddingBottom !== pad) {
        inner.style.paddingBottom = pad;
      }
    };

    const paint = () => {
      const scrollTop = window.scrollY;
      const vh = viewportRef.current || readViewport();
      const stackPx = parseLength(stackPosition, vh);
      const scaleEndPx = parseLength(scaleEndPosition, vh);
      const pinEnd = endTopRef.current - vh / 2;
      const tops = topsRef.current;
      const last = lastRef.current;
      const n = cards.length;

      for (let i = 0; i < n; i++) {
        const card = cards[i];
        const cardTop = tops[i];
        const pinStart = cardTop - stackPx - itemStackDistance * i;
        const triggerEnd = cardTop - scaleEndPx;

        const t = progress(scrollTop, pinStart, triggerEnd);
        const targetScale = baseScale + i * itemScale;
        const scale = 1 - t * (1 - targetScale);

        let translateY = 0;
        if (scrollTop >= pinStart && scrollTop <= pinEnd) {
          translateY = scrollTop - cardTop + stackPx + itemStackDistance * i;
        } else if (scrollTop > pinEnd) {
          translateY = pinEnd - cardTop + stackPx + itemStackDistance * i;
        }

        // Whole pixels = cleaner compositor on mobile GPUs.
        const ty = (translateY + 0.5) | 0;
        const sc = Math.round(scale * 1000) / 1000;
        const prev = last[i];

        if (
          !prev ||
          prev.translateY !== ty ||
          Math.abs(prev.scale - sc) > 0.001
        ) {
          if (applyRotation) {
            const rot = i * rotationAmount * t;
            card.style.transform = `translate3d(0,${ty}px,0) scale(${sc}) rotate(${rot}deg)`;
          } else {
            card.style.transform = `translate3d(0,${ty}px,0) scale(${sc})`;
          }
          last[i] = { translateY: ty, scale: sc };
        }

        if (i === n - 1) {
          const inView = scrollTop >= pinStart && scrollTop <= pinEnd;
          if (inView && !completedRef.current) {
            completedRef.current = true;
            onCompleteRef.current?.();
          } else if (!inView && completedRef.current) {
            completedRef.current = false;
          }
        }
      }

      // blur unused in this section — omitted from the hot path on purpose.
    };

    const schedulePaint = () => {
      if (scrollRafRef.current) return;
      scrollRafRef.current = requestAnimationFrame(() => {
        scrollRafRef.current = 0;
        paint();
      });
    };

    const armWillChange = () => {
      for (const card of cards) {
        if (card.style.willChange !== "transform") {
          card.style.willChange = "transform";
        }
      }
    };

    const clearWillChange = () => {
      for (const card of cards) {
        card.style.willChange = "auto";
      }
    };

    const onScroll = () => {
      scrollingRef.current = true;
      armWillChange();
      schedulePaint();

      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        scrollingRef.current = false;
        clearWillChange();
        if (pendingMeasureRef.current) {
          pendingMeasureRef.current = false;
          measure();
          paint();
        }
      }, 120);
    };

    const onResize = () => {
      // Never remeasure mid-scroll — iOS URL bar fires resize constantly.
      if (scrollingRef.current) {
        pendingMeasureRef.current = true;
        return;
      }
      measure();
      lastRef.current = cards.map(() => ({ translateY: -1, scale: -1 }));
      paint();
    };

    measure();
    paint();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });

    // Images can change height after decode — one-shot, not continuous RO.
    const onImgLoad = () => {
      if (scrollingRef.current) {
        pendingMeasureRef.current = true;
        return;
      }
      measure();
      paint();
    };
    const imgs = root.querySelectorAll("img");
    imgs.forEach((img) => {
      if (!img.complete) {
        img.addEventListener("load", onImgLoad, { once: true });
      }
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      clearWillChange();
      inner.style.paddingBottom = "";
      cardsRef.current = [];
      completedRef.current = false;
    };
  }, [
    itemDistance,
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    rotationAmount,
    blurAmount,
    useWindowScroll,
  ]);

  return (
    <div ref={rootRef} className={`relative w-full ${className}`.trim()}>
      <div className="scroll-stack-inner">
        {children}
        <div className="scroll-stack-end h-px w-full" aria-hidden />
      </div>
    </div>
  );
}
