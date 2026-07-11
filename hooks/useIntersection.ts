"use client";

import { useEffect, useState, type RefObject } from "react";

export function useIntersection(
  ref: RefObject<Element | null>,
  options?: IntersectionObserverInit,
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  const root = options?.root ?? null;
  const rootMargin = options?.rootMargin ?? "0px";
  const threshold = options?.threshold ?? 0;

  useEffect(() => {
    const element = ref.current;

    if (!element || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(Boolean(entry?.isIntersecting));
      },
      { root, rootMargin, threshold },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, root, rootMargin, threshold]);

  return isIntersecting;
}
