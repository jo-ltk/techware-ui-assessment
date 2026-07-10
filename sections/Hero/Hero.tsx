"use client";

import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Play } from "lucide-react";
import { useLayoutEffect, useRef } from "react";

import { assets } from "@/constants";
import { useReducedMotion } from "@/hooks";

import { FolderFlap } from "./FolderFlap";
import { ShowcaseTextReveal } from "./ShowcaseTextReveal";

const hero = {
  headline: {
    line1: "Verification That",
    line2: "Starts At The Source.",
  },
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  ctas: {
    primary: { label: "Book a Demo", href: "#contact" },
    secondary: { label: "See how it works", href: "#process" },
  },
  showcase: {
    heading:
      "PDFs get forged. Emails get lost. Manual checks create liability.",
    description:
      "Techware replaces static documents with cryptographically signed credentials issued directly from the source, with a full audit trail.",
    stats: {
      left: { value: "250+", label: "trusted organizations" },
      right: { value: "10,000+", label: "credentials verified securely" },
    },
  },
} as const;

const PIN_OFFSET_PX = 80;

let scrollTriggerRegistered = false;

function ensureScrollTriggerRegistered() {
  if (!scrollTriggerRegistered) {
    gsap.registerPlugin(ScrollTrigger);
    scrollTriggerRegistered = true;
  }
}

function getScrollDistance() {
  return window.innerHeight * 1.2;
}

