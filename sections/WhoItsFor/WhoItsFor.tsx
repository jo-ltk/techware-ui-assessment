"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Briefcase,
  GraduationCap,
  Landmark,
  Scale,
  Users,
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
  label: string;
  Icon: LucideIcon;
};

const industries: Industry[] = [
  { label: "Compliance & Mobility Teams", Icon: Users },
  { label: "Immigration Law Firms", Icon: Scale },
  { label: "Financial Institutions", Icon: Landmark },
  { label: "Universities & Training Institutes", Icon: GraduationCap },
  { label: "HR & Recruitment Firms", Icon: Briefcase },
];

// Orbit pivot aligned to the SVG core (ellipse cx/cy + logo center).
const ORBIT_CENTER_X = (402 / 866) * 100;
const ORBIT_CENTER_Y = (325 / 618) * 100;
const ORBIT_RADIUS_RATIO = 0.36;
const ORBIT_ORIGIN = `${ORBIT_CENTER_X}% ${ORBIT_CENTER_Y}%`;
// Nudge all cards horizontally without changing rotation (negative = left).
const CARDS_OFFSET_X = -93;
const ROTATIONS = 3;
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
  return window.innerHeight * ROTATIONS * 1.5;
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
      const radius = container.offsetWidth * ORBIT_RADIUS_RATIO;
      container.style.setProperty("--orbit-radius", `${radius}px`);
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
      className="relative bg-background px-5 pt-20 pb-10 text-center sm:px-6 sm:pt-24 md:pt-28 lg:pb-16"
    >
      <div
        ref={pinRef}
        className="container-content relative z-10 flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center overflow-visible"
      >
        <p className="text-label inline-flex items-center justify-center gap-1 font-medium">
          <span aria-hidden className="size-1 rounded-full bg-accent" />
          {whoItsFor.eyebrow}
        </p>

        <h2
          id="who-its-for-heading"
          className="text-section-title mt-3 max-w-[44rem] text-[clamp(2.25rem,4.8vw,var(--text-section-title-size))] text-foreground"
        >
          {whoItsFor.heading}
        </h2>

        <p className="text-body mt-4 max-w-[36rem]">{whoItsFor.description}</p>

        <div className="relative mt-10 w-full max-w-[54.125rem] overflow-visible py-10 sm:mt-12 sm:py-12">
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
              style={{ transform: `translateX(${CARDS_OFFSET_X}px)` }}
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
                    className="absolute h-0 w-0 "
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
                        <OrbitCard industry={industry} />
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
    </section>
  );
}

function OrbitCard({ industry }: { industry: Industry }) {
  const { Icon, label } = industry;

  return (
    <div className="flex w-max max-w-[13rem] items-center gap-3 rounded-pill border-2 border-white bg-surface-glass-strong px-4 py-3 text-left shadow-subtle backdrop-blur-[6px]">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full text-accent-strong">
        <Icon aria-hidden className="size-5" strokeWidth={1.75} />
      </span>
      <span className="text-[0.9375rem] font-medium leading-tight tracking-[-0.02em] text-foreground-muted">
        {label}
      </span>
    </div>
  );
}
