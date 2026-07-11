"use client";

import type { ReactNode } from "react";

import { useMediaQuery } from "@/hooks";

import ScrollStackDesktop from "./ScrollStackDesktop";
import ScrollStackMobile from "./ScrollStackMobile";

export type { ScrollStackItemProps } from "./ScrollStackItem";
export { ScrollStackItem } from "./ScrollStackItem";

export interface ScrollStackProps {
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

/** lg (1024px): optimized desktop stack; below: original touch-friendly stack. */
export default function ScrollStack(props: ScrollStackProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  if (isDesktop) {
    return <ScrollStackDesktop {...props} />;
  }

  return <ScrollStackMobile {...props} />;
}
