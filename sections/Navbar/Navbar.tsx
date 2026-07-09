"use client";

import Image from "next/image";
import { ArrowUpRight, Menu, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { assets, navigation, site } from "@/constants";
import { NAV_SECTION_IDS } from "@/constants/navigation";
import { useReducedMotion, useScrollSpy } from "@/hooks";
import { cn, getFocusableElements, scrollToElement, trapFocus } from "@/utils";

export function Navbar() {
  const activeSectionId = useScrollSpy(NAV_SECTION_IDS);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const drawerTitleId = useId();
  const prefersReducedMotion = useReducedMotion();

  const handleNavigate = useCallback((href: string) => {
    scrollToElement(href);
    setIsMenuOpen(false);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((previous) => !previous);
  }, []);

  const handleLogoClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      handleNavigate("#hero");
    },
    [handleNavigate],
  );

  const handleLinkClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      event.preventDefault();
      handleNavigate(href);
    },
    [handleNavigate],
  );

  const handleSignInClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      handleNavigate(navigation.signIn.href);
    },
    [handleNavigate],
  );

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const drawer = drawerRef.current;
    const focusableElements = drawer ? getFocusableElements(drawer) : [];
    focusableElements[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (drawer) {
        trapFocus(drawer, event);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      menuButtonRef.current?.focus();
    };
  }, [closeMenu, isMenuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full px-4 py-2 transition-[var(--transition-common)] xl:px-10 xl:py-4">
      <nav
        aria-label="Main navigation"
        className={cn(
          "mx-auto flex w-full items-center justify-between gap-4 rounded-pill border-2 px-4 py-1.5 transition-[var(--transition-common)]",
          "min-h-[2.75rem] xl:h-[3.6875rem] xl:min-h-[3.6875rem] xl:py-0",
          "border-border-strong bg-background-elevated shadow-subtle",
        )}
      >
        <a
          href="#hero"
          onClick={handleLogoClick}
          className="flex h-6 shrink-0 items-center xl:h-7"
          aria-label={`${site.name} home`}
        >
          <Image
            src={assets.logo.src}
            alt=""
            width={assets.logo.width}
            height={assets.logo.height}
            priority
            aria-hidden
            className="block h-full w-auto object-contain"
          />
        </a>

        <ul className="hidden flex-1 items-center justify-center gap-6 xl:flex">
          {navigation.links.map((link) => {
            const isActive = activeSectionId === link.sectionId;

            return (
              <li key={link.sectionId}>
                <a
                  href={link.href}
                  onClick={(event) => handleLinkClick(event, link.href)}
                  className={cn(
                    "text-nav whitespace-nowrap text-foreground-disabled transition-[var(--transition-color)] hover:text-foreground",
                    isActive && "text-accent-emphasis hover:text-accent-emphasis",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex shrink-0 items-center gap-2">
          <a
            href={navigation.signIn.href}
            onClick={handleSignInClick}
            className="text-button hidden shrink-0 items-center justify-center gap-2 rounded-pill bg-[image:var(--gradient-nav-button)] px-5 py-2 text-foreground-inverse transition-[var(--transition-common)] hover:opacity-92 xl:inline-flex xl:h-[2.4375rem] xl:py-0"
          >
            {navigation.signIn.label}
            <ArrowUpRight aria-hidden className="size-3.5" strokeWidth={2.25} />
          </a>

          <div className="xl:hidden">
            <button
              ref={menuButtonRef}
              type="button"
              onClick={toggleMenu}
              className="inline-flex size-8 items-center justify-center rounded-full text-foreground motion-safe-transition hover:bg-background-muted"
              aria-expanded={isMenuOpen}
              aria-controls={drawerTitleId}
              aria-label={
                isMenuOpen ? "Close navigation menu" : "Open navigation menu"
              }
            >
              {isMenuOpen ? (
                <X aria-hidden className="size-4" strokeWidth={1.75} />
              ) : (
                <Menu aria-hidden className="size-4" strokeWidth={1.75} />
              )}
            </button>

            <div
              className={cn(
                "fixed inset-0 z-[100] bg-surface-overlay transition-opacity",
                isMenuOpen
                  ? "opacity-100"
                  : "pointer-events-none opacity-0",
              )}
              aria-hidden={!isMenuOpen}
              onClick={closeMenu}
            />

            <aside
              ref={drawerRef}
              id={drawerTitleId}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              aria-hidden={!isMenuOpen}
              inert={!isMenuOpen ? true : undefined}
              className={cn(
                "fixed inset-y-0 right-0 z-[200] flex w-full flex-col gap-8 border-l-2 border-border-strong bg-background-elevated p-6 shadow-glass-elevated",
                !prefersReducedMotion &&
                  "transition-transform duration-[var(--duration-moderate)] ease-[var(--ease-emphasized)]",
                !isMenuOpen && "pointer-events-none",
                isMenuOpen ? "translate-x-0" : "translate-x-full",
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-nav font-medium text-foreground">Menu</p>
                <button
                  type="button"
                  onClick={closeMenu}
                  className="inline-flex size-10 items-center justify-center rounded-full text-foreground motion-safe-transition hover:bg-background-muted"
                  aria-label="Close navigation menu"
                >
                  <X aria-hidden className="size-5" strokeWidth={1.75} />
                </button>
              </div>

              <nav aria-label="Mobile navigation links">
                <ul className="flex flex-col gap-4">
                  {navigation.links.map((link) => {
                    const isActive = activeSectionId === link.sectionId;

                    return (
                      <li key={link.sectionId}>
                        <a
                          href={link.href}
                          onClick={(event) => handleLinkClick(event, link.href)}
                          tabIndex={isMenuOpen ? undefined : -1}
                          className={cn(
                            "text-nav text-foreground-disabled transition-[var(--transition-color)] hover:text-foreground",
                            isActive &&
                              "text-accent-emphasis hover:text-accent-emphasis",
                          )}
                          aria-current={isActive ? "page" : undefined}
                        >
                          {link.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <a
                href={navigation.signIn.href}
                onClick={handleSignInClick}
                tabIndex={isMenuOpen ? undefined : -1}
                className="text-button inline-flex w-full items-center justify-center gap-2 rounded-pill bg-[image:var(--gradient-nav-button)] px-5 py-2 text-foreground-inverse transition-[var(--transition-common)] hover:opacity-92"
              >
                {navigation.signIn.label}
                <ArrowUpRight
                  aria-hidden
                  className="size-3.5"
                  strokeWidth={2.25}
                />
              </a>
            </aside>
          </div>
        </div>
      </nav>
    </header>
  );
}
