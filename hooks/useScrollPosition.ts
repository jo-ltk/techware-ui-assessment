"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SCROLL_THRESHOLD = 1;

export function useScrollPosition(): boolean {
  const [isScrolled, setIsScrolled] = useState(() =>
    typeof window !== "undefined" ? window.scrollY > SCROLL_THRESHOLD : false,
  );
  const frameRef = useRef<number | null>(null);

  const readScrollState = useCallback(() => {
    frameRef.current = null;
    const scrolled = window.scrollY > SCROLL_THRESHOLD;

    setIsScrolled((previous) => (previous === scrolled ? previous : scrolled));
  }, []);

  const handleScroll = useCallback(() => {
    if (frameRef.current !== null) {
      return;
    }

    frameRef.current = window.requestAnimationFrame(readScrollState);
  }, [readScrollState]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [handleScroll]);

  return isScrolled;
}
