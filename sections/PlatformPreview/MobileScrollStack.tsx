"use client";

import { Children, isValidElement, type ReactNode } from "react";

import { useReducedMotion } from "@/hooks";
import { cn } from "@/lib/utils";

type MobileScrollStackProps = {
  children: ReactNode;
  className?: string;
  /** Space between cards in document flow (px). */
  itemDistance?: number;
  /** Extra sticky top offset per card so they stack (px). */
  itemStackDistance?: number;
  /** Sticky top for the first card (CSS length, e.g. "12%"). */
  stackPosition?: string;
};

/**
 * Mobile-only card stack. Pure CSS `position: sticky` — no scroll listeners,
 * no transform scrubbing, no ResizeObserver. Native touch scrolling.
 */
export default function MobileScrollStack({
  children,
  className = "",
  itemDistance = 24,
  itemStackDistance = 14,
  stackPosition = "12%",
}: MobileScrollStackProps) {
  const prefersReducedMotion = useReducedMotion();
  const items = Children.toArray(children).filter(isValidElement);

  if (prefersReducedMotion) {
    return (
      <div
        className={cn("flex w-full flex-col", className)}
        style={{ gap: Math.min(itemDistance, 48) }}
      >
        {items}
      </div>
    );
  }

  return (
    <div className={cn("relative w-full", className)}>
      {items.map((child, index) => (
        <div
          key={child.key ?? index}
          className="sticky origin-top"
          style={{
            top: `calc(${stackPosition} + ${index * itemStackDistance}px)`,
            zIndex: index + 1,
            marginBottom:
              index < items.length - 1 ? `${itemDistance}px` : undefined,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
