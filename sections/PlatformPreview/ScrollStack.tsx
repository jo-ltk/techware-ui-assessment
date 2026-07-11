"use client";

import React, { useLayoutEffect, useRef, useCallback } from "react";
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
    className={`scroll-stack-card relative w-full origin-top will-change-transform ${itemClassName}`.trim()}
    style={{
      backfaceVisibility: "hidden",
      transform: "translateZ(0)",
    }}
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
  scaleDuration?: number;
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

const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  className = "",
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = "20%",
  scaleEndPosition = "10%",
  baseScale = 0.85,
  scaleDuration = 0.5,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = false,
  onStackComplete,
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stackCompletedRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const windowCleanupRef = useRef<(() => void) | null>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const cardOffsetsRef = useRef<number[]>([]);
  const endOffsetRef = useRef(0);
  const containerHeightRef = useRef(0);
  const layoutWidthRef = useRef(0);
  const lastTransformsRef = useRef(new Map<number, CardTransform>());
  const needsUpdateRef = useRef(false);

  const calculateProgress = useCallback(
    (scrollTop: number, start: number, end: number) => {
      if (scrollTop < start) return 0;
      if (scrollTop > end) return 1;
      return (scrollTop - start) / (end - start);
    },
    [],
  );

  const parsePercentage = useCallback(
    (value: string | number, containerHeight: number) => {
      if (typeof value === "string" && value.includes("%")) {
        return (parseFloat(value) / 100) * containerHeight;
      }
      return parseFloat(value as string);
    },
    [],
  );

  const getScrollTop = useCallback(() => {
    if (useWindowScroll) {
      return window.scrollY;
    }
    return scrollerRef.current?.scrollTop ?? 0;
  }, [useWindowScroll]);

  const measureContainerHeight = useCallback(() => {
    if (useWindowScroll) {
      // Prefer visualViewport when available, but freeze it in layout cache
      // so iOS URL-bar show/hide does not shift pin math mid-scroll.
      return window.visualViewport?.height ?? window.innerHeight;
    }
    return scrollerRef.current?.clientHeight ?? 0;
  }, [useWindowScroll]);

  const cacheLayoutOffsets = useCallback(() => {
    const cards = cardsRef.current;
    const transforms = cards.map((card) => card.style.transform);

    cards.forEach((card) => {
      card.style.transform = "none";
    });

    containerHeightRef.current = measureContainerHeight();
    layoutWidthRef.current = useWindowScroll
      ? window.innerWidth
      : (scrollerRef.current?.clientWidth ?? 0);

    if (useWindowScroll) {
      cardOffsetsRef.current = cards.map(
        (card) => card.getBoundingClientRect().top + window.scrollY,
      );
      const endElement = scrollerRef.current?.querySelector(
        ".scroll-stack-end",
      ) as HTMLElement | null;
      endOffsetRef.current = endElement
        ? endElement.getBoundingClientRect().top + window.scrollY
        : 0;
    } else {
      cardOffsetsRef.current = cards.map((card) => card.offsetTop);
      const endElement = scrollerRef.current?.querySelector(
        ".scroll-stack-end",
      ) as HTMLElement | null;
      endOffsetRef.current = endElement ? endElement.offsetTop : 0;
    }

    cards.forEach((card, i) => {
      card.style.transform = transforms[i] || "translateZ(0)";
    });
  }, [measureContainerHeight, useWindowScroll]);

  const updateCardTransforms = useCallback(() => {
    const cards = cardsRef.current;
    if (!cards.length) return;

    const scrollTop = getScrollTop();
    const containerHeight = containerHeightRef.current || measureContainerHeight();
    const stackPositionPx = parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(
      scaleEndPosition,
      containerHeight,
    );
    const endElementTop = endOffsetRef.current;
    const offsets = cardOffsetsRef.current;
    const transformsCache = lastTransformsRef.current;
    const applyBlur = blurAmount > 0;
    const applyRotation = rotationAmount !== 0;

    let topCardIndex = 0;
    if (applyBlur) {
      for (let j = 0; j < cards.length; j++) {
        const jCardTop = offsets[j];
        if (jCardTop == null) continue;
        const jTriggerStart =
          jCardTop - stackPositionPx - itemStackDistance * j;
        if (scrollTop >= jTriggerStart) {
          topCardIndex = j;
        }
      }
    }

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      if (!card) continue;

      const cardTop = offsets[i];
      if (cardTop == null) continue;

      const triggerStart =
        cardTop - stackPositionPx - itemStackDistance * i;
      const triggerEnd = cardTop - scaleEndPositionPx;
      const pinStart = triggerStart;
      const pinEnd = endElementTop - containerHeight / 2;

      const scaleProgress = calculateProgress(
        scrollTop,
        triggerStart,
        triggerEnd,
      );
      const targetScale = baseScale + i * itemScale;
      const scale = 1 - scaleProgress * (1 - targetScale);
      const rotation = applyRotation
        ? i * rotationAmount * scaleProgress
        : 0;

      let blur = 0;
      if (applyBlur && i < topCardIndex) {
        blur = Math.max(0, (topCardIndex - i) * blurAmount);
      }

      let translateY = 0;
      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

      if (isPinned) {
        translateY =
          scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
      } else if (scrollTop > pinEnd) {
        translateY =
          pinEnd - cardTop + stackPositionPx + itemStackDistance * i;
      }

      const newTransform: CardTransform = {
        translateY: Math.round(translateY * 100) / 100,
        scale: Math.round(scale * 1000) / 1000,
        rotation: Math.round(rotation * 100) / 100,
        blur: Math.round(blur * 100) / 100,
      };

      const lastTransform = transformsCache.get(i);
      const hasChanged =
        !lastTransform ||
        Math.abs(lastTransform.translateY - newTransform.translateY) > 0.1 ||
        Math.abs(lastTransform.scale - newTransform.scale) > 0.001 ||
        Math.abs(lastTransform.rotation - newTransform.rotation) > 0.1 ||
        Math.abs(lastTransform.blur - newTransform.blur) > 0.1;

      if (hasChanged) {
        card.style.transform = applyRotation
          ? `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale}) rotate(${newTransform.rotation}deg)`
          : `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale})`;

        if (applyBlur) {
          card.style.filter =
            newTransform.blur > 0 ? `blur(${newTransform.blur}px)` : "none";
        }

        transformsCache.set(i, newTransform);
      }

      if (i === cards.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (isInView && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!isInView && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    }
  }, [
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    rotationAmount,
    blurAmount,
    onStackComplete,
    calculateProgress,
    parsePercentage,
    getScrollTop,
    measureContainerHeight,
  ]);

  const scheduleUpdate = useCallback(() => {
    needsUpdateRef.current = true;
    if (scrollRafRef.current != null) return;

    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      if (!needsUpdateRef.current) return;
      needsUpdateRef.current = false;
      updateCardTransforms();
    });
  }, [updateCardTransforms]);

  const refreshLayout = useCallback(() => {
    cacheLayoutOffsets();
    lastTransformsRef.current.clear();
    updateCardTransforms();
  }, [cacheLayoutOffsets, updateCardTransforms]);

  const setupLenis = useCallback(() => {
    // Window scroll: native listeners so we don't hijack page scroll
    // (other sections use GSAP ScrollTrigger).
    if (useWindowScroll) {
      const onScroll = () => scheduleUpdate();

      // Ignore iOS URL-bar height jitter; only relayout on real viewport changes.
      const onResize = () => {
        const nextWidth = window.innerWidth;
        const nextHeight = measureContainerHeight();
        const widthChanged = nextWidth !== layoutWidthRef.current;
        const heightDelta = Math.abs(nextHeight - containerHeightRef.current);
        if (!widthChanged && heightDelta < 80) return;
        refreshLayout();
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize, { passive: true });
      window.visualViewport?.addEventListener("resize", onResize, {
        passive: true,
      });

      windowCleanupRef.current = () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        window.visualViewport?.removeEventListener("resize", onResize);
      };

      scheduleUpdate();
      return;
    }

    const scroller = scrollerRef.current;
    if (!scroller) return;

    const lenis = new Lenis({
      wrapper: scroller,
      content: scroller.querySelector(".scroll-stack-inner") as HTMLElement,
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
    return lenis;
  }, [
    measureContainerHeight,
    refreshLayout,
    scheduleUpdate,
    useWindowScroll,
  ]);

  useLayoutEffect(() => {
    if (!useWindowScroll && !scrollerRef.current) return;

    const cards = Array.from(
      scrollerRef.current?.querySelectorAll(".scroll-stack-card") ?? [],
    ) as HTMLElement[];
    cardsRef.current = cards;
    const transformsCache = lastTransformsRef.current;
    const willChangeValue = blurAmount > 0 ? "transform, filter" : "transform";

    cards.forEach((card, i) => {
      if (i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`;
      }
      card.style.zIndex = String(i + 1);
      card.style.willChange = willChangeValue;
      card.style.transformOrigin = "top center";
      card.style.backfaceVisibility = "hidden";
      card.style.transform = "translateZ(0)";
    });

    setupLenis();
    cacheLayoutOffsets();
    updateCardTransforms();

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;
            const { width, height } = entry.contentRect;
            const widthChanged = Math.round(width) !== layoutWidthRef.current;
            const heightDelta = Math.abs(height - containerHeightRef.current);
            // Skip mobile browser-chrome resize noise.
            if (!widthChanged && heightDelta < 80) return;
            refreshLayout();
          })
        : null;

    if (resizeObserver && scrollerRef.current) {
      resizeObserver.observe(scrollerRef.current);
    }

    return () => {
      resizeObserver?.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (scrollRafRef.current != null) {
        cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      if (windowCleanupRef.current) {
        windowCleanupRef.current();
        windowCleanupRef.current = null;
      }
      stackCompletedRef.current = false;
      cardsRef.current = [];
      cardOffsetsRef.current = [];
      endOffsetRef.current = 0;
      containerHeightRef.current = 0;
      layoutWidthRef.current = 0;
      transformsCache.clear();
      needsUpdateRef.current = false;
    };
  }, [
    itemDistance,
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    scaleDuration,
    rotationAmount,
    blurAmount,
    useWindowScroll,
    onStackComplete,
    setupLenis,
    cacheLayoutOffsets,
    updateCardTransforms,
    refreshLayout,
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
              scrollBehavior: "smooth",
              WebkitTransform: "translateZ(0)",
              transform: "translateZ(0)",
              willChange: "scroll-position",
            }
      }
    >
      <div
        className={
          useWindowScroll
            ? "scroll-stack-inner pb-8 sm:pb-12"
            : "scroll-stack-inner min-h-screen px-20 pb-[50rem] pt-[20vh]"
        }
      >
        {children}
        <div className="scroll-stack-end h-px w-full" />
      </div>
    </div>
  );
};

export default ScrollStack;
