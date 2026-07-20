"use client";

import { useLayoutEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Briefcase,
  GraduationCap,
  Landmark,
  Scale,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { assets } from "@/constants";
import { useReducedMotion } from "@/hooks";

const whoItsFor = {
  eyebrow: "Who It's For",
  heading: "Built for workflows where trust is non-negotiable.",
  description: "Wherever credentials matter, Lorem handles the verification",
} as const;

type Industry = {
  label: [string, string];
  icon: LucideIcon;
};

const industries: Industry[] = [
  {
    label: ["Compliance &", "Mobility Teams"],
    icon: ShieldCheck,
  },
  {
    label: ["Immigration", "Law Firms"],
    icon: Scale,
  },
  {
    label: ["Financial", "Institutions"],
    icon: Landmark,
  },
  {
    label: ["Universities &", "Training Institutes"],
    icon: GraduationCap,
  },
  {
    label: ["HR & Recruitment", "Firms"],
    icon: Briefcase,
  },
];

// Orbit pivot aligned to the SVG core (ellipse cx/cy + logo center).
const ORBIT_CENTER_X = (402 / 866) * 100;
const ORBIT_CENTER_Y = (325 / 618) * 100;
// Fixed wide ring — cards stay spaced out (no inward spiral).
const ORBIT_RADIUS_RATIO = 0.44;
const ORBIT_ORIGIN = `${ORBIT_CENTER_X}% ${ORBIT_CENTER_Y}%`;
// Horizontal card nudge. Negative = left, positive = right.
const CARDS_OFFSET_X = -6; // desktop (artboard units @ 866-wide) — more negative = left, positive = right
const CARDS_OFFSET_X_MOBILE = 0; // mobile (pixels) — more negative = left, positive = right
const MOBILE_OFFSET_MAX_WIDTH = 768;
const ROTATIONS = 1;
const FULL_ROTATION = 360 * ROTATIONS;
const PIN_OFFSET_PX = 96;
// Slightly tighter under the nav on smaller laptops so copy + orbit sit higher.
const PIN_OFFSET_LAPTOP_PX = 72;
const LAPTOP_LAYOUT_QUERY = "(min-width: 1280px) and (max-width: 1439.98px)";
// Nav + copy + gaps (+ card overflow past the artboard) reserved while pinned.
// Tall desktops still hit max-w-[54.125rem] unchanged (calc resolves larger than the cap).
const ORBIT_FIT_CHROME = "20.5rem";

function getPinOffsetPx() {
  if (typeof window === "undefined") return PIN_OFFSET_PX;
  return window.matchMedia(LAPTOP_LAYOUT_QUERY).matches
    ? PIN_OFFSET_LAPTOP_PX
    : PIN_OFFSET_PX;
}

let scrollTriggerRegistered = false;

function ensureScrollTriggerRegistered() {
  if (!scrollTriggerRegistered) {
    gsap.registerPlugin(ScrollTrigger);
    scrollTriggerRegistered = true;
  }
}

function getScrollDistance() {
  // Enough scrub room for one full orbit turn.
  return window.innerHeight * 0.85;
}

function getOrbitAngle(index: number) {
  return -90 + index * (360 / industries.length);
}

export function WhoItsFor() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prefersReducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const container = containerRef.current;
    const orbit = orbitRef.current;
    if (!section || !pin || !container || !orbit) return;

    const cards = cardRefs.current.filter(
      (card): card is HTMLDivElement => card !== null,
    );

    if (cards.length !== industries.length) return;

    const applyOrbitRadius = () => {
      const width = container.offsetWidth;
      if (width <= 0) return;

      container.style.setProperty(
        "--orbit-radius",
        `${width * ORBIT_RADIUS_RATIO}px`,
      );

      // Mobile uses raw pixels so the nudge is visible; desktop stays artboard-scaled.
      const offsetPx =
        window.innerWidth < MOBILE_OFFSET_MAX_WIDTH
          ? CARDS_OFFSET_X_MOBILE
          : width * (CARDS_OFFSET_X / 866);
      container.style.setProperty("--cards-offset-x", `${offsetPx}px`);
    };

    applyOrbitRadius();

    gsap.set(orbit, {
      transformOrigin: ORBIT_ORIGIN,
      force3D: true,
    });

    // Keep cards readable when motion is reduced — still position the orbit.
    if (prefersReducedMotion) {
      return () => {
        container.style.removeProperty("--orbit-radius");
        container.style.removeProperty("--cards-offset-x");
      };
    }

    ensureScrollTriggerRegistered();

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power1.inOut" },
        scrollTrigger: {
          trigger: section,
          start: () => `top top+=${getPinOffsetPx()}`,
          end: () => `+=${getScrollDistance()}`,
          pin: pin,
          pinSpacing: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onRefresh: () => {
            applyOrbitRadius();
          },
        },
      });

      // Orbit turns once while cards counter-rotate to stay upright.
      tl.to(orbit, { rotation: FULL_ROTATION, duration: 1 }, 0);
      cards.forEach((card) => {
        tl.to(card, { rotation: -FULL_ROTATION, duration: 1 }, 0);
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());
    }, section);

    const handleResize = () => {
      applyOrbitRadius();
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // Hero/pin layout can settle a frame later — remeasure once more.
    const refreshFrame = requestAnimationFrame(() => {
      handleResize();
    });

    return () => {
      cancelAnimationFrame(refreshFrame);
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
      ctx.revert();
      container.style.removeProperty("--orbit-radius");
      container.style.removeProperty("--cards-offset-x");
    };
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="industries"
      aria-labelledby="who-its-for-heading"
      className="relative z-50 overflow-x-clip bg-transparent px-4 pt-0 pb-6 text-center sm:px-5 sm:pt-2 sm:pb-8 md:px-6 md:pt-3 md:pb-10 xl:-mt-24 xl:pt-0 xl:pb-8 min-[1440px]:-mt-20 min-[1440px]:pt-0 min-[1440px]:pb-10 max-md:[@media(max-height:800px)]:pt-0 max-md:[@media(max-height:800px)]:pb-4"
    >
      {/*
        Soft top fade over the hero folder, then solid page fill.
        Section stays z-50 so the folder bottom is covered once the gradient
        reaches full opacity — no hard cream cut, no dashed-border bleed.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, color-mix(in srgb, var(--color-background) 28%, transparent) 3.5rem, color-mix(in srgb, var(--color-background) 72%, transparent) 8rem, var(--color-background) 13rem, var(--color-background) 100%)",
        }}
      />
      <div
        ref={pinRef}
        className="relative z-10 flex flex-col items-center overflow-visible"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 -left-4 z-[1] w-[min(62vw,22rem)] max-md:bottom-auto max-md:top-0 sm:-left-5 sm:w-[min(48vw,28rem)] md:bottom-0 md:top-auto md:-left-6 md:w-[min(40vw,32rem)] xl:bottom-auto xl:top-0 xl:-left-[5rem] xl:w-[min(60vw,44rem)] min-[1440px]:bottom-0 min-[1440px]:top-auto min-[1440px]:-left-6 min-[1440px]:w-[min(40vw,32rem)]"
        >
          <Image
            src={assets.whoItsFor.gradient.src}
            alt=""
            width={assets.whoItsFor.gradient.width}
            height={assets.whoItsFor.gradient.height}
            sizes="(max-width: 640px) 62vw, (max-width: 1279px) 40vw, (max-width: 1439px) 60vw, 32rem"
            className="h-auto w-full mix-blend-screen"
          />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 -right-[5rem] z-[1] hidden w-[min(60vw,44rem)] -scale-x-100 xl:block min-[1440px]:hidden"
        >
          <Image
            src={assets.whoItsFor.gradient.src}
            alt=""
            width={assets.whoItsFor.gradient.width}
            height={assets.whoItsFor.gradient.height}
            sizes="60vw"
            className="h-auto w-full mix-blend-screen"
          />
        </div>

        <div className="container-content relative z-10 flex flex-col items-center">
        <div className="flex -translate-y-2 flex-col items-center sm:-translate-y-3 md:-translate-y-4 xl:-translate-y-6">
          <p className="inline-flex items-center justify-center gap-1 font-sans text-[length:var(--text-label-size)] font-normal leading-none tracking-[var(--letter-spacing-badge)] text-accent">
            <span aria-hidden className="size-1 rounded-full bg-accent" />
            {whoItsFor.eyebrow}
          </p>

          <h2
            id="who-its-for-heading"
            className="mt-2 max-w-[19.5rem] font-sans text-[1.375rem] font-normal leading-none tracking-[-0.03em] text-foreground [hyphens:none] sm:mt-3 sm:max-w-[32rem] sm:text-[1.75rem] md:max-w-[40rem] md:text-[2.25rem] lg:max-w-[44rem] lg:text-[length:var(--text-section-title-size)] [@media(max-height:800px)]:mt-1.5 sm:[@media(max-height:800px)]:mt-2"
          >
            {whoItsFor.heading}
          </h2>

          <p className="mt-3 max-w-[17.5rem] font-serif text-[0.8125rem] font-normal leading-none tracking-normal text-foreground-muted sm:mt-4 sm:max-w-[28rem] sm:text-[0.9375rem] md:max-w-[36rem] md:text-[length:var(--text-body-large-size)] [@media(max-height:800px)]:mt-2 sm:[@media(max-height:800px)]:mt-2.5">
            {whoItsFor.description}
          </p>
        </div>

        <div
          className="relative mt-10 w-full overflow-visible px-1 pt-2 pb-1 sm:mt-12 sm:px-2 sm:pt-3 sm:pb-2 md:mt-14 md:px-0 md:pt-6 md:pb-4 xl:mt-16 [@media(max-height:800px)]:mt-8 [@media(max-height:800px)]:pt-2 [@media(max-height:800px)]:pb-1 md:[@media(max-height:800px)]:mt-10"
          style={{
            // Shrink on short viewports so the full orbit stays in the pinned frame;
            // tall desktops still resolve to the larger artboard cap.
            maxWidth: `min(68rem, calc((100svh - ${ORBIT_FIT_CHROME}) * 866 / 618))`,
          }}
        >
          <div
            ref={containerRef}
            className="relative mx-auto aspect-[866/618] w-full overflow-visible"
            style={
              {
                // Fallback before JS measures — keeps cards on the ring, not stacked at center.
                "--orbit-radius": "44%",
                "--cards-offset-x": "0px",
              } as CSSProperties
            }
          >
            <Image
              src={assets.whoItsFor.core.src}
              alt=""
              width={assets.whoItsFor.core.width}
              height={assets.whoItsFor.core.height}
              aria-hidden
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 68rem"
              className="pointer-events-none absolute inset-0 z-0 h-full w-full origin-[46.42%_52.59%] scale-[1.22]"
              priority
            />

            <div
              className="absolute inset-0 z-10 overflow-visible"
              style={{
                transform: "translateX(var(--cards-offset-x, 0px))",
              }}
            >
              <div
                ref={orbitRef}
                className="absolute inset-0 overflow-visible will-change-transform"
              >
                {industries.map((industry, index) => {
                  const angle = getOrbitAngle(index);

                  return (
                    <div
                      key={industry.label.join(" ")}
                      className="absolute h-0 w-0"
                      style={{
                        left: `${ORBIT_CENTER_X}%`,
                        top: `${ORBIT_CENTER_Y}%`,
                        transform: `rotate(${angle}deg) translateX(var(--orbit-radius, 40%)) rotate(${-angle}deg)`,
                      }}
                    >
                      <div className="w-fit -translate-x-1/2 -translate-y-1/2">
                        <div
                          ref={(element) => {
                            cardRefs.current[index] = element;
                          }}
                          className="w-fit will-change-transform"
                        >
                          {/* Scale wrapper stays outside GSAP rotate so scrub transforms aren't overwritten */}
                          <div className="w-fit origin-center scale-[0.55] sm:scale-[0.7] md:scale-[0.85] lg:scale-[1] xl:scale-[1.05]">
                            <OrbitCard industry={industry} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <p className="sr-only">{assets.whoItsFor.alt}</p>
        </div>
      </div>
    </section>
  );
}

function OrbitCard({ industry }: { industry: Industry }) {
  const { icon: Icon, label } = industry;
  const fullLabel = label.join(" ");

  return (
    <div className="inline-flex w-fit max-w-none items-center gap-2 rounded-pill border border-white bg-surface-glass-strong px-3 py-2 text-left shadow-subtle backdrop-blur-[6px] sm:gap-2.5 sm:px-3.5 sm:py-2.5">
      <span className="flex size-6 shrink-0 items-center justify-center text-accent sm:size-7">
        <Icon
          aria-hidden
          className="size-4 stroke-[1.75] sm:size-[1.125rem]"
        />
      </span>
      <span
        aria-label={fullLabel}
        className="shrink-0 whitespace-nowrap font-sans text-[0.6875rem] font-medium leading-[1.2] tracking-[-0.02em] text-foreground-muted sm:text-[0.75rem] md:text-[0.8125rem] lg:text-[0.875rem]"
      >
        {label[0]}
        <br />
        {label[1]}
      </span>
    </div>
  );
}
