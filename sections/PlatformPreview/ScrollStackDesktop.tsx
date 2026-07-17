"use client";

import React, { useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import Lenis from "lenis";

import { useReducedMotion } from "@/hooks";

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

/** Toggle ScrollStack perf instrumentation (Step 1 of mobile debug). */
const SCROLL_STACK_DEBUG =
  typeof process !== "undefined" &&
  process.env.NODE_ENV === "development";

const ScrollStackDesktop: React.FC<ScrollStackProps> = ({
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
  const prefersReducedMotion = useReducedMotion();
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
    const transformsCache = lastTransformsRef.current;
    // Perf debug: throttled sampling + counts (dev only).
    let transformFrame = 0;
    let lastTransformSampleAt = 0;
    let transformsAppliedInWindow = 0;
    let refreshCountWindow = 0;
    let resizeObserverCountWindow = 0;
    let windowResizeCountWindow = 0;
    let lastRatesSampleAt = performance.now();
    let writingPaddingBottom = false;

    if (!cards.length) return;

    // Static stacked list — no pin/scale scrub when the user prefers reduced motion.
    if (prefersReducedMotion) {
      cards.forEach((card, i) => {
        card.style.marginBottom =
          i < cards.length - 1 ? `${Math.min(itemDistance, 48)}px` : "0px";
        card.style.zIndex = "";
        card.style.willChange = "auto";
        card.style.transform = "";
        card.style.filter = "none";
        card.style.transformOrigin = "";
        card.style.backfaceVisibility = "";
        card.style.perspective = "";
      });
      if (inner && useWindowScroll) {
        inner.style.paddingBottom = "";
      }
      return;
    }

    cards.forEach((card, i) => {
      if (i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`;
      } else {
        card.style.marginBottom = "0px";
      }
      card.style.zIndex = String(i + 1);
      // Don't permanently promote every card — mobile GPUs pay for large
      // image+shadow layers. will-change is enabled only while scrolling.
      card.style.willChange = "auto";
      card.style.transformOrigin = "left top";
      card.style.backfaceVisibility = "hidden";
      card.style.perspective = "1000px";
      card.style.transform = "translate3d(0, 0, 0) scale(1, 1)";
      if (blurAmount <= 0) {
        card.style.filter = "none";
      }
    });

    const readViewportHeight = () => {
      if (!useWindowScroll) return root.clientHeight;
      // Prefer the layout viewport over window.innerHeight. On iOS/Android
      // chrome show/hide, innerHeight (and visualViewport.height) churn while
      // scrolling; documentElement.clientHeight stays stable and keeps % pin
      // positions from jumping every frame.
      return document.documentElement.clientHeight || window.innerHeight;
    };

    const SCROLL_IDLE_MS = 120;
    let lastScrollTime = 0;
    let metricsRefreshPending = false;
    let willChangeArmed = false;
    let idleCheckRaf: number | null = null;

    const isScrollingNow = () =>
      performance.now() - lastScrollTime < SCROLL_IDLE_MS;

    const setCardWillChange = (card: HTMLElement, value: "transform" | "auto") => {
      if (card.style.willChange !== value) {
        card.style.willChange = value;
      }
    };

    const clearAllWillChange = () => {
      for (const card of cards) setCardWillChange(card, "auto");
      willChangeArmed = false;
    };

    const clearWritingPaddingFlag = () => {
      // ResizeObserver often fires after layout, past a microtask — clear on
      // the next frame so self-inflicted padding writes don't re-enter refresh.
      requestAnimationFrame(() => {
        writingPaddingBottom = false;
      });
    };

    const refreshMetrics = () => {
      if (SCROLL_STACK_DEBUG) {
        console.count("refreshMetrics");
        refreshCountWindow++;
      }

      const prevViewport = viewportHeightRef.current;
      viewportHeightRef.current = readViewportHeight();
      // offsetTop ignores CSS transforms, so no need to reset them (that caused flashes).
      // Layout reads: offsetTop walk — must stay OUT of the scroll/rAF hot path.
      cardTopsRef.current = cards.map((card) =>
        getLayoutOffset(card, useWindowScroll),
      );
      endTopRef.current = endElement
        ? getLayoutOffset(endElement, useWindowScroll)
        : 0;

      // Cards keep a positive translateY after pinning, which overflows their
      // layout box. Pad the inner by that overflow so section/footer spacing
      // isn't covered (and avoid the old 30–40vh runway that left a huge gap).
      if (useWindowScroll && inner && cards.length > 0) {
        const containerHeight = viewportHeightRef.current;
        const stackPositionPx = parseLength(stackPosition, containerHeight);
        const lastIdx = cards.length - 1;
        const lastCardTop = cardTopsRef.current[lastIdx] ?? 0;
        const pinEnd =
          endTopRef.current -
          stackPositionPx -
          itemStackDistance * lastIdx;
        const overflowY =
          pinEnd - lastCardTop + stackPositionPx + itemStackDistance * lastIdx;
        const nextPadding = `${Math.max(0, Math.round(overflowY))}px`;
        if (inner.style.paddingBottom !== nextPadding) {
          if (SCROLL_STACK_DEBUG) {
            console.log("[ScrollStack] paddingBottom write", {
              from: inner.style.paddingBottom,
              to: nextPadding,
              viewportHeight: containerHeight,
              prevViewport,
            });
          }
          writingPaddingBottom = true;
          inner.style.paddingBottom = nextPadding;
          clearWritingPaddingFlag();
        }
      } else if (inner && useWindowScroll) {
        if (inner.style.paddingBottom !== "") {
          writingPaddingBottom = true;
          inner.style.paddingBottom = "";
          clearWritingPaddingFlag();
        }
      }
    };

    const getScrollTop = () =>
      useWindowScroll ? window.scrollY : root.scrollTop;

    const updateCardTransforms = () => {
      if (!cardsRef.current.length) return;

      if (SCROLL_STACK_DEBUG) {
        console.count("updateCardTransforms");
      }

      const scrollTop = getScrollTop();
      // Use cached viewportHeightRef — never re-read live height here.
      // Mid-scroll resize is deferred in scheduleMetricsRefresh (mobile chrome).
      const containerHeight = viewportHeightRef.current || readViewportHeight();
      const stackPositionPx = parseLength(stackPosition, containerHeight);
      const scaleEndPositionPx = parseLength(scaleEndPosition, containerHeight);
      const endElementTop = endTopRef.current;
      const applyBlur = blurAmount > 0;
      const scrolling = isScrollingNow();
      // Release when the end marker reaches the stack — not mid-viewport
      // (that left a half-screen empty band before the footer).
      const pinEnd =
        endElementTop -
        stackPositionPx -
        itemStackDistance * Math.max(cardsRef.current.length - 1, 0);

      let topCardIndex = 0;
      if (applyBlur) {
        for (let j = 0; j < cardsRef.current.length; j++) {
          const jCardTop = cardTopsRef.current[j] ?? 0;
          const jTriggerStart =
            jCardTop - stackPositionPx - itemStackDistance * j;
          if (scrollTop >= jTriggerStart) topCardIndex = j;
        }
      }

      let samplePinStart = 0;
      let sampleTranslateY = 0;
      let sampleScale = 1;
      let cardsStyleUpdated = 0;
      const timed = SCROLL_STACK_DEBUG && transformFrame % 60 === 0;
      if (timed) console.time("updateCardTransforms");

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

        // Whole pixels + short scale — avoids subpixel shimmy while scrubbing.
        const newTransform: CardTransform = {
          translateY: Math.round(translateY),
          scale: Math.round(scale * 1000) / 1000,
          rotation: Math.round(rotation * 100) / 100,
          blur: Math.round(blur * 10) / 10,
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
          cardsStyleUpdated++;
          transformsAppliedInWindow++;
        }

        if (i === 0 || (scrollTop >= pinStart && scrollTop <= pinEnd)) {
          samplePinStart = pinStart;
          sampleTranslateY = newTransform.translateY;
          sampleScale = newTransform.scale;
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

      if (SCROLL_STACK_DEBUG) {
        if (timed) console.timeEnd("updateCardTransforms");
        transformFrame++;
        const now = performance.now();
        if (transformFrame % 60 === 0 || now - lastTransformSampleAt > 1000) {
          lastTransformSampleAt = now;
          console.log("[ScrollStack] sample", {
            scrollTop,
            pinStart: samplePinStart,
            pinEnd,
            translateY: sampleTranslateY,
            scale: sampleScale,
            viewportHeight: containerHeight,
            liveInnerHeight: window.innerHeight,
            layoutViewport: document.documentElement.clientHeight,
            visualViewportHeight: window.visualViewport?.height,
            scrolling,
            cardsStyleUpdated,
            cardCount: cardsRef.current.length,
          });
        }
        if (now - lastRatesSampleAt >= 1000) {
          const elapsedSec = (now - lastRatesSampleAt) / 1000;
          console.log("[ScrollStack] rates/sec", {
            updateCardTransforms: +(transformFrame / elapsedSec).toFixed(1),
            refreshMetrics: +(refreshCountWindow / elapsedSec).toFixed(1),
            ResizeObserver: +(resizeObserverCountWindow / elapsedSec).toFixed(1),
            windowResize: +(windowResizeCountWindow / elapsedSec).toFixed(1),
            styleWrites: +(transformsAppliedInWindow / elapsedSec).toFixed(1),
          });
          transformFrame = 0;
          refreshCountWindow = 0;
          resizeObserverCountWindow = 0;
          windowResizeCountWindow = 0;
          transformsAppliedInWindow = 0;
          lastRatesSampleAt = now;
        }
      }
    };

    const scheduleUpdate = () => {
      if (scrollRafRef.current != null) return;
      scrollRafRef.current = requestAnimationFrame(() => {
        scrollRafRef.current = null;
        updateCardTransforms();
      });
    };

    /** Single rAF poll — no setTimeout churn while the finger is moving. */
    const ensureIdleCheck = () => {
      if (idleCheckRaf != null) return;
      const tick = () => {
        if (isScrollingNow()) {
          idleCheckRaf = requestAnimationFrame(tick);
          return;
        }
        idleCheckRaf = null;
        if (willChangeArmed) clearAllWillChange();
        if (metricsRefreshPending) {
          metricsRefreshPending = false;
          scheduleMetricsRefresh();
        }
      };
      idleCheckRaf = requestAnimationFrame(tick);
    };

    const scheduleMetricsRefresh = () => {
      // Never re-measure pin geometry mid-scroll — Safari/Chrome mobile fire
      // resize + ResizeObserver as the URL bar hides/shows, which forced layout
      // (offsetTop walks) + paddingBottom writes and felt like sticky freezes.
      if (isScrollingNow()) {
        metricsRefreshPending = true;
        ensureIdleCheck();
        if (SCROLL_STACK_DEBUG) {
          console.log("[ScrollStack] metrics refresh deferred (scrolling)");
        }
        return;
      }
      if (resizeRafRef.current != null) return;
      resizeRafRef.current = requestAnimationFrame(() => {
        resizeRafRef.current = null;
        refreshMetrics();
        updateCardTransforms();
      });
    };

    const markScrolling = () => {
      lastScrollTime = performance.now();
      // Promote all cards once per scroll gesture — toggling will-change per
      // card/frame causes layer thrashing that reads as shaking.
      if (!willChangeArmed) {
        for (const card of cards) setCardWillChange(card, "transform");
        willChangeArmed = true;
      }
      ensureIdleCheck();
    };

    refreshMetrics();
    updateCardTransforms();

    // Observe the stack container only — per-card observers re-measure mid-scroll
    // when images decode and cause visible shaking.
    const resizeObserver = new ResizeObserver((entries) => {
      if (SCROLL_STACK_DEBUG) {
        console.count("ResizeObserver");
        resizeObserverCountWindow++;
        const entry = entries[0];
        console.log("[ScrollStack] ResizeObserver", {
          writingPaddingBottom,
          scrolling: isScrollingNow(),
          contentHeight: entry?.contentRect.height,
          paddingBottom: inner?.style.paddingBottom,
          innerHeight: window.innerHeight,
          layoutViewport: document.documentElement.clientHeight,
          visualViewportHeight: window.visualViewport?.height,
        });
      }
      // Self-inflicted: paddingBottom write resized `inner` — skip re-measure
      // to avoid a refresh ↔ observer feedback loop on mobile.
      if (writingPaddingBottom) return;
      scheduleMetricsRefresh();
    });
    if (inner) resizeObserver.observe(inner);
    else resizeObserver.observe(root);

    const onResize = () => {
      if (SCROLL_STACK_DEBUG) {
        console.count("window resize");
        windowResizeCountWindow++;
        console.log("[ScrollStack] window.resize", {
          scrolling: isScrollingNow(),
          innerHeight: window.innerHeight,
          layoutViewport: document.documentElement.clientHeight,
          visualViewportHeight: window.visualViewport?.height,
          scrollY: window.scrollY,
        });
      }
      scheduleMetricsRefresh();
    };
    window.addEventListener("resize", onResize, { passive: true });

    // Image load/decode can change card height after first paint — log once each.
    if (SCROLL_STACK_DEBUG) {
      cards.forEach((card, i) => {
        const imgs = card.querySelectorAll("img");
        imgs.forEach((img) => {
          const logShift = (phase: string) => {
            console.log("[ScrollStack] image layout", {
              card: i,
              phase,
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight,
              clientHeight: img.clientHeight,
              cardOffsetHeight: card.offsetHeight,
            });
          };
          if (img.complete) logShift("already-complete");
          else {
            img.addEventListener("load", () => logShift("load"), { once: true });
          }
        });
      });
    }

    const onWindowScroll = () => {
      markScrolling();
      scheduleUpdate();
    };

    if (useWindowScroll) {
      window.addEventListener("scroll", onWindowScroll, { passive: true });
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

      lenis.on("scroll", () => {
        markScrolling();
        scheduleUpdate();
      });

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
        window.removeEventListener("scroll", onWindowScroll);
      }
      if (idleCheckRaf != null) {
        cancelAnimationFrame(idleCheckRaf);
        idleCheckRaf = null;
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
      clearAllWillChange();
      if (inner && useWindowScroll) {
        inner.style.paddingBottom = "";
      }
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
          : {
              overscrollBehavior: "contain",
              WebkitOverflowScrolling: "touch",
            }
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

export default ScrollStackDesktop;
