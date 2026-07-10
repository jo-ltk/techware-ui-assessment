import Image from "next/image";
import { ArrowUpRight, Play } from "lucide-react";

import { ScrollReveal } from "@/components/ScrollReveal";
import { ScrollRevealWords } from "@/components/ScrollRevealWords";
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
    heading:
      "PDFs get forged. Emails get lost. Manual checks create liability.",
    description:
      "Techware replaces static documents with cryptographically signed credentials issued directly from the source, with a full audit trail.",
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

      <div className="container-content relative z-10 flex flex-col items-center px-5 pt-8 pb-20 text-center sm:px-6 sm:pt-10 sm:pb-24 md:pt-12 md:pb-28 xl:px-0 xl:pt-14 xl:pb-32">
        <h1
          id="hero-heading"
          className="text-hero max-w-[min(100%,var(--container-narrow))] text-[clamp(2.5rem,6vw+1rem,var(--text-hero-size))]"
        >
          <span className="block text-foreground">{hero.headline.line1}</span>
          <span className="text-hero-gradient -mt-1 block sm:-mt-1.5">{hero.headline.line2}</span>
        </h1>

        <p className="text-body-large mt-4 max-w-[42rem] sm:mt-5 md:mt-6">
          {hero.description}
        </p>

        <div
          className="mt-5 flex w-full max-w-md flex-col items-stretch gap-3 sm:mt-6 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-7 md:mt-7"
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

        <div className="relative mt-40 w-full max-w-[87.5rem] sm:mt-48 md:mt-56 lg:mt-60">
          <div className="relative aspect-[1400/1078] w-full">
          <div className="absolute top-[24%] left-[5%] right-[5%] z-40 text-left sm:top-[26%] sm:left-[6%] sm:right-[6%]">
  <ScrollReveal
    baseOpacity={0.2}
    enableBlur={false}
    baseRotation={0}
    containerClassName="!m-0"
    textClassName="[font-family:var(--font-family-sans)] text-left text-[length:var(--font-size-4xl)] font-light leading-none tracking-[-0.03em] text-foreground"
  >
    {hero.showcase.heading}
  </ScrollReveal>
  <ScrollRevealWords
    text={hero.showcase.description}
    className="mt-0 [font-family:var(--font-family-sans)] text-left text-[length:var(--font-size-4xl)] font-light leading-none tracking-[-0.03em] text-foreground-muted"
  />
</div>
            <div
              aria-hidden={false}
              className="absolute bottom-[5%] left-0 z-10 w-full translate-y-6"
              style={{
                WebkitMaskImage:
                  "linear-gradient(to bottom, black 0%, black 40%, transparent 70%)",
                maskImage:
                  "linear-gradient(to bottom, black 0%, black 40%, transparent 70%)",
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

            <Image
              src={assets.heroShowcase.iphone.src}
              alt={assets.heroShowcase.iphone.alt}
              width={assets.heroShowcase.iphone.width}
              height={assets.heroShowcase.iphone.height}
              priority
              className="absolute left-1/2 z-20 w-[180px] -translate-x-1/2 top-[-120px] sm:w-[220px] sm:top-[-150px] md:w-[250px] md:top-[-170px] lg:w-[280px] lg:top-[-190px] xl:w-[300px]"
            />

            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 -bottom-8 z-[35] h-[48%]"
              style={{
                background:
                  "linear-gradient(to bottom, transparent 0%, transparent 20%, color-mix(in srgb, var(--color-background) 70%, transparent) 55%, var(--color-background) 78%, var(--color-background) 100%)",
              }}
            />

            <div className="absolute top-[-7%] left-[14%] z-50 flex h-[122px] w-[246px] items-center gap-3 rounded-[1.75rem] border border-white/40 bg-white/20 p-3.5 shadow-lg backdrop-blur-lg sm:left-[16%] sm:top-[-20%] md:left-[21%]">
              <div className="flex w-7 shrink-0 flex-col items-center justify-center">
                {assets.heroShowcase.avatars.map((avatar, index) => (
                  <Image
                    key={avatar.src}
                    src={avatar.src}
                    alt={avatar.alt}
                    width={avatar.width}
                    height={avatar.height}
                    className={`relative size-7 rounded-full border-2 border-white/60 bg-white/30 object-cover shadow-[0_1px_4px_rgba(0,0,0,0.1)] ${index > 0 ? "-mt-4" : ""}`}
                    style={{ zIndex: index + 1 }}
                  />
                ))}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-stat text-2xl leading-none text-foreground">
                  {hero.showcase.stats.left.value}
                </p>
                <p className="mt-1.5 text-sm leading-tight text-foreground-muted">
                  {hero.showcase.stats.left.label}
                </p>
              </div>
            </div>

            <div className="absolute -top-[10%] right-[10%] z-50 flex max-w-[min(75vw,18rem)] items-center gap-3 rounded-[1.75rem] border border-white/40 bg-white/20 p-3 shadow-lg backdrop-blur-lg sm:right-[14%] sm:max-w-[20rem] sm:gap-4 sm:p-4 md:max-w-[22rem] md:gap-5 md:p-5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/60 bg-white/30 sm:size-12 md:size-14">
                <Image
                  src={assets.icons.shield}
                  alt=""
                  width={24}
                  height={24}
                  aria-hidden
                  className="size-5 sm:size-6 md:size-7"
                />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-stat text-xl leading-none text-foreground sm:text-2xl md:text-3xl">
                  {hero.showcase.stats.right.value}
                </p>
                <p className="mt-1.5 max-w-[12rem] text-xs leading-snug text-foreground-muted sm:mt-2 sm:text-sm md:text-base">
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
