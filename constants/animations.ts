/**
 * Motion token names for GSAP, Framer Motion, and scroll-driven animations.
 * Durations and easing always reference CSS variables.
 */
export const animations = {
  duration: {
    instant: "var(--duration-instant)",
    fast: "var(--duration-fast)",
    base: "var(--duration-base)",
    moderate: "var(--duration-moderate)",
    slow: "var(--duration-slow)",
    slower: "var(--duration-slower)",
    scroll: "var(--duration-scroll)",
  },
  easing: {
    linear: "var(--ease-linear)",
    in: "var(--ease-in)",
    out: "var(--ease-out)",
    inOut: "var(--ease-in-out)",
    emphasized: "var(--ease-emphasized)",
    spring: "var(--ease-spring)",
  },
  transition: {
    common: "var(--transition-common)",
    color: "var(--transition-color)",
    transform: "var(--transition-transform)",
    opacity: "var(--transition-opacity)",
  },
} as const;

export const zIndex = {
  behind: "var(--z-behind)",
  base: "var(--z-base)",
  raised: "var(--z-raised)",
  dropdown: "var(--z-dropdown)",
  sticky: "var(--z-sticky)",
  overlay: "var(--z-overlay)",
  modal: "var(--z-modal)",
  toast: "var(--z-toast)",
} as const;
