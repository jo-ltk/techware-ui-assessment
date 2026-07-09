"use client";

import { useEffect, useRef, useState } from "react";

const SCROLL_SPY_THRESHOLDS = [0, 0.25, 0.5, 0.75, 1] as const;
const SCROLL_SPY_ROOT_MARGIN = "-20% 0px -60% 0px";

function getMostVisibleSection(ratios: Map<string, number>): string | null {
  let activeSection: string | null = null;
  let highestRatio = 0;

  ratios.forEach((ratio, sectionId) => {
    if (ratio > highestRatio) {
      highestRatio = ratio;
      activeSection = sectionId;
    }
  });

  return highestRatio > 0 ? activeSection : null;
}

export function useScrollSpy(sectionIds: readonly string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(
    sectionIds[0] ?? null,
  );
  const visibilityRatiosRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (sectionIds.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibilityRatiosRef.current.set(
            entry.target.id,
            entry.intersectionRatio,
          );
        });

        const nextActiveId = getMostVisibleSection(visibilityRatiosRef.current);

        if (nextActiveId) {
          setActiveId(nextActiveId);
        }
      },
      {
        rootMargin: SCROLL_SPY_ROOT_MARGIN,
        threshold: [...SCROLL_SPY_THRESHOLDS],
      },
    );

    sectionIds.forEach((sectionId) => {
      const section = document.getElementById(sectionId);

      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      observer.disconnect();
      visibilityRatiosRef.current.clear();
    };
  }, [sectionIds]);

  return activeId;
}
