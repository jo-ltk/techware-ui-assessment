"use client";

import React, { useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import Lenis from "lenis";

import { useReducedMotion } from "@/hooks";
import { cn } from "@/lib/utils";

export interface ScrollStackItemProps {
  itemClassName?: string;
  children: ReactNode;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({
  children,
  itemClassName = "",
}) => (
  <div
    className={cn("scroll-stack-card relative w-full", itemClassName)}
  >
    {children}
  </div>
);

interface ScrollStackProps {
  className?: string;
  children: ReactNode;
  itemDistance?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  useWindowScroll?: boolean;
  onStackComplete?: () => void;
}

function parseLength(value: string | number, containerHeight: number) {
  if (typeof value === "string" && value.includes("%")) {
    return (parseFloat(value) / 100) * containerHeight;
  }
  return Number(value);
}

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
  itemStackDistance = 30,
  stackPosition = "20%",
  useWindowScroll = false,
  onStackComplete,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stackCompletedRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const resizeRafRef = useRef<number | null>(null);
  const scrollSettleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const isScrollingRef = useRef(false);
  const metricsDirtyRef = useRef(false);
  const lenisRef = useRef<Lenis | null>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const cardTopsRef = useRef<number[]>([]);
  const endTopRef = useRef(0);
  const viewportHeightRef = useRef(0);
  const lastTranslateYRef = useRef(new Map<number, number>());
  const onStackCompleteRef = useRef(onStackComplete);

  useLayoutEffect(() => {
    onStackCompleteRef.current = onStackComplete;
  }, [onStackComplete]);

  useLayoutEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

    const cards = Array.from(
      root.querySelectorAll<HTMLElement>(".scroll-stack-card"),
    );
    const endElement = root.querySelector<HTMLElement>(".scroll-stack-end");
    const inner = root.querySelector<HTMLElement>(".scroll-stack-inner");
    cardsRef.current = cards;
    const translateCache = lastTranslateYRef.current;

    if (!cards.length) return;

    if (prefersReducedMotion) {
      cards.forEach((card, i) => {
        card.style.marginBottom =
          i < cards.length - 1 ? `${Math.min(itemDistance, 48)}px` : "0px";
        card.style.zIndex = "";
        card.style.willChange = "auto";
        card.style.transform = "";
      });
      if (inner && useWindowScroll) inner.style.paddingBottom = "";
      return;
    }

    // Full-width deck stack: no scale — only translateY + z-index so left/right
    // edges stay perfectly aligned verticals across every card.
    cards.forEach((card, i) => {
      card.style.marginBottom =
        i < cards.length - 1 ? `${itemDistance}px` : "0px";
      card.style.zIndex = String(i + 1);
      card.style.willChange = "transform";
      card.style.transform = "translate3d(0, 0, 0)";
    });

    const readViewportHeight = () =>
      useWindowScroll ? window.innerHeight : root.clientHeight;

    const refreshMetrics = () => {
      viewportHeightRef.current = readViewportHeight();
      cardTopsRef.current = cards.map((card) =>
        getLayoutOffset(card, useWindowScroll),
      );
      endTopRef.current = endElement
        ? getLayoutOffset(endElement, useWindowScroll)
        : 0;

      if (useWindowScroll && inner && cards.length > 0) {
        const containerHeight = viewportHeightRef.current;
        const stackPositionPx = parseLength(stackPosition, containerHeight);
        const lastIdx = cards.length - 1;
        const lastCardTop = cardTopsRef.current[lastIdx] ?? 0;
        const pinEnd =
          endTopRef.current - stackPositionPx - itemStackDistance * lastIdx;
        const overflowY =
          pinEnd - lastCardTop + stackPositionPx + itemStackDistance * lastIdx;
        inner.style.paddingBottom = `${Math.max(0, Math.round(overflowY))}px`;
      } else if (inner && useWindowScroll) {
        inner.style.paddingBottom = "";
      }
    };

    const getScrollTop = () =>
      useWindowScroll ? window.scrollY : root.scrollTop;

    const updateCardTransforms = () => {
      if (!cardsRef.current.length) return;

      const scrollTop = getScrollTop();
      const containerHeight = viewportHeightRef.current || readViewportHeight();
      const stackPositionPx = parseLength(stackPosition, containerHeight);
      const endElementTop = endTopRef.current;
      const pinEnd =
        endElementTop -
        stackPositionPx -
        itemStackDistance * Math.max(cardsRef.current.length - 1, 0);

      cardsRef.current.forEach((card, i) => {
        const cardTop = cardTopsRef.current[i] ?? 0;
        const pinStart = cardTop - stackPositionPx - itemStackDistance * i;

        let translateY = 0;
        if (scrollTop >= pinStart && scrollTop <= pinEnd) {
          translateY =
            scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
        } else if (scrollTop > pinEnd) {
          translateY =
            pinEnd - cardTop + stackPositionPx + itemStackDistance * i;
        }

        const lastTranslateY = translateCache.get(i);
        if (lastTranslateY !== translateY) {
          card.style.transform = `translate3d(0, ${translateY}px, 0)`;
          translateCache.set(i, translateY);
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

    const markScrolling = () => {
      isScrollingRef.current = true;
      if (scrollSettleTimerRef.current != null) {
        clearTimeout(scrollSettleTimerRef.current);
      }
      scrollSettleTimerRef.current = setTimeout(() => {
        isScrollingRef.current = false;
        scrollSettleTimerRef.current = null;
        if (metricsDirtyRef.current) {
          metricsDirtyRef.current = false;
          refreshMetrics();
          updateCardTransforms();
        }
      }, 120);
    };

    const scheduleUpdate = () => {
      markScrolling();
      // Window scroll: apply immediately so mobile touch stays 1:1 with scroll.
      if (useWindowScroll) {
        updateCardTransforms();
        return;
      }
      if (scrollRafRef.current != null) return;
      scrollRafRef.current = requestAnimationFrame(() => {
        scrollRafRef.current = null;
        updateCardTransforms();
      });
    };

    const scheduleMetricsRefresh = () => {
      if (isScrollingRef.current) {
        metricsDirtyRef.current = true;
        return;
      }
      if (resizeRafRef.current != null) return;
      resizeRafRef.current = requestAnimationFrame(() => {
        resizeRafRef.current = null;
        refreshMetrics();
        updateCardTransforms();
      });
    };

    refreshMetrics();
    updateCardTransforms();

    const resizeObserver = new ResizeObserver(() => scheduleMetricsRefresh());
    if (inner) resizeObserver.observe(inner);
    else resizeObserver.observe(root);

    const onResize = () => scheduleMetricsRefresh();
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
        syncTouch: false,
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
      if (useWindowScroll) window.removeEventListener("scroll", scheduleUpdate);
      resizeObserver.disconnect();

      if (scrollSettleTimerRef.current != null) {
        clearTimeout(scrollSettleTimerRef.current);
        scrollSettleTimerRef.current = null;
      }
      if (scrollRafRef.current != null) cancelAnimationFrame(scrollRafRef.current);
      if (resizeRafRef.current != null) cancelAnimationFrame(resizeRafRef.current);
      if (animationFrameRef.current != null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (lenisRef.current) lenisRef.current.destroy();

      stackCompletedRef.current = false;
      cardsRef.current = [];
      cardTopsRef.current = [];
      translateCache.clear();
      if (inner && useWindowScroll) inner.style.paddingBottom = "";
    };
  }, [
    itemDistance,
    itemStackDistance,
    stackPosition,
    useWindowScroll,
    prefersReducedMotion,
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
          : { overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" }
      }
    >
      <div
        className={
          useWindowScroll
            ? "scroll-stack-inner"
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
