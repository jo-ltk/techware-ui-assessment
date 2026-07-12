"use client";

import { useEffect, useRef, useState } from "react";

/** Probe line from the top of the viewport (below the sticky nav). */
const SCROLL_SPY_PROBE_RATIO = 0.28;

/** Hero pin journey: Home → Solution (stats) → Process (showcase copy). */
const HERO_SOLUTION_PROGRESS = 0.2;
const HERO_PROCESS_PROGRESS = 0.68;

const HERO_GROUP = new Set(["hero", "solution", "process"]);

function getDocumentTop(element: HTMLElement): number {
  return element.getBoundingClientRect().top + window.scrollY;
}

function isScrolledToPageEnd(): boolean {
  const scrollBottom = window.scrollY + window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  // Footer is often shorter than the viewport, so its top never crosses the
  // probe line — treat the page end as Contact.
  return scrollBottom >= documentHeight - 2;
}

function resolveActiveSection(sectionIds: readonly string[]): string | null {
  const contact = document.getElementById("contact");

  if (contact) {
    const contactTop = contact.getBoundingClientRect().top;
    const footerInView = contactTop <= window.innerHeight * 0.7;

    if (isScrolledToPageEnd() || footerInView) {
      return "contact";
    }
  } else if (isScrolledToPageEnd()) {
    return sectionIds[sectionIds.length - 1] ?? null;
  }

  const probeY = window.scrollY + window.innerHeight * SCROLL_SPY_PROBE_RATIO;
  const hero = document.getElementById("hero");

  if (hero) {
    const heroTop = getDocumentTop(hero);
    const heroHeight = hero.offsetHeight;
    const heroBottom = heroTop + heroHeight;

    if (heroHeight > 0 && probeY >= heroTop && probeY < heroBottom) {
      const progress = (probeY - heroTop) / heroHeight;

      if (progress < HERO_SOLUTION_PROGRESS) {
        return "hero";
      }

      if (progress < HERO_PROCESS_PROGRESS) {
        return "solution";
      }

      return "process";
    }
  }

  let activeId: string | null = null;

  for (const sectionId of sectionIds) {
    if (HERO_GROUP.has(sectionId) || sectionId === "contact") {
      continue;
    }

    const section = document.getElementById(sectionId);

    if (!section) {
      continue;
    }

    if (getDocumentTop(section) <= probeY) {
      activeId = sectionId;
    }
  }

  if (activeId) {
    return activeId;
  }

  return sectionIds[0] ?? null;
}

export function useScrollSpy(sectionIds: readonly string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(
    sectionIds[0] ?? null,
  );
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (sectionIds.length === 0) {
      return;
    }

    const syncActiveSection = () => {
      frameRef.current = null;
      const nextActiveId = resolveActiveSection(sectionIds);

      setActiveId((previous) =>
        previous === nextActiveId ? previous : nextActiveId,
      );
    };

    const scheduleSync = () => {
      if (frameRef.current !== null) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(syncActiveSection);
    };

    syncActiveSection();
    window.addEventListener("scroll", scheduleSync, { passive: true });
    window.addEventListener("resize", scheduleSync);

    return () => {
      window.removeEventListener("scroll", scheduleSync);
      window.removeEventListener("resize", scheduleSync);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [sectionIds]);

  return activeId;
}
