"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { assets } from "@/constants";
import { useReducedMotion } from "@/hooks";

const whoItsFor = {
  eyebrow: "Who It's For",
  heading: "Built for workflows where trust is non-negotiable.",
  description: "Wherever credentials matter, Lorem handles the verification",
} as const;

type IndustryIcon = (typeof assets.whoItsFor.industries)[keyof typeof assets.whoItsFor.industries];

type Industry = {
  label: string;
  icon: IndustryIcon;
};

const industries: Industry[] = [
  {
    label: "Compliance & Mobility Teams",
    icon: assets.whoItsFor.industries.compliance,
  },
  {
    label: "Immigration Law Firms",
    icon: assets.whoItsFor.industries.immigration,
  },
  {
    label: "Financial Institutions",
    icon: assets.whoItsFor.industries.financial,
  },
  {
    label: "Universities & Training Institutes",
    icon: assets.whoItsFor.industries.universities,
  },
  {
    label: "HR & Recruitment Firms",
    icon: assets.whoItsFor.industries.hr,
  },
];

// Orbit pivot aligned to the SVG core (ellipse cx/cy + logo center).
const ORBIT_CENTER_X = (402 / 866) * 100;
const ORBIT_CENTER_Y = (325 / 618) * 100;
const ORBIT_RADIUS_RATIO = 0.36;
const ORBIT_ORIGIN = `${ORBIT_CENTER_X}% ${ORBIT_CENTER_Y}%`;
// Horizontal card nudge. Negative = left, positive = right.
const CARDS_OFFSET_X = -93; // desktop (artboard units @ 866-wide)
const CARDS_OFFSET_X_MOBILE = -42; // mobile (pixels) — tweak this to slide left/right
const MOBILE_OFFSET_MAX_WIDTH = 768;
const ROTATIONS = 1;
const FULL_ROTATION = 360 * ROTATIONS;
const PIN_OFFSET_PX = 96;

let scrollTriggerRegistered = false;

function ensureScrollTriggerRegistered() {
  if (!scrollTriggerRegistered) {
    gsap.registerPlugin(ScrollTrigger);
    scrollTriggerRegistered = true;
  }
}

