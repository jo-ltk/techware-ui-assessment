import type { NavigationConfig } from "@/types";

export const NAV_DESKTOP_BREAKPOINT = "(min-width: 80rem)";

export const navigation: NavigationConfig = {
  links: [
    {
      label: "Home",
      href: "#hero",
      sectionId: "hero",
    },
    {
      label: "Solution",
      href: "#solution",
      sectionId: "solution",
    },
    {
      label: "Process",
      href: "#process",
      sectionId: "process",
    },
    {
      label: "Industries",
      href: "#industries",
      sectionId: "industries",
    },
    {
      label: "Platform",
      href: "#platform-preview",
      sectionId: "platform-preview",
    },
    {
      label: "Contact",
      href: "#contact",
      sectionId: "contact",
    },
  ],
  signIn: {
    label: "Sign In",
    href: "#sign-in",
  },
};

export const NAV_SECTION_IDS = navigation.links.map((link) => link.sectionId);
