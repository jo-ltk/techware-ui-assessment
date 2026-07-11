"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type MobileScrollStackProps = {
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
};

function ensureScrollTriggerRegistered() {
  if (typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
}

function parseLength(value: string | number, containerHeight: number) {
  if (typeof value === "string" && value.includes("%")) {
    return (parseFloat(value) / 100) * containerHeight;
  }
  return Number(value);
}

/**
 * Mobile Scroll Stack — restored from commit 466cc58 (GSAP + ScrollTrigger).
 * That version felt smooth on touch. Desktop keeps its own optimized stack.
 */
export default function MobileScrollStack({
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
  useWindowScroll = true,
  onStackComplete,
}: MobileScrollStackProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stackCompletedRef = useRef(false);

  useLayoutEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

    ensureScrollTriggerRegistered();

    const cards = Array.from(
      root.querySelectorAll<HTMLElement>(".scroll-stack-card"),
    );
    const endElement = root.querySelector<HTMLElement>(".scroll-stack-end");
    if (!cards.length) return;

    const scroller = useWindowScroll ? undefined : root;
    const applyRotation = rotationAmount !== 0;
    const applyBlur = blurAmount > 0;
    const pinTriggers: ScrollTrigger[] = [];

    cards.forEach((card, i) => {
      if (i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`;
      }
      card.style.zIndex = String(i + 1);
      gsap.set(card, {
        transformOrigin: "top center",
        force3D: true,
        scale: 1,
        rotation: 0,
        filter: applyBlur ? "blur(0px)" : "none",
      });
    });

    const getViewportHeight = () =>
      useWindowScroll ? window.innerHeight : root.clientHeight;

    const getStackOffset = (index: number) =>
      parseLength(stackPosition, getViewportHeight()) +
      itemStackDistance * index;

    const getScaleEndOffset = () =>
      parseLength(scaleEndPosition, getViewportHeight());

    const updateBlur = () => {
      if (!applyBlur) return;

      let topCardIndex = 0;
      for (let i = 0; i < pinTriggers.length; i++) {
        if (pinTriggers[i]?.isActive) topCardIndex = i;
      }

      cards.forEach((card, i) => {
        if (i >= topCardIndex) {
          gsap.set(card, { filter: "blur(0px)" });
          return;
        }
        gsap.set(card, {
          filter: `blur(${(topCardIndex - i) * blurAmount}px)`,
        });
      });
    };

    const ctx = gsap.context(() => {
      cards.forEach((card, i) => {
        const targetScale = baseScale + i * itemScale;
        const isLast = i === cards.length - 1;

        const pinTrigger = ScrollTrigger.create({
          trigger: card,
          scroller,
          start: () => `top ${getStackOffset(i)}px`,
          endTrigger: endElement ?? cards[cards.length - 1],
          end: "top center",
          pin: true,
          pinSpacing: false,
          invalidateOnRefresh: true,
          onEnter: () => {
            if (!isLast || stackCompletedRef.current) return;
            stackCompletedRef.current = true;
            onStackComplete?.();
          },
          onLeaveBack: () => {
            if (!isLast) return;
            stackCompletedRef.current = false;
          },
          onRefresh: updateBlur,
          onUpdate: updateBlur,
        });

        pinTriggers.push(pinTrigger);

        gsap.to(card, {
          scale: targetScale,
          ...(applyRotation ? { rotation: i * rotationAmount } : null),
          ease: "none",
          scrollTrigger: {
            trigger: card,
            scroller,
            start: () => `top ${getStackOffset(i)}px`,
            end: () => `top ${getScaleEndOffset()}px`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      });

      ScrollTrigger.refresh();
    }, root);

    // Other sections (Hero / WhoItsFor) may settle layout after mount
    const refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 100);

    return () => {
      window.clearTimeout(refreshId);
      stackCompletedRef.current = false;
      ctx.revert();
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
    onStackComplete,
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
            ? // Small runway so pinned cards clear before the footer (pinSpacing: false).
              "scroll-stack-inner pb-16 sm:pb-20"
            : "scroll-stack-inner min-h-screen px-20 pb-[50rem] pt-[20vh]"
        }
      >
        {children}
        <div className="scroll-stack-end h-px w-full" aria-hidden />
      </div>
    </div>
  );
}