function getScrollDistance() {
  // Keep enough scrub room for one orbit turn without a full extra viewport of dead space.
  return window.innerHeight * 0.55;
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

    const updateOrbitRadius = () => {
      const width = container.offsetWidth;
      const radius = width * ORBIT_RADIUS_RATIO;
      container.style.setProperty("--orbit-radius", `${radius}px`);

      // Mobile uses raw pixels so the nudge is visible; desktop stays artboard-scaled.
      const offsetPx =
        window.innerWidth < MOBILE_OFFSET_MAX_WIDTH
          ? CARDS_OFFSET_X_MOBILE
          : width * (CARDS_OFFSET_X / 866);
      container.style.setProperty("--cards-offset-x", `${offsetPx}px`);
    };

    updateOrbitRadius();

    gsap.set(orbit, {
      transformOrigin: ORBIT_ORIGIN,
      force3D: true,
    });

    if (prefersReducedMotion) return;

    ensureScrollTriggerRegistered();

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: `top top+=${PIN_OFFSET_PX}`,
        end: () => `+=${getScrollDistance()}`,
        pin: pin,
        pinSpacing: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const angle = self.progress * FULL_ROTATION;

          gsap.set(orbit, { rotate: angle });
          cards.forEach((card) => {
            gsap.set(card, { rotate: -angle });
          });
        },
      });

      ScrollTrigger.refresh();
    }, section);

    const handleResize = () => {
      updateOrbitRadius();
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      ctx.revert();
    };
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="solution"
      aria-labelledby="who-its-for-heading"
      className="relative overflow-x-hidden bg-background px-4 pt-6 pb-6 text-center sm:px-5 sm:pt-8 sm:pb-8 md:px-6 md:pt-10 md:pb-10"
    >
      <div
        ref={pinRef}
        className="relative z-10 flex flex-col items-center overflow-visible"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 -left-4 z-[1] w-[min(62vw,22rem)] sm:-left-5 sm:w-[min(48vw,28rem)] md:-left-6 md:w-[min(40vw,32rem)]"
        >
          <Image
            src={assets.whoItsFor.gradient.src}
            alt=""
            width={assets.whoItsFor.gradient.width}
            height={assets.whoItsFor.gradient.height}
            className="h-auto w-full mix-blend-screen"
          />
        </div>

        <div className="container-content relative z-10 flex flex-col items-center">
        <p className="inline-flex items-center justify-center gap-1 font-sans text-[length:var(--text-label-size)] font-normal leading-none tracking-[var(--letter-spacing-badge)] text-accent">
          <span aria-hidden className="size-1 rounded-full bg-accent" />
          {whoItsFor.eyebrow}
        </p>

        <h2
          id="who-its-for-heading"
          className="mt-2 max-w-[19.5rem] font-sans text-[1.375rem] font-normal leading-none tracking-[-0.03em] text-foreground [hyphens:none] sm:mt-3 sm:max-w-[32rem] sm:text-[1.75rem] md:max-w-[40rem] md:text-[2.25rem] lg:max-w-[44rem] lg:text-[length:var(--text-section-title-size)]"
        >
          {whoItsFor.heading}
        </h2>

        <p className="mt-3 max-w-[17.5rem] font-serif text-[0.8125rem] font-normal leading-none tracking-normal text-foreground-muted sm:mt-4 sm:max-w-[28rem] sm:text-[0.9375rem] md:max-w-[36rem] md:text-[length:var(--text-body-large-size)]">
          {whoItsFor.description}
        </p>

        <div className="relative mt-7 w-full max-w-[54.125rem] overflow-visible px-1 pt-2 pb-2 sm:mt-7 sm:px-2 sm:pt-3 sm:pb-3 md:mt-8 md:px-0 md:pt-4 md:pb-4">
          <div
            ref={containerRef}
            className="relative mx-auto aspect-[866/618] w-full overflow-visible"
          >
            <Image
              src={assets.whoItsFor.core.src}
              alt=""
              width={assets.whoItsFor.core.width}
              height={assets.whoItsFor.core.height}
              aria-hidden
              className="pointer-events-none absolute inset-0 z-0 h-full w-full"
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
                      key={industry.label}
                      className="absolute h-0 w-0"
                      style={{
                        left: `${ORBIT_CENTER_X}%`,
                        top: `${ORBIT_CENTER_Y}%`,
                        transform: `rotate(${angle}deg) translateX(var(--orbit-radius)) rotate(${-angle}deg)`,
                      }}
                    >
                      <div className="-translate-x-1/2 -translate-y-1/2">
                        <div
                          ref={(element) => {
                            cardRefs.current[index] = element;
                          }}
                          className="will-change-transform"
                        >
                          {/* Scale wrapper stays outside GSAP rotate so scrub transforms aren't overwritten */}
                          <div className="origin-center scale-[0.42] sm:scale-[0.58] md:scale-[0.72] lg:scale-100">
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
  const { icon, label } = industry;

  return (
    <div className="flex w-max max-w-[13rem] items-center gap-3 rounded-pill border-2 border-white bg-surface-glass-strong px-4 py-3 text-left shadow-subtle backdrop-blur-[6px]">
      <span className="flex size-8 shrink-0 items-center justify-center">
        <Image
          src={icon.src}
          alt=""
          width={icon.width}
          height={icon.height}
          aria-hidden
          className="h-5 w-auto"
        />
      </span>
      <span className="font-sans text-[0.8125rem] font-normal leading-none tracking-[-0.03em] text-foreground-muted sm:text-[0.875rem] md:text-[0.9375rem]">
        {label}
      </span>
    </div>
  );
}
