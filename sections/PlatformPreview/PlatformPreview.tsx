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
    <div className="overflow-hidden rounded-[var(--radius-lg)] border-2 border-border bg-background-muted shadow-card">
      <div className="relative lg:min-h-[30rem] xl:min-h-[34rem]">
        <div className="relative z-10 p-6 sm:p-8 md:p-10 lg:max-w-[24rem] lg:p-12 xl:max-w-[26rem] xl:p-14">
          <h3 className="text-feature-title font-medium text-foreground">
            {heading}
          </h3>
          <p className="text-body-italic mt-4 max-w-[18rem] sm:mt-5">
            {description}
          </p>
        </div>

        <div className="relative px-4 sm:px-6 lg:absolute lg:right-0 lg:top-10 lg:w-[62%] lg:px-0 xl:w-[60%]">
          <div className="relative overflow-hidden rounded-[var(--radius)] sm:rounded-[var(--radius-md)]">
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              className="h-auto w-full"
            />
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-0 rounded-[inherit] border-3 border-border",
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
      className="bg-background px-5 py-16 sm:px-6 sm:py-20 md:py-24 lg:py-28"
    >
      <div className="container-content">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="max-w-[44rem]">
            <p className="text-label inline-flex items-center gap-1 font-medium">
              <span aria-hidden className="size-1 rounded-full bg-accent" />
              {platformPreview.eyebrow}
            </p>

            <h2
              id="platform-preview-heading"
              className="text-section-title mt-3 text-[clamp(2.25rem,4.8vw,var(--text-section-title-size))] text-foreground"
            >
              {platformPreview.heading}
            </h2>
          </div>

          <p className="text-body max-w-[22rem] lg:pb-1 lg:text-right">
            {platformPreview.description}
          </p>
        </div>

        {/* Mobile: simple stacked cards */}
        <div className="mt-10 flex flex-col gap-6 sm:mt-12 sm:gap-8 md:mt-14 lg:hidden">
          {platformPreview.cards.map((card) => (
            <PlatformPreviewCard
              key={card.key}
              heading={card.heading}
              description={card.description}
              image={assets.platformPreview[card.key]}
            />
          ))}
        </div>

        {/* Desktop: ScrollStack pin + scale (no fade-out) */}
        <div className="mt-16 hidden lg:block">
          <ScrollStack
            useWindowScroll
            itemDistance={100}
            itemStackDistance={30}
            itemScale={0.03}
            stackPosition="15%"
            scaleEndPosition="10%"
            baseScale={0.85}
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
