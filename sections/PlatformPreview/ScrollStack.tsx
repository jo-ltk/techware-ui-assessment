"use client";

import React, { useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import Lenis from "lenis";

export interface ScrollStackItemProps {
  itemClassName?: string;
  children: ReactNode;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({
  children,
  itemClassName = "",
}) => (
  <div
    className={`scroll-stack-card relative w-full origin-top-left will-change-transform ${itemClassName}`.trim()}
  >
    {children}
  </div>
);

interface ScrollStackProps {
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
  rotation: number;
  blur: number;
};

function parseLength(value: string | number, containerHeight: number) {
  if (typeof value === "string" && value.includes("%")) {
    return (parseFloat(value) / 100) * containerHeight;
  }
  return Number(value);
}

function calculateProgress(scrollTop: number, start: number, end: number) {
  if (scrollTop < start) return 0;
  if (scrollTop > end) return 1;
  if (end === start) return 1;
  return (scrollTop - start) / (end - start);
}

/** Layout offset that ignores CSS transforms (stable while cards are pinned). */
function getLayoutOffset(element: HTMLElement, useWindowScroll: boolean) {
  if (!useWindowScroll) return element.offsetTop;

  let top = 0;
  let node: HTMLElement | null = element;
  while (node) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top;
}

const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  className = "",
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = "20%",
  scaleEndPosition = "10%",
  baseScale = 0.85,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = false,
  onStackComplete,
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stackCompletedRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const resizeRafRef = useRef<number | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const cardTopsRef = useRef<number[]>([]);
  const endTopRef = useRef(0);
  const viewportHeightRef = useRef(0);
  const lastTransformsRef = useRef(new Map<number, CardTransform>());
  const onStackCompleteRef = useRef(onStackComplete);
  onStackCompleteRef.current = onStackComplete;

  useLayoutEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

    const cards = Array.from(
      root.querySelectorAll<HTMLElement>(".scroll-stack-card"),
    );
    const endElement = root.querySelector<HTMLElement>(".scroll-stack-end");
    const inner = root.querySelector<HTMLElement>(".scroll-stack-inner");
    cardsRef.current = cards;
    const transformsCache = lastTransformsRef.current;

    if (!cards.length) return;

    cards.forEach((card, i) => {
      if (i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`;
      } else {
        card.style.marginBottom = "0px";
      }
      card.style.zIndex = String(i + 1);
      card.style.willChange = "transform";
      card.style.transformOrigin = "left top";
      card.style.backfaceVisibility = "hidden";
      card.style.perspective = "1000px";
      card.style.transform = "translate3d(0, 0, 0) scale(1, 1)";
      if (blurAmount <= 0) {
        card.style.filter = "none";
      }
    });

    const readViewportHeight = () =>
      useWindowScroll ? window.innerHeight : root.clientHeight;

    const refreshMetrics = () => {
      viewportHeightRef.current = readViewportHeight();
      // offsetTop ignores CSS transforms, so no need to reset them (that caused flashes).
      cardTopsRef.current = cards.map((card) =>
        getLayoutOffset(card, useWindowScroll),
      );
      endTopRef.current = endElement
        ? getLayoutOffset(endElement, useWindowScroll)
        : 0;
    };

    const getScrollTop = () =>
      useWindowScroll ? window.scrollY : root.scrollTop;

    const updateCardTransforms = () => {
      if (!cardsRef.current.length) return;

      const scrollTop = getScrollTop();
      // Freeze viewport height during scroll — mobile chrome show/hide
      // otherwise changes % positions every frame and shakes the stack.
      const containerHeight = viewportHeightRef.current || readViewportHeight();
      const stackPositionPx = parseLength(stackPosition, containerHeight);
      const scaleEndPositionPx = parseLength(scaleEndPosition, containerHeight);
      const endElementTop = endTopRef.current;
      const applyBlur = blurAmount > 0;
      const pinEnd = endElementTop - containerHeight / 2;

      let topCardIndex = 0;
      if (applyBlur) {
        for (let j = 0; j < cardsRef.current.length; j++) {
          const jCardTop = cardTopsRef.current[j] ?? 0;
          const jTriggerStart =
            jCardTop - stackPositionPx - itemStackDistance * j;
          if (scrollTop >= jTriggerStart) topCardIndex = j;
        }
      }

      cardsRef.current.forEach((card, i) => {
        const cardTop = cardTopsRef.current[i] ?? 0;
        const triggerStart =
          cardTop - stackPositionPx - itemStackDistance * i;
        const triggerEnd = cardTop - scaleEndPositionPx;
        const pinStart = triggerStart;

        const scaleProgress = calculateProgress(
          scrollTop,
          triggerStart,
          triggerEnd,
        );
        const targetScale = baseScale + i * itemScale;
        const scale = 1 - scaleProgress * (1 - targetScale);
        const rotation = rotationAmount
          ? i * rotationAmount * scaleProgress
          : 0;

        let blur = 0;
        if (applyBlur && i < topCardIndex) {
          blur = Math.max(0, (topCardIndex - i) * blurAmount);
        }

        let translateY = 0;
        if (scrollTop >= pinStart && scrollTop <= pinEnd) {
          translateY =
            scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
        } else if (scrollTop > pinEnd) {
          translateY =
            pinEnd - cardTop + stackPositionPx + itemStackDistance * i;
        }

        const newTransform: CardTransform = {
          translateY,
          scale,
          rotation,
          blur,
        };

        const lastTransform = transformsCache.get(i);
        // Skip only truly identical frames — rounding/thresholds caused jitter.
        const hasChanged =
          !lastTransform ||
          lastTransform.translateY !== newTransform.translateY ||
          lastTransform.scale !== newTransform.scale ||
          lastTransform.rotation !== newTransform.rotation ||
          lastTransform.blur !== newTransform.blur;

        if (hasChanged) {
          card.style.transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(1, ${newTransform.scale}) rotate(${newTransform.rotation}deg)`;
          if (applyBlur) {
            card.style.filter =
              newTransform.blur > 0 ? `blur(${newTransform.blur}px)` : "none";
          }
          transformsCache.set(i, newTransform);
        }

        if (i === cardsRef.current.length - 1) {
          const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
          if (isInView && !stackCompletedRef.current) {
            stackCompletedRef.current = true;
            onStackCompleteRef.current?.();
          } else if (!isInView && stackCompletedRef.current) {
            stackCompletedRef.current = false;
          }
        }
      });
    };

    const scheduleUpdate = () => {
      if (scrollRafRef.current != null) return;
      scrollRafRef.current = requestAnimationFrame(() => {
        scrollRafRef.current = null;
        updateCardTransforms();
      });
    };

    const scheduleMetricsRefresh = () => {
      if (resizeRafRef.current != null) return;
      resizeRafRef.current = requestAnimationFrame(() => {
        resizeRafRef.current = null;
        refreshMetrics();
        updateCardTransforms();
      });
    };

    refreshMetrics();
    updateCardTransforms();

    // Observe the stack container only — per-card observers re-measure mid-scroll
    // when images decode and cause visible shaking.
    const resizeObserver = new ResizeObserver(() => {
      scheduleMetricsRefresh();
    });
    if (inner) resizeObserver.observe(inner);
    else resizeObserver.observe(root);

    const onResize = () => {
      scheduleMetricsRefresh();
    };
    window.addEventListener("resize", onResize, { passive: true });

    if (useWindowScroll) {
      window.addEventListener("scroll", scheduleUpdate, { passive: true });
    } else if (inner) {
      const lenis = new Lenis({
        wrapper: root,
        content: inner,
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 2,
        infinite: false,
        gestureOrientation: "vertical",
        wheelMultiplier: 1,
        lerp: 0.1,
        syncTouch: true,
        syncTouchLerp: 0.075,
      });

      lenis.on("scroll", scheduleUpdate);

      const raf = (time: number) => {
        lenis.raf(time);
        animationFrameRef.current = requestAnimationFrame(raf);
      };
      animationFrameRef.current = requestAnimationFrame(raf);
      lenisRef.current = lenis;
    }

    return () => {
      window.removeEventListener("resize", onResize);
      if (useWindowScroll) {
        window.removeEventListener("scroll", scheduleUpdate);
      }
      resizeObserver.disconnect();

      if (scrollRafRef.current != null) {
        cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
      if (resizeRafRef.current != null) {
        cancelAnimationFrame(resizeRafRef.current);
        resizeRafRef.current = null;
      }
      if (animationFrameRef.current != null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }

      stackCompletedRef.current = false;
      cardsRef.current = [];
      cardTopsRef.current = [];
      transformsCache.clear();
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
    <div
      className={
        useWindowScroll
          ? `relative w-full ${className}`.trim()
          : `relative h-full w-full overflow-x-visible overflow-y-auto ${className}`.trim()
      }
      ref={scrollerRef}
      style={
        useWindowScroll
          ? undefined
          : {
              overscrollBehavior: "contain",
              WebkitOverflowScrolling: "touch",
            }
      }
    >
      <div
        className={
          useWindowScroll
            ? "scroll-stack-inner pb-[30vh] sm:pb-[40vh]"
            : "scroll-stack-inner min-h-screen px-20 pb-[50rem] pt-[20vh]"
        }
      >
        {children}
        <div className="scroll-stack-end h-px w-full" aria-hidden />
      </div>
    </div>
  );
};

export default ScrollStack;