function MobileShowcase() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const phoneRef = useRef<HTMLDivElement | null>(null);
  const leftCardRef = useRef<HTMLDivElement | null>(null);
  const rightCardRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const phone = phoneRef.current;
    const leftCard = leftCardRef.current;
    const rightCard = rightCardRef.current;
    if (!section || !pin || !phone || !leftCard || !rightCard) return;

    const movingElements = [phone, leftCard, rightCard];
    gsap.set(phone, { xPercent: -50, y: 110, force3D: true });
    gsap.set([leftCard, rightCard], { y: 110, force3D: true });
    if (prefersReducedMotion) {
      gsap.set(phone, { xPercent: -50, y: 0 });
      gsap.set([leftCard, rightCard], { y: 0 });
      return;
    }

    ensureScrollTriggerRegistered();
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top+=80",
          end: () => `+=${getScrollDistance()}`,
          pin,
          pinSpacing: true,
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      });
      // A shared tween keeps all three floating elements in formation for the
      // full scrubbed rise while preserving their independent stacking order.
      timeline.to(movingElements, { y: -160, ease: "power1.out", duration: 0.65 }, 0);
      timeline.to({}, { duration: 0.35 });
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }, section);
    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <div ref={sectionRef} className="relative mt-10 block w-full max-w-[44rem] xl:hidden">
      <div ref={pinRef} className="relative aspect-[1/1.28] w-full">
        <div ref={phoneRef} className="absolute -top-[22%] left-1/2 z-30 w-[28.25%] will-change-transform">
          <Image src={assets.heroShowcase.iphone.src} alt={assets.heroShowcase.iphone.alt} width={assets.heroShowcase.iphone.width} height={assets.heroShowcase.iphone.height} priority className="w-full" />
        </div>

        <div ref={leftCardRef} className="absolute -top-[20%] left-[14%] z-50 flex w-[17.6%] items-center gap-1.5 rounded-[clamp(0.75rem,2vw,1rem)] border border-white/40 bg-white/35 p-[clamp(0.4rem,1.4vw,1.25rem)] shadow-lg backdrop-blur-lg will-change-transform">
          <div className="flex w-[18%] shrink-0 flex-col items-center">{assets.heroShowcase.avatars.map((avatar, index) => <Image key={avatar.src} src={avatar.src} alt={avatar.alt} width={avatar.width} height={avatar.height} className={`relative aspect-square w-full rounded-full border border-white/70 object-cover ${index > 0 ? "-mt-[55%]" : ""}`} style={{ zIndex: index + 1 }} />)}</div>
          <div className="min-w-0 text-left"><p className="text-stat text-[clamp(0.55rem,1.7vw,1.5rem)] leading-none text-foreground">{hero.showcase.stats.left.value}</p><p className="mt-1 text-[clamp(0.3rem,0.95vw,0.875rem)] leading-tight text-foreground-muted">{hero.showcase.stats.left.label}</p></div>
        </div>

        <div ref={rightCardRef} className="absolute -top-[12%] right-[14%] z-50 flex w-[17.6%] items-center gap-1.5 rounded-[clamp(0.75rem,2vw,1rem)] border border-white/40 bg-white/35 p-[clamp(0.4rem,1.4vw,1.25rem)] shadow-lg backdrop-blur-lg will-change-transform">
          <div className="flex aspect-square w-[22%] shrink-0 items-center justify-center rounded-full border border-white/60 bg-white/30"><Image src={assets.icons.shield} alt="" width={24} height={24} aria-hidden className="size-[52%]" /></div>
          <div className="min-w-0 text-left"><p className="text-stat text-[clamp(0.55rem,1.7vw,1.5rem)] leading-none text-foreground">{hero.showcase.stats.right.value}</p><p className="mt-1 text-[clamp(0.3rem,0.95vw,0.875rem)] leading-tight text-foreground-muted">{hero.showcase.stats.right.label}</p></div>
        </div>

        <div className="absolute top-[40%] left-[10%] right-[10%] z-45 text-left">
          <ShowcaseTextReveal pinnedContainerRef={sectionRef} animationStart="center center" animationEnd="+=160%" baseOpacity={0.2} lines={[
            { text: hero.showcase.heading, className: "[font-family:var(--font-family-sans)] text-[clamp(1rem,4vw,1.8rem)] font-light leading-[1.04] tracking-[-0.03em] text-foreground" },
            { text: hero.showcase.description, className: "[font-family:var(--font-family-sans)] text-[clamp(1rem,4vw,1.8rem)] font-light leading-[1.04] tracking-[-0.03em] text-foreground-muted" },
          ]} />
        </div>
        <FolderFlap className="top-[25%] z-40 w-full translate-y-0" />
      </div>
    </div>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const gradientRef = useRef<HTMLDivElement | null>(null);
  const iphoneRef = useRef<HTMLDivElement | null>(null);
  const leftStatRef = useRef<HTMLDivElement | null>(null);
  const rightStatRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const header = headerRef.current;
    const gradient = gradientRef.current;
    const iphone = iphoneRef.current;
    const leftStat = leftStatRef.current;
    const rightStat = rightStatRef.current;
    if (
      !section ||
      !pin ||
      !header ||
      !gradient ||
      !iphone ||
      !leftStat ||
      !rightStat
    )
      return;
    if (window.innerWidth < 1280) return;

    // Resting: tucked into the folder (stats stay visible).
    // Keep one motion path at every breakpoint. The artwork itself scales with
    // its fluid canvas, so changing these values on smaller screens makes the
    // phone and cards follow a different animation than desktop.
    gsap.set(iphone, { xPercent: -50, y: 50, force3D: true });
    gsap.set(leftStat, { y: 70, force3D: true });
    gsap.set(rightStat, { y: 90, force3D: true });
    gsap.set(header, { y: 0, opacity: 1 });
    gsap.set(gradient, { opacity: 1 });

    if (prefersReducedMotion) {
      gsap.set(iphone, { xPercent: -50, y: 0 });
      gsap.set([leftStat, rightStat], { y: 0 });
      gsap.set(gradient, { opacity: 0 });
      return;
    }

    ensureScrollTriggerRegistered();

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: `top top+=${PIN_OFFSET_PX}`,
          end: () => `+=${getScrollDistance()}`,
          pin: pin,
          pinSpacing: true,
          scrub: 1.2,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            header.style.pointerEvents =
              self.progress > 0.55 ? "none" : "auto";
          },
        },
      });

      // Rise over most of the pin, then hold — same motion as before, smoother scrub.
      tl.to(
        iphone,
        {
          xPercent: -50,
          y: -160,
          ease: "power1.out",
          duration: 0.65,
        },
        0,
      );

      tl.to(
        leftStat,
        {
          y: -190,
          ease: "power1.out",
          duration: 0.65,
        },
        0,
      );

      tl.to(
        rightStat,
        {
          y: -140,
          ease: "power1.out",
          duration: 0.65,
        },
        0,
      );

      tl.to(
        header,
        {
          y: -60,
          opacity: 0,
          ease: "power1.in",
          duration: 0.55,
        },
        0,
      );

      // Fade the glow out as the folder comes into focus.
      tl.to(
        gradient,
        {
          opacity: 0,
          ease: "power1.in",
          duration: 0.45,
        },
        0.1,
      );

      // Hold the composed frame before unpinning.
      tl.to({}, { duration: 0.35 });

      // Nested text reveals depend on this pin — refresh after it's live.
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }, section);

    return () => {
      ctx.revert();
    };
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-labelledby="hero-heading"
      className="relative overflow-x-hidden bg-background"
    >
      <div
        ref={gradientRef}
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 z-[1] w-[min(62vw,22rem)] sm:w-[min(48vw,28rem)] md:w-[min(40vw,32rem)]"
      >
        <Image
          src={assets.heroGradient.src}
          alt=""
          width={assets.heroGradient.width}
          height={assets.heroGradient.height}
          priority
          className="h-auto w-full mix-blend-screen"
        />
      </div>

      <div
        ref={pinRef}
        className="container-content relative z-10 flex flex-col items-center px-5 pt-8 pb-2 text-center sm:px-6 sm:pt-10 sm:pb-3 md:pt-12 md:pb-4 xl:px-0 xl:pt-14 xl:pb-4"
      >
        <div ref={headerRef} className="flex flex-col items-center">
          <h1
            id="hero-heading"
            className="text-hero max-w-[min(100%,var(--container-narrow))]"
          >
            <span className="block text-foreground">{hero.headline.line1}</span>
            <span className="text-hero-gradient -mt-1 block sm:-mt-1.5">{hero.headline.line2}</span>
          </h1>

          <p className="text-body-large mt-4 max-w-[42rem] sm:mt-5 md:mt-6">
            {hero.description}
          </p>

          <div
            className="mt-4 flex w-full max-w-[18rem] flex-col items-stretch gap-2.5 sm:mt-6 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-7 md:mt-7"
            role="group"
            aria-label="Hero actions"
          >
            <a
              href={hero.ctas.primary.href}
              className="text-button inline-flex h-[2.75rem] w-full items-center justify-between gap-3 rounded-full border border-foreground-inverse bg-[image:var(--gradient-primary-button)] pl-4 pr-1 text-[0.75rem] text-foreground-inverse transition-[var(--transition-common)] hover:opacity-92 sm:h-[3.25rem] sm:gap-4 sm:pl-6 sm:pr-1.5 sm:text-[length:var(--text-button-size)] sm:w-auto sm:min-w-[12.75rem]"
            >
              <span>{hero.ctas.primary.label}</span>
              <span className="inline-flex size-[2rem] shrink-0 items-center justify-center rounded-full bg-black/20 sm:size-[2.375rem]">
                <Play aria-hidden className="size-3 fill-foreground-inverse text-foreground-inverse" strokeWidth={0} />
              </span>
            </a>

            <a
              href={hero.ctas.secondary.href}
              className="text-button inline-flex h-[2.75rem] w-full items-center justify-center gap-1 rounded-full border border-border bg-background-elevated px-4 text-[0.75rem] text-accent-strong transition-[var(--transition-common)] hover:bg-background-muted sm:h-[3.25rem] sm:gap-1.5 sm:px-6 sm:text-[length:var(--text-button-size)] sm:w-auto"
            >
              {hero.ctas.secondary.label}
              <ArrowUpRight aria-hidden className="size-3.5 shrink-0" strokeWidth={2.25} />
            </a>
          </div>
        </div>

        <MobileShowcase />

        <div className="relative mt-24 hidden w-full max-w-[87.5rem] pb-0 xl:mt-40 xl:block">
          <div className="relative aspect-[1400/1078] w-full">
            <div className="absolute top-[36%] left-[6%] right-[6%] z-40 text-left">
              <ShowcaseTextReveal
                pinnedContainerRef={pinRef}
                animationStart="center center"
                animationEnd="+=160%"
                baseOpacity={0.2}
                lines={[
                  {
                    text: hero.showcase.heading,
                    className:
                      "[font-family:var(--font-family-sans)] text-left text-[clamp(0.6rem,2.2vw,0.8rem)] font-light leading-[1.05] tracking-[-0.03em] text-foreground sm:text-[length:clamp(1.25rem,4vw+0.5rem,var(--font-size-4xl))] sm:leading-none",
                  },
                  {
                    text: hero.showcase.description,
                    className:
                      "[font-family:var(--font-family-sans)] text-left text-[clamp(0.6rem,2.2vw,0.8rem)] font-light leading-[1.05] tracking-[-0.03em] text-foreground-muted sm:text-[length:clamp(1.25rem,4vw+0.5rem,var(--font-size-4xl))] sm:leading-none",
                  },
                ]}
              />
            </div>

            <div
              aria-hidden
              className="pointer-events-none absolute bottom-[5%] left-0 z-10 hidden w-full translate-y-12"
              style={{
                WebkitMaskImage:
                  "linear-gradient(to bottom, black 0%, black 25%, transparent 62%)",
                maskImage:
                  "linear-gradient(to bottom, black 0%, black 25%, transparent 62%)",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskSize: "100% 100%",
                maskSize: "100% 100%",
              }}
            >
              <Image
                src={assets.heroShowcase.folderBottom.src}
                alt={assets.heroShowcase.folderBottom.alt}
                width={assets.heroShowcase.folderBottom.width}
                height={assets.heroShowcase.folderBottom.height}
                className="w-full"
              />
            </div>

            <div
              ref={iphoneRef}
              className="absolute left-1/2 z-20 w-[120px] top-[-70px] will-change-transform sm:w-[220px] sm:top-[-150px] md:w-[250px] md:top-[-170px] lg:w-[280px] lg:top-[-190px] xl:w-[300px]"
            >
              <Image
                src={assets.heroShowcase.iphone.src}
                alt={assets.heroShowcase.iphone.alt}
                width={assets.heroShowcase.iphone.width}
                height={assets.heroShowcase.iphone.height}
                priority
                className="w-full"
              />
            </div>

            <div
              ref={leftStatRef}
              className="absolute top-[-4%] left-[2%] z-50 flex h-[80px] w-[150px] items-center gap-2 rounded-[1rem] border border-white/40 bg-white/20 p-2 shadow-lg backdrop-blur-lg will-change-transform sm:top-[-7%] sm:left-[14%] sm:h-[122px] sm:w-[246px] sm:gap-3 sm:rounded-[1.75rem] sm:p-3.5 md:left-[21%] md:top-[-20%]"
            >
              <div className="flex w-5 shrink-0 flex-col items-center justify-center sm:w-7">
                {assets.heroShowcase.avatars.map((avatar, index) => (
                  <Image
                    key={avatar.src}
                    src={avatar.src}
                    alt={avatar.alt}
                    width={avatar.width}
                    height={avatar.height}
                    className={`relative size-5 rounded-full border-2 border-white/60 bg-white/30 object-cover shadow-[0_1px_4px_rgba(0,0,0,0.1)] sm:size-7 ${index > 0 ? "-mt-3 sm:-mt-4" : ""}`}
                    style={{ zIndex: index + 1 }}
                  />
                ))}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-stat text-sm leading-none text-foreground sm:text-2xl">
                  {hero.showcase.stats.left.value}
                </p>
                <p className="mt-1 text-[10px] leading-tight text-foreground-muted sm:mt-1.5 sm:text-sm">
                  {hero.showcase.stats.left.label}
                </p>
              </div>
            </div>

            <div
              ref={rightStatRef}
              className="absolute -top-[5%] right-[2%] z-50 flex max-w-[150px] items-center gap-2 rounded-[1rem] border border-white/40 bg-white/20 p-2 shadow-lg backdrop-blur-lg will-change-transform sm:-top-[10%] sm:right-[10%] sm:max-w-[min(75vw,18rem)] sm:gap-3 sm:rounded-[1.75rem] sm:p-3 md:right-[14%] md:max-w-[20rem] md:gap-4 md:p-4 lg:max-w-[22rem] lg:gap-5 lg:p-5"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/60 bg-white/30 sm:size-11 md:size-12 lg:size-14">
                <Image
                  src={assets.icons.shield}
                  alt=""
                  width={24}
                  height={24}
                  aria-hidden
                  className="size-3.5 sm:size-5 md:size-6 lg:size-7"
                />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-stat text-sm leading-none text-foreground sm:text-xl md:text-2xl lg:text-3xl">
                  {hero.showcase.stats.right.value}
                </p>
                <p className="mt-1 max-w-[12rem] text-[10px] leading-snug text-foreground-muted sm:mt-1.5 sm:text-xs md:mt-2 md:text-sm lg:text-base">
                  {hero.showcase.stats.right.label}
                </p>
              </div>
            </div>

            <FolderFlap className="bottom-0 z-30 w-full translate-y-12" />
          </div>

          {/* Bottom dissolve — covers the folder overhang (translate-y-12) into the page */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -bottom-20 z-[45] h-56 sm:h-60 md:h-64"
            style={{
              background:
                "linear-gradient(to bottom, transparent 0%, color-mix(in srgb, var(--color-background) 35%, transparent) 28%, color-mix(in srgb, var(--color-background) 80%, transparent) 55%, var(--color-background) 82%, var(--color-background) 100%)",
            }}
          />
        </div>
      </div>
    </section>
    
  );
}
