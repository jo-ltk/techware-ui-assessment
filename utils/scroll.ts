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

export function scrollToElement(target: string): void {
  const targetId = resolveTargetId(target);
  const element = document.getElementById(targetId);

  if (!element) {
    return;
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  element.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "start",
  });
}
