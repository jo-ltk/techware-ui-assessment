"use client";

import Image from "next/image";

import { assets } from "@/constants";
import { cn } from "@/lib/utils";

import ScrollStack, { ScrollStackItem } from "./ScrollStack";

const platformPreview = {
  eyebrow: "Platform Preview",
  heading: "Verify documents from a single dashboard.",
  description:
    "One dashboard to request, track, and receive verified credentials, from anywhere in the world.",
  cards: [
    {
      key: "card1",
      heading: "Create verification cases instantly",
      description:
        "Add the applicant and issuer. Hit send. Lorem notifies everyone and tracks every step.",
    },
    {
      key: "card2",
      heading: "Track real-time verification status",
      description:
        "See exactly where each case stands. No chasing emails. No manual follow-ups.",
    },
    {
      key: "card3",
      heading: "Access issuer-verified documents",
      description:
        "Signed at source. Delivered to your dashboard. Ready to reference whenever you need it.",
    },
    {
      key: "card4",
      heading: "View applicant approval activity",
      description:
        "Know the moment an applicant consents. Every action is logged, timestamped, and auditable.",
    },
  ],
} as const;

type PlatformPreviewCardProps = {
  heading: string;
  description: string;
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
};

function PlatformPreviewCard({
  heading,
  description,
  image,
}: PlatformPreviewCardProps) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border-2 border-border bg-background-muted shadow-card sm:rounded-[var(--radius-lg)]">
      <div className="relative lg:min-h-[30rem] xl:min-h-[34rem]">
        <div className="relative z-10 p-4 sm:p-6 md:p-8 lg:max-w-[24rem] lg:p-12 xl:max-w-[26rem] xl:p-14">
          <h3 className="font-sans text-[1.125rem] font-medium leading-tight tracking-[var(--text-feature-title-tracking)] text-foreground sm:text-[1.375rem] md:text-[1.625rem] lg:text-[length:var(--text-feature-title-size)] lg:leading-[var(--text-feature-title-leading)]">
            {heading}
          </h3>
          <p className="mt-2.5 max-w-[18rem] font-serif text-[0.8125rem] leading-snug text-foreground-muted italic sm:mt-4 sm:text-[0.9375rem] sm:leading-normal md:mt-5 md:text-[length:var(--text-body-large-size)] md:leading-[var(--text-body-large-leading)]">
            {description}
          </p>
        </div>

        <div className="relative px-3 pb-3 sm:px-5 sm:pb-5 md:px-6 lg:absolute lg:right-0 lg:top-10 lg:w-[62%] lg:px-0 lg:pb-0 xl:w-[60%]">
          <div className="relative overflow-hidden rounded-[var(--radius-sm)] sm:rounded-[var(--radius)] md:rounded-[var(--radius-md)]">
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 70vw, 55vw"
              decoding="async"
              className="h-auto w-full"
            />
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-0 rounded-[inherit] border-2 border-border sm:border-3",
                "[mask-image:linear-gradient(to_right,black_0%,black_45%,transparent_80%)]",
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlatformPreview() {
  return (
    <section
      id="platform-preview"
      aria-labelledby="platform-preview-heading"
      className="overflow-x-hidden bg-background px-4 pt-6 pb-8 sm:px-5 sm:pt-8 sm:pb-8 md:px-6 md:pt-10 md:pb-10 lg:pt-12 lg:pb-12"
    >
      <div className="container-content">
        <div className="flex flex-col gap-3 sm:gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="max-w-[19.5rem] sm:max-w-[32rem] md:max-w-[40rem] lg:max-w-[44rem]">
            <p className="text-label inline-flex items-center gap-1 text-[0.75rem] font-medium sm:text-[length:var(--text-label-size)]">
              <span aria-hidden className="size-1 rounded-full bg-accent" />
              {platformPreview.eyebrow}
            </p>

            <h2
              id="platform-preview-heading"
              className="mt-2 font-sans text-[1.375rem] font-normal leading-[1.15] tracking-[var(--text-section-title-tracking)] text-foreground [hyphens:none] sm:mt-3 sm:text-[1.75rem] sm:leading-none md:text-[2.25rem] lg:text-[length:var(--text-section-title-size)]"
            >
              {platformPreview.heading}
            </h2>
          </div>

          <p className="max-w-[17.5rem] font-serif text-[0.8125rem] leading-snug text-foreground-muted sm:max-w-[22rem] sm:text-[0.9375rem] sm:leading-normal md:text-[length:var(--text-body-size)] lg:pb-1 lg:text-right">
            {platformPreview.description}
          </p>
        </div>

        <div className="mt-6 sm:mt-10 md:mt-14 lg:mt-16">
          <ScrollStack
            useWindowScroll
            itemDistance={120}
            itemStackDistance={78}
            itemScale={0.04}
            stackPosition="12%"
            scaleEndPosition="8%"
            baseScale={0.86}
          >
            {platformPreview.cards.map((card) => (
              <ScrollStackItem key={card.key}>
                <PlatformPreviewCard
                  heading={card.heading}
                  description={card.description}
                  image={assets.platformPreview[card.key]}
                />
              </ScrollStackItem>
            ))}
          </ScrollStack>
        </div>
      </div>
    </section>
  );
}
