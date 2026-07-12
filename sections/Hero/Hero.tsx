"use client";

import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Play } from "lucide-react";
import { useLayoutEffect, useRef } from "react";

import { assets } from "@/constants";
import { useReducedMotion } from "@/hooks";

import { FolderFlap } from "./FolderFlap";
import {
  ShowcaseTextReveal,
  type ShowcaseTextRevealHandle,
} from "./ShowcaseTextReveal";

const hero = {
  headline: {
    line1: "Verification That",
    line2: "Starts At The Source.",
  },
  description: {
    line1: "Lorem ipsum dolor sit amet, consectetur adipiscing elit,",
    line2:
      "sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
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

/** Pin length for phone rise → viewport folder takeover → word reveal. */
function getScrollDistance() {
  return Math.round(window.innerHeight * 2.8);
}

let scrollTriggerRegistered = false;

function ensureScrollTriggerRegistered() {
  if (!scrollTriggerRegistered) {
    gsap.registerPlugin(ScrollTrigger);
    scrollTriggerRegistered = true;
  }
}

/**
 * Scene layout (scrubbed, sequential):
 *  1 — resting: phone + cards tucked in the folder (no motion)
 *  2 — phone + glass cards rise; header exits
 *  3a — folder slides up until it fills the viewport (behind the nav); glow exits
 *  3b — word-reveal only after the folder has settled
 */
const SCENE = {
  phone: 0.3,
  settle: 0.08,
  folder: 0.38,
  text: 0.24,
} as const;

/**
 * How far the folder stage must travel so its top edge sits at the viewport
 * top (behind the fixed/sticky navbar), matching the full-screen takeover.
 * Recomputed on refresh — never a fixed pixel bump.
 */
function getFolderViewportRise(el: HTMLElement) {
  const currentY = Number(gsap.getProperty(el, "y")) || 0;
  const naturalTop = el.getBoundingClientRect().top - currentY;
  // Keep a hairline of page chrome so the rounded folder edge reads at the top.
  const inset = 10;
  return inset - naturalTop;
}

function MobileShowcase() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const phoneRef = useRef<HTMLDivElement | null>(null);
  const leftCardRef = useRef<HTMLDivElement | null>(null);
  const rightCardRef = useRef<HTMLDivElement | null>(null);
  const folderStageRef = useRef<HTMLDivElement | null>(null);
  const textRevealRef = useRef<ShowcaseTextRevealHandle | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const phone = phoneRef.current;
    const leftCard = leftCardRef.current;
    const rightCard = rightCardRef.current;
    const folderStage = folderStageRef.current;
    if (
      !section ||
      !pin ||
      !phone ||
      !leftCard ||
      !rightCard ||
      !folderStage
    )
      return;

    // Scene 1 resting — phone + cards tucked in the folder (original layout).
    gsap.set(phone, { xPercent: -50, y: 110, opacity: 1, force3D: true });
    gsap.set([leftCard, rightCard], { y: 110, opacity: 1, force3D: true });
    gsap.set(folderStage, { y: 0, force3D: true });
    textRevealRef.current?.setProgress(0);

    if (prefersReducedMotion) {
      gsap.set(phone, { xPercent: -50, y: -160, opacity: 0 });
      gsap.set([leftCard, rightCard], { y: -160, opacity: 0 });
      gsap.set(folderStage, { y: getFolderViewportRise(folderStage) });
      textRevealRef.current?.setProgress(1);
      return;
    }

    ensureScrollTriggerRegistered();
    const ctx = gsap.context(() => {
      const reveal = { progress: 0 };
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

      // Scene 2 — phone + cards rise together, then settle.
      timeline.to(
        [phone, leftCard, rightCard],
        { y: -160, ease: "power1.out", duration: SCENE.phone },
        0,
      );
      timeline.to({}, { duration: SCENE.settle });

      // Scene 3a — folder fills the viewport; phone stays put and exits focus.
      const folderStart = SCENE.phone + SCENE.settle;
      const textStart = folderStart + SCENE.folder;
      timeline.to(
        folderStage,
        {
          y: () => getFolderViewportRise(folderStage),
          ease: "power1.inOut",
          duration: SCENE.folder,
        },
        folderStart,
      );
      timeline.to(
        [phone, leftCard, rightCard],
        {
          opacity: 0,
          ease: "power1.in",
          duration: SCENE.folder * 0.55,
        },
        folderStart,
      );

      // Scene 3b — word reveal only after the folder has settled.
      timeline.to(
        reveal,
        {
          progress: 1,
          duration: SCENE.text,
          ease: "none",
          onUpdate: () => textRevealRef.current?.setProgress(reveal.progress),
        },
        textStart,
      );

      timeline.to({}, { duration: 0.12 });
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }, section);
    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <div
      ref={sectionRef}
      className="relative mt-8 block w-full max-w-[44rem] xl:hidden"
    >
      <div ref={pinRef} className="relative aspect-[1/1.28] w-full">
        <div
          ref={phoneRef}
          className="absolute -top-[22%] left-1/2 z-30 w-[28.25%] -translate-x-1/2 translate-y-[110px] will-change-transform"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 z-0 w-[280%] -translate-x-1/2 -translate-y-1/2"
          >
            <Image
              src={assets.heroShowcase.iphoneGlow.src}
              alt=""
              width={assets.heroShowcase.iphoneGlow.width}
              height={assets.heroShowcase.iphoneGlow.height}
              className="h-auto w-full"
            />
          </div>
          <Image
            src={assets.heroShowcase.iphone.src}
            alt={assets.heroShowcase.iphone.alt}
            width={assets.heroShowcase.iphone.width}
            height={assets.heroShowcase.iphone.height}
            sizes="28vw"
            priority
            className="relative z-10 w-full"
          />
        </div>

        <div
          ref={leftCardRef}
          className="@container absolute -top-[18%] left-[10%] z-50 flex w-[min(34%,9.5rem)] translate-y-[110px] items-center gap-[clamp(0.25rem,2cqw,0.5rem)] rounded-[clamp(0.5rem,4cqw,0.85rem)] border border-white/40 bg-white/35 p-[clamp(0.3rem,3cqw,0.65rem)] shadow-lg backdrop-blur-lg will-change-transform"
        >
          <div className="flex w-[18%] shrink-0 flex-col items-center">
            {assets.heroShowcase.avatars.map((avatar, index) => (
              <Image
                key={avatar.src}
                src={avatar.src}
                alt={avatar.alt}
                width={avatar.width}
                height={avatar.height}
                sizes="48px"
                className={`relative aspect-square w-full rounded-full border border-white/70 object-cover ${index > 0 ? "-mt-[55%]" : ""}`}
                style={{ zIndex: index + 1 }}
              />
            ))}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-stat text-[length:clamp(0.55rem,10cqw,1.1rem)] text-foreground">
              {hero.showcase.stats.left.value}
            </p>
            <p className="text-stat-label mt-[0.15em] text-[length:clamp(0.35rem,5.5cqw,0.65rem)] leading-[1.2]">
              {hero.showcase.stats.left.label}
            </p>
          </div>
        </div>

        <div
          ref={rightCardRef}
          className="@container absolute -top-[10%] right-[8%] z-50 flex w-[min(38%,11rem)] translate-y-[110px] items-center gap-[clamp(0.25rem,2cqw,0.5rem)] rounded-[clamp(0.5rem,4cqw,0.85rem)] border border-white/40 bg-white/35 p-[clamp(0.3rem,3cqw,0.65rem)] shadow-lg backdrop-blur-lg will-change-transform"
        >
          <div className="flex aspect-square w-[18%] shrink-0 items-center justify-center rounded-full border border-white/60 bg-white/30">
            <Image
              src={assets.icons.shield}
              alt=""
              width={24}
              height={24}
              aria-hidden
              className="size-[52%]"
            />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-stat text-[length:clamp(0.55rem,10cqw,1.1rem)] text-foreground">
              {hero.showcase.stats.right.value}
            </p>
            <p className="text-stat-label mt-[0.15em] text-[length:clamp(0.35rem,5.5cqw,0.65rem)] leading-[1.2]">
              {hero.showcase.stats.right.label}
            </p>
          </div>
        </div>

        <div
          ref={folderStageRef}
          className="absolute inset-0 z-40 will-change-transform"
        >
          <div className="absolute top-[40%] left-[10%] right-[10%] z-[1] text-left">
            <ShowcaseTextReveal
              ref={textRevealRef}
              controlled
              baseOpacity={0.2}
              lines={[
                {
                  text: hero.showcase.heading,
                  className:
                    "[font-family:var(--font-family-sans)] text-[clamp(1rem,4vw,1.8rem)] font-light leading-[1.04] tracking-[-0.03em] text-foreground",
                },
                {
                  text: hero.showcase.description,
                  className:
                    "[font-family:var(--font-family-sans)] text-[clamp(1rem,4vw,1.8rem)] font-light leading-[1.04] tracking-[-0.03em] text-foreground-muted",
                },
              ]}
            />
          </div>
          <FolderFlap className="top-[25%] z-0 w-full translate-y-0" />
        </div>
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
  const folderStageRef = useRef<HTMLDivElement | null>(null);
  const dissolveRef = useRef<HTMLDivElement | null>(null);
  const textRevealRef = useRef<ShowcaseTextRevealHandle | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const header = headerRef.current;
    const gradient = gradientRef.current;
    const iphone = iphoneRef.current;
    const leftStat = leftStatRef.current;
    const rightStat = rightStatRef.current;
    const folderStage = folderStageRef.current;
    const dissolve = dissolveRef.current;
    if (
      !section ||
      !pin ||
      !header ||
      !gradient ||
      !iphone ||
      !leftStat ||
      !rightStat ||
      !folderStage ||
      !dissolve
    )
      return;
    if (window.innerWidth < 1280) return;

    // Scene 1 — phone + cards tucked in the folder (original layout).
    gsap.set(iphone, { xPercent: -50, y: 50, opacity: 1, force3D: true });
    gsap.set(leftStat, { y: 70, opacity: 1, force3D: true });
    gsap.set(rightStat, { y: 90, opacity: 1, force3D: true });
    gsap.set(folderStage, { y: 0, force3D: true });
    gsap.set(dissolve, { opacity: 1 });
    gsap.set(header, { y: 0, opacity: 1 });
    gsap.set(gradient, { opacity: 1 });
    textRevealRef.current?.setProgress(0);

    if (prefersReducedMotion) {
      gsap.set(iphone, { xPercent: -50, y: -160, opacity: 0 });
      gsap.set(leftStat, { y: -190, opacity: 0 });
      gsap.set(rightStat, { y: -140, opacity: 0 });
      gsap.set(folderStage, { y: getFolderViewportRise(folderStage) });
      gsap.set(dissolve, { opacity: 0 });
      gsap.set(gradient, { opacity: 0 });
      textRevealRef.current?.setProgress(1);
      return;
    }

    ensureScrollTriggerRegistered();

    const ctx = gsap.context(() => {
      const reveal = { progress: 0 };
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
              self.progress > 0.28 ? "none" : "auto";
          },
        },
      });

      // Scene 2 — phone reveal (cards travel with the phone).
      tl.to(
        iphone,
        {
          xPercent: -50,
          y: -160,
          ease: "power1.out",
          duration: SCENE.phone,
        },
        0,
      );
      tl.to(
        leftStat,
        {
          y: -190,
          ease: "power1.out",
          duration: SCENE.phone,
        },
        0,
      );
      tl.to(
        rightStat,
        {
          y: -140,
          ease: "power1.out",
          duration: SCENE.phone,
        },
        0,
      );
      tl.to(
        header,
        {
          y: -60,
          opacity: 0,
          ease: "power1.in",
          duration: SCENE.phone * 0.85,
        },
        0,
      );

      // Brief hold so scene 2 reads as complete before the folder moves.
      tl.to({}, { duration: SCENE.settle });

      // Scene 3a — folder slides up until it owns the viewport (behind nav).
      const folderStart = SCENE.phone + SCENE.settle;
      const textStart = folderStart + SCENE.folder;
      tl.to(
        folderStage,
        {
          y: () => getFolderViewportRise(folderStage),
          ease: "power1.inOut",
          duration: SCENE.folder,
        },
        folderStart,
      );
      // Glow stays through the phone rise; fade as the folder takes over.
      tl.to(
        gradient,
        {
          opacity: 0,
          ease: "power1.in",
          duration: SCENE.folder * 0.55,
        },
        folderStart,
      );
      // Phone / cards leave focus as the folder becomes the new canvas.
      tl.to(
        [iphone, leftStat, rightStat],
        {
          opacity: 0,
          ease: "power1.in",
          duration: SCENE.folder * 0.5,
        },
        folderStart,
      );
      tl.to(
        dissolve,
        {
          opacity: 0,
          ease: "power1.in",
          duration: SCENE.folder * 0.45,
        },
        folderStart,
      );

      // Scene 3b — word reveal only after the folder has settled.
      tl.to(
        reveal,
        {
          progress: 1,
          duration: SCENE.text,
          ease: "none",
          onUpdate: () => textRevealRef.current?.setProgress(reveal.progress),
        },
        textStart,
      );

      // Hold the composed frame before unpinning.
      tl.to({}, { duration: 0.12 });

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
      className="relative bg-background xl:-mb-[min(48vh,36rem)] 2xl:-mb-[min(42vh,32rem)]"
    >
      {/* Full-bleed pin wrapper — overflow visible so the folder can rise behind the nav. */}
      <div ref={pinRef} className="relative w-full overflow-visible">
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
            sizes="(max-width: 640px) 62vw, (max-width: 768px) 48vw, 32rem"
            priority
            className="h-auto w-full mix-blend-screen"
          />
        </div>

        <div className="container-content relative z-10 flex flex-col items-center px-4 pt-6 pb-2 text-center sm:px-5 sm:pt-8 sm:pb-3 md:px-6 md:pt-12 md:pb-4 xl:px-0 xl:pt-8 xl:pb-2 2xl:pt-14 2xl:pb-4">
          <div
            ref={headerRef}
            className="flex flex-col items-center pb-0 md:pb-5 xl:pb-2 2xl:pb-6"
          >
            <h1
              id="hero-heading"
              className="text-hero max-w-[min(100%,var(--container-narrow))] xl:text-[clamp(2.5rem,4.2vw+0.6rem,3.75rem)] 2xl:text-[length:clamp(2.375rem,6.5vw+0.75rem,var(--text-hero-size))]"
            >
              <span className="block text-foreground">
                {hero.headline.line1}
              </span>
              <span className="text-hero-gradient -mt-1 block sm:-mt-1.5">
                {hero.headline.line2}
              </span>
            </h1>

            <p className="text-body-large mt-2.5 max-w-[min(100%,var(--container-narrow))] xl:mt-1.5 xl:text-[0.9375rem] xl:leading-snug 2xl:mt-2.5 2xl:text-[length:clamp(0.875rem,1.5vw+0.5rem,var(--text-body-large-size))] 2xl:leading-[var(--text-body-large-leading)]">
              <span className="block">{hero.description.line1}</span>
              <span className="block">{hero.description.line2}</span>
            </p>

            <div
              className="mt-4 flex w-full max-w-[18rem] flex-col items-stretch gap-2.5 sm:mt-6 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4 md:mt-7 md:gap-5 xl:mt-4 2xl:mt-7"
              role="group"
              aria-label="Hero actions"
            >
              <a
                href={hero.ctas.primary.href}
                className="text-button inline-flex h-[2.75rem] w-full items-center justify-center gap-2 rounded-full border border-foreground-inverse bg-[image:var(--gradient-primary-button)] px-1.5 text-foreground-inverse transition-[var(--transition-common)] hover:opacity-92 sm:h-[3.25rem] sm:w-auto sm:gap-2.5 sm:pl-7 sm:pr-1.5"
              >
                <span className="size-6 shrink-0 sm:size-7" aria-hidden />
                <span className="whitespace-nowrap">
                  {hero.ctas.primary.label}
                </span>
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-black/20 sm:size-7">
                  <Play
                    aria-hidden
                    className="size-2.5 fill-foreground-inverse text-foreground-inverse"
                    strokeWidth={0}
                  />
                </span>
              </a>

              <a
                href={hero.ctas.secondary.href}
                className="text-button inline-flex h-[2.75rem] w-full items-center justify-center gap-1 rounded-full border border-border bg-background-elevated px-5 text-accent-strong transition-[var(--transition-common)] hover:bg-background-muted sm:h-[3.25rem] sm:w-auto sm:gap-1.5 sm:px-6"
              >
                {hero.ctas.secondary.label}
                <ArrowUpRight
                  aria-hidden
                  className="size-3.5 shrink-0"
                  strokeWidth={2.25}
                />
              </a>
            </div>
          </div>

          {/* Single scroll targets for nav (mobile + desktop share one DOM id each). */}
          <div id="solution" className="h-0 scroll-mt-28" aria-hidden="true" />
          <div id="process" className="h-0 scroll-mt-28" aria-hidden="true" />

          <MobileShowcase />

          <div className="relative z-20 mx-auto mt-28 hidden w-full max-w-[87.5rem] overflow-visible pb-0 xl:mt-12 xl:block xl:max-w-[68rem] 2xl:mt-44 2xl:max-w-[87.5rem]">
            <div className="relative aspect-[1400/1078] w-full overflow-visible">
              <div
                ref={folderStageRef}
                className="absolute inset-0 z-40 will-change-transform"
              >
                <div className="absolute top-[36%] left-[6%] right-[6%] z-[1] text-left 2xl:top-[40%]">
                  <ShowcaseTextReveal
                    ref={textRevealRef}
                    controlled
                    baseOpacity={0.2}
                    lines={[
                      {
                        text: hero.showcase.heading,
                        className:
                          "[font-family:var(--font-family-sans)] text-left text-[clamp(0.6rem,2.2vw,0.8rem)] font-light leading-[1.05] tracking-[-0.03em] text-foreground sm:text-[length:clamp(1.15rem,3.1vw+0.4rem,2.65rem)] sm:leading-none 2xl:text-[length:clamp(1.25rem,4vw+0.5rem,var(--font-size-4xl))]",
                      },
                      {
                        text: hero.showcase.description,
                        className:
                          "[font-family:var(--font-family-sans)] text-left text-[clamp(0.6rem,2.2vw,0.8rem)] font-light leading-[1.05] tracking-[-0.03em] text-foreground-muted sm:text-[length:clamp(1.15rem,3.1vw+0.4rem,2.65rem)] sm:leading-none 2xl:text-[length:clamp(1.25rem,4vw+0.5rem,var(--font-size-4xl))]",
                      },
                    ]}
                  />
                </div>

                <FolderFlap className="bottom-0 z-0 w-full translate-y-8 2xl:translate-y-12" />
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
                  sizes="min(87.5rem, 100vw)"
                  className="w-full"
                />
              </div>

              <div
                ref={iphoneRef}
                className="absolute left-1/2 z-20 w-[120px] top-[-70px] -translate-x-1/2 translate-y-[50px] will-change-transform sm:w-[220px] sm:top-[-150px] md:w-[250px] md:top-[-170px] lg:w-[280px] lg:top-[-190px] xl:w-[260px] xl:top-[-160px] 2xl:w-[300px] 2xl:top-[-190px]"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-1/2 z-0 w-[280%] -translate-x-1/2 -translate-y-1/2"
                >
                  <Image
                    src={assets.heroShowcase.iphoneGlow.src}
                    alt=""
                    width={assets.heroShowcase.iphoneGlow.width}
                    height={assets.heroShowcase.iphoneGlow.height}
                    className="h-auto w-full"
                  />
                </div>
                <Image
                  src={assets.heroShowcase.iphone.src}
                  alt={assets.heroShowcase.iphone.alt}
                  width={assets.heroShowcase.iphone.width}
                  height={assets.heroShowcase.iphone.height}
                  sizes="300px"
                  priority
                  className="relative z-10 w-full"
                />
              </div>

              <div
                ref={leftStatRef}
                className="absolute top-[-4%] left-[2%] z-50 flex h-[80px] w-[150px] translate-y-[70px] items-center gap-2 rounded-[1rem] border border-white/40 bg-white/20 p-2 shadow-lg backdrop-blur-lg will-change-transform sm:top-[-7%] sm:left-[14%] sm:h-[122px] sm:w-[246px] sm:gap-3 sm:rounded-[1.75rem] sm:p-3.5 md:left-[21%] md:top-[-20%]"
              >
                <div className="flex w-5 shrink-0 flex-col items-center justify-center sm:w-7">
                  {assets.heroShowcase.avatars.map((avatar, index) => (
                    <Image
                      key={avatar.src}
                      src={avatar.src}
                      alt={avatar.alt}
                      width={avatar.width}
                      height={avatar.height}
                      sizes="28px"
                      className={`relative size-5 rounded-full border-2 border-white/60 bg-white/30 object-cover shadow-[0_1px_4px_rgba(0,0,0,0.1)] sm:size-7 ${index > 0 ? "-mt-3 sm:-mt-4" : ""}`}
                      style={{ zIndex: index + 1 }}
                    />
                  ))}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-stat text-foreground">
                    {hero.showcase.stats.left.value}
                  </p>
                  <p className="text-stat-label mt-1">
                    {hero.showcase.stats.left.label}
                  </p>
                </div>
              </div>

              <div
                ref={rightStatRef}
                className="absolute -top-[5%] right-[2%] z-50 flex max-w-[150px] translate-y-[90px] items-center gap-2 rounded-[1rem] border border-white/40 bg-white/20 p-2 shadow-lg backdrop-blur-lg will-change-transform sm:-top-[10%] sm:right-[10%] sm:max-w-[min(75vw,18rem)] sm:gap-3 sm:rounded-[1.75rem] sm:p-3 md:right-[14%] md:max-w-[20rem] md:gap-4 md:p-4 lg:max-w-[22rem] lg:gap-5 lg:p-5"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/60 bg-white/30 sm:size-11 md:size-12 lg:size-14">
                  <Image
                    src={assets.icons.shield}
                    alt=""
                    width={24}
                    height={24}
                    aria-hidden
                    sizes="28px"
                    className="size-3.5 sm:size-5 md:size-6 lg:size-7"
                  />
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-stat text-foreground">
                    {hero.showcase.stats.right.value}
                  </p>
                  <p className="text-stat-label mt-1 max-w-[12rem]">
                    {hero.showcase.stats.right.label}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom dissolve — covers the folder overhang into the page */}
            <div
              ref={dissolveRef}
              aria-hidden
              className="pointer-events-none absolute inset-x-0 -bottom-16 z-[45] h-48 will-change-[opacity] 2xl:-bottom-20 2xl:h-64"
              style={{
                background:
                  "linear-gradient(to bottom, transparent 0%, color-mix(in srgb, var(--color-background) 35%, transparent) 28%, color-mix(in srgb, var(--color-background) 80%, transparent) 55%, var(--color-background) 82%, var(--color-background) 100%)",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
