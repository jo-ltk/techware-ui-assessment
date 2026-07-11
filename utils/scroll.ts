function resolveTargetId(target: string): string {
  return target.startsWith("#") ? target.slice(1) : target;
}

export function getScrollProgress(): number {
  const scrollableHeight =
    document.documentElement.scrollHeight - window.innerHeight;

  if (scrollableHeight <= 0) {
    return 0;
  }

  return window.scrollY / scrollableHeight;
}

/** Scroll offsets within the hero pin for nested nav targets. */
const HERO_SECTION_PROGRESS: Record<string, number> = {
  solution: 0.28,
  process: 0.62,
};

function scrollToHeroProgress(progress: number, behavior: ScrollBehavior): void {
  const hero = document.getElementById("hero");

  if (!hero) {
    return;
  }

  const heroTop = hero.getBoundingClientRect().top + window.scrollY;
  const top = heroTop + hero.offsetHeight * progress - window.innerHeight * 0.28;

  window.scrollTo({ top: Math.max(0, top), behavior });
}

export function scrollToElement(target: string): void {
  const targetId = resolveTargetId(target);
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const behavior: ScrollBehavior = prefersReducedMotion ? "auto" : "smooth";

  const heroProgress = HERO_SECTION_PROGRESS[targetId];

  if (heroProgress !== undefined) {
    scrollToHeroProgress(heroProgress, behavior);
    return;
  }

  const element = document.getElementById(targetId);

  if (!element) {
    return;
  }

  element.scrollIntoView({
    behavior,
    block: "start",
  });
}
