"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface ScrollStackItemProps {
  itemClassName?: string;
  children: ReactNode;
}

export function ScrollStackItem({
  children,
  itemClassName = "",
}: ScrollStackItemProps) {
  return (
    <div
      className={cn(
        "scroll-stack-card relative w-full origin-top-left",
        itemClassName,
      )}
    >
      {children}
    </div>
  );
}
