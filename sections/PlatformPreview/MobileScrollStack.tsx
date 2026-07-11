"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  Children,
  isValidElement,
  useRef,
  type ReactElement,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

type MobileScrollStackProps = {
  children: ReactNode;
  className?: string;
};

type StickyCardProps = {
  index: number;
  count: number;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
  children: ReactNode;
};

/**
 * Skiper-style sticky card (mobile):
 * - CSS sticky pins the card (native touch scroll — not JS translateY)
 * - Framer useTransform scales it as later cards stack over it
 * - No Lenis root (avoids fighting page / GSAP scroll)
 */
function StickyStackCard({
  index,
  count,
  progress,
  range,
  targetScale,
  children,
}: StickyCardProps) {
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div
      // Must be a direct child of the scroll container so sticky has room to pin.
      className="sticky flex w-full justify-center"
      style={{
        top: `calc(5% + ${index * 16}px)`,
        zIndex: index + 1,
        // Leave space after each card so the next one can scroll up and cover it.
        marginBottom: index < count - 1 ? "1.5rem" : 0,
        paddingBottom: index === count - 1 ? "1rem" : 0,
      }}
    >
      <motion.div
        style={{ scale }}
        className="w-full origin-top"
      >
        {children}
      </motion.div>
    </div>
  );
}

export default function MobileScrollStack({
  children,
  className = "",
}: MobileScrollStackProps) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const items = Children.toArray(children).filter(
    isValidElement,
  ) as ReactElement[];
  const count = items.length;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  if (prefersReducedMotion || count === 0) {
    return (
      <div className={cn("flex w-full flex-col gap-5", className)}>{items}</div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative flex w-full flex-col pb-8", className)}
    >
      {items.map((child, i) => {
        const targetScale = Math.max(0.88, 1 - (count - i - 1) * 0.04);
        const range: [number, number] = [i / count, 1];

        return (
          <StickyStackCard
            key={child.key ?? i}
            index={i}
            count={count}
            progress={scrollYProgress}
            range={range}
            targetScale={targetScale}
          >
            {child}
          </StickyStackCard>
        );
      })}
    </div>
  );
}
