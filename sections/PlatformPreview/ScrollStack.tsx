"use client";

export type { ScrollStackItemProps } from "./ScrollStackItem";
export { ScrollStackItem } from "./ScrollStackItem";

export { default as ScrollStackDesktop } from "./ScrollStackDesktop";
export { default as MobileScrollStack } from "./MobileScrollStack";

/** @deprecated Prefer ScrollStackDesktop / MobileScrollStack. */
export { default } from "./ScrollStackDesktop";
