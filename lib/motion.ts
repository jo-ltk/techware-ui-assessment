/** Opacity for staggered word reveal driven by a single scroll progress value. */
export function wordRevealOpacity(
  progress: number,
  index: number,
  total: number,
): number {
  const start = index / total;
  const end = (index + 1) / total;
  if (progress <= start) return 0.12;
  if (progress >= end) return 1;
  return 0.12 + ((progress - start) / (end - start)) * 0.88;
}
