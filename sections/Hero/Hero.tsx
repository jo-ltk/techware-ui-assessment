import Image from "next/image";
import { ArrowUpRight, Play } from "lucide-react";

import { assets } from "@/constants";

import { FolderFlap } from "./FolderFlap";

const hero = {
  headline: {
    line1: "Verification That",
    line2: "Starts At The Source.",
  },
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  ctas: {
    primary: {
      label: "Book a Demo",
      href: "#contact",
    },
    secondary: {
      label: "See how it works",
      href: "#process",
    },
  },
  showcase: {
    stats: {
      left: {
        value: "250+",
        label: "trusted organizations",
      },
      right: {
        value: "10,000+",
        label: "credentials verified securely",
      },
    },
  },
} as const;

export function Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-background"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-0 w-[min(72vw,32rem)] bg-[length:100%_100%] bg-[position:right_center] bg-no-repeat mix-blend-screen sm:w-[min(62vw,38rem)] lg:w-[min(50vw,44rem)]"
        style={{ backgroundImage: `url(${assets.heroGradient.src})` }}
      />

      <div className="container-content relative z-10 flex flex-col items-center px-5 pt-16 pb-20 text-center sm:px-6 sm:pt-20 sm:pb-24 md:pt-24 md:pb-28 xl:px-0 xl:pt-28 xl:pb-32">
        <h1
          id="hero-heading"
          className="text-hero max-w-[min(100%,var(--container-narrow))] text-[clamp(2.5rem,6vw+1rem,var(--text-hero-size))]"
        >
          <span className="block text-foreground">{hero.headline.line1}</span>
          <span className="text-hero-gradient block">{hero.headline.line2}</span>
        </h1>

        <p className="text-body-large mt-6 max-w-[42rem] sm:mt-7 md:mt-8">
          {hero.description}
        </p>

        <div
          className="mt-8 flex w-full max-w-md flex-col items-stretch gap-3 sm:mt-9 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-7 md:mt-10"
          role="group"
          aria-label="Hero actions"
        >
          <a
            href={hero.ctas.primary.href}
            className="text-button inline-flex h-[3.25rem] w-full items-center justify-between gap-4 rounded-full border border-foreground-inverse bg-[image:var(--gradient-primary-button)] pl-5 pr-1.5 text-foreground-inverse transition-[var(--transition-common)] hover:opacity-92 sm:w-auto sm:min-w-[12.75rem] sm:pl-6"
          >
            <span>{hero.ctas.primary.label}</span>
            <span className="inline-flex size-[2.375rem] shrink-0 items-center justify-center rounded-full bg-black/20">
              <Play
                aria-hidden
                className="size-3 fill-foreground-inverse text-foreground-inverse"
                strokeWidth={0}
              />
            </span>
          </a>

          <a
            href={hero.ctas.secondary.href}
            className="text-button inline-flex h-[3.25rem] w-full items-center justify-center gap-1.5 rounded-full border border-border bg-background-elevated px-5 text-accent-strong transition-[var(--transition-common)] hover:bg-background-muted sm:w-auto sm:px-6"
          >
            {hero.ctas.secondary.label}
            <ArrowUpRight aria-hidden className="size-3.5 shrink-0" strokeWidth={2.25} />
          </a>
        </div>

        <div className="relative mt-28 w-full max-w-[87.5rem] sm:mt-32 md:mt-36">
          <div className="relative aspect-[1400/1078] w-full">
            <Image
              src={assets.heroShowcase.folderBottom.src}
              alt={assets.heroShowcase.folderBottom.alt}
              width={assets.heroShowcase.folderBottom.width}
              height={assets.heroShowcase.folderBottom.height}
              className="absolute bottom-[5%] left-0 z-10 w-full"
            />

            <Image
              src={assets.heroShowcase.iphone.src}
              alt={assets.heroShowcase.iphone.alt}
              width={assets.heroShowcase.iphone.width}
              height={assets.heroShowcase.iphone.height}
              priority
              className="absolute left-1/2 z-20 w-[180px] -translate-x-1/2 top-[-120px] sm:w-[220px] sm:top-[-150px] md:w-[250px] md:top-[-170px] lg:w-[280px] lg:top-[-190px] xl:w-[300px]"
            />

            <div className="absolute top-[4%] left-[10%] z-50 flex max-w-[min(52vw,11.5rem)] items-center gap-2 rounded-3xl border border-white/40 bg-white/20 p-2 shadow-lg backdrop-blur-lg sm:left-[14%] sm:max-w-[13.5rem] sm:gap-2.5 sm:p-2.5 md:max-w-[14.5rem] md:gap-3 md:p-3">
              <div className="flex shrink-0 -space-x-2">
                {assets.heroShowcase.avatars.map((avatar, index) => (
                  <Image
                    key={avatar.src}
                    src={avatar.src}
                    alt={avatar.alt}
                    width={avatar.width}
                    height={avatar.height}
                    className="size-6 rounded-full border-2 border-white object-cover sm:size-7 md:size-8"
                    style={{ zIndex: assets.heroShowcase.avatars.length - index }}
                  />
                ))}
              </div>
              <div className="min-w-0 text-left">
                <p className="text-stat text-xs leading-none text-foreground sm:text-sm md:text-base">
                  {hero.showcase.stats.left.value}
                </p>
                <p className="mt-0.5 text-[0.5625rem] leading-tight text-foreground-muted sm:mt-1 sm:text-[0.625rem] md:text-xs">
                  {hero.showcase.stats.left.label}
                </p>
              </div>
            </div>

            <div className="absolute top-[16%] right-[10%] z-50 flex max-w-[min(54vw,12rem)] items-center gap-2 rounded-3xl border border-white/40 bg-white/20 p-2 shadow-lg backdrop-blur-lg sm:right-[14%] sm:max-w-[14rem] sm:gap-2.5 sm:p-2.5 md:max-w-[15rem] md:gap-3 md:p-3">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full border border-white/60 bg-white/30 sm:size-7 md:size-8">
                <Image
                  src={assets.icons.shield}
                  alt=""
                  width={16}
                  height={16}
                  aria-hidden
                  className="size-3 sm:size-3.5 md:size-4"
                />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-stat text-xs leading-none text-foreground sm:text-sm md:text-base">
                  {hero.showcase.stats.right.value}
                </p>
                <p className="mt-0.5 text-[0.5625rem] leading-tight text-foreground-muted sm:mt-1 sm:text-[0.625rem] md:text-xs">
                  {hero.showcase.stats.right.label}
                </p>
              </div>
            </div>

            <FolderFlap />
          </div>
        </div>
      </div>
    </section>
  );
}
