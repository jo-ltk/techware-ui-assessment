export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function prefersReducedMotion(): boolean {
  return false;
}
