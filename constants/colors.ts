/**
 * Semantic color token names for use in JS/TS (GSAP, Framer Motion, etc.).
 * Values resolve from CSS variables — never hardcode hex in components.
 */
export const colors = {
  background: "var(--color-background)",
  backgroundElevated: "var(--color-background-elevated)",
  backgroundMuted: "var(--color-background-muted)",
  backgroundInverse: "var(--color-background-inverse)",

  foreground: "var(--color-foreground)",
  foregroundMuted: "var(--color-foreground-muted)",
  foregroundSubtle: "var(--color-foreground-subtle)",
  foregroundDisabled: "var(--color-foreground-disabled)",
  foregroundInverse: "var(--color-foreground-inverse)",
  foregroundFaded: "var(--color-foreground-faded)",

  accent: "var(--color-accent)",
  accentStrong: "var(--color-accent-strong)",
  accentEmphasis: "var(--color-accent-emphasis)",

  border: "var(--color-border)",
  borderStrong: "var(--color-border-strong)",

  surfaceGlass: "var(--color-surface-glass)",
  surfaceGlassStrong: "var(--color-surface-glass-strong)",
  surfaceGlassSoft: "var(--color-surface-glass-soft)",
  surfaceOverlay: "var(--color-surface-overlay)",

  white: "var(--color-white)",
  black: "var(--color-black)",
} as const;

export const gradients = {
  goldText: "var(--gradient-gold-text)",
  primaryButton: "var(--gradient-primary-button)",
  navButton: "var(--gradient-nav-button)",
  sectionFade: "var(--gradient-section-fade)",
  pageFade: "var(--gradient-page-fade)",
} as const;
