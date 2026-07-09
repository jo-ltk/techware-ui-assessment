import Image from "next/image";

import { assets } from "@/constants";

const platformPreview = {
  eyebrow: "Platform Preview",
  heading: "Verify documents from a single dashboard.",
  description:
    "One dashboard to request, track, and receive verified credentials, from anywhere in the world.",
  card1: {
    heading: "Create verification cases instantly",
    description:
      "Add the applicant and issuer. Hit send. Lorem notifies everyone and tracks every step.",
  },
  card2: {
    heading: "Track real-time verification status",
    description:
      "See exactly where each case stands. No chasing emails. No manual follow-ups.",
  },
  card3: {
    heading: "Access issuer-verified documents",
    description:
      "Signed at source. Delivered to your dashboard. Ready to reference whenever you need it.",
  },
  card4: {
    heading: "View applicant approval activity",
    description:
      "Know the moment an applicant consents. Every action is logged, timestamped, and auditable.",
  },
} as const;

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

        <div className="mt-10 flex flex-col gap-6 sm:mt-12 sm:gap-8 md:mt-14 lg:mt-16 lg:gap-10">
          <div className="overflow-hidden rounded-[var(--radius-lg)] bg-background-muted shadow-card">
            <div className="relative lg:min-h-[30rem] xl:min-h-[34rem]">
              <div className="relative z-10 p-6 sm:p-8 md:p-10 lg:max-w-[24rem] lg:p-12 xl:max-w-[26rem] xl:p-14">
                <h3 className="text-feature-title font-medium text-foreground">
                  {platformPreview.card1.heading}
                </h3>
                <p className="text-body-italic mt-4 max-w-[18rem] sm:mt-5">
                  {platformPreview.card1.description}
                </p>
              </div>

              <div className="relative px-4 sm:px-6 lg:absolute lg:right-0 lg:top-10 lg:w-[62%] lg:px-0 xl:w-[60%]">
                <Image
                  src={assets.platformPreview.card1.src}
                  alt={assets.platformPreview.card1.alt}
                  width={assets.platformPreview.card1.width}
                  height={assets.platformPreview.card1.height}
                  className="h-auto w-full lg:w-full"
                />
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[var(--radius-lg)] bg-background-muted shadow-card">
            <div className="relative lg:min-h-[30rem] xl:min-h-[34rem]">
              <div className="relative z-10 p-6 sm:p-8 md:p-10 lg:max-w-[24rem] lg:p-12 xl:max-w-[26rem] xl:p-14">
                <h3 className="text-feature-title font-medium text-foreground">
                  {platformPreview.card2.heading}
                </h3>
                <p className="text-body-italic mt-4 max-w-[18rem] sm:mt-5">
                  {platformPreview.card2.description}
                </p>
              </div>

              <div className="relative px-4 sm:px-6 lg:absolute lg:right-0 lg:top-10 lg:w-[62%] lg:px-0 xl:w-[60%]">
                <Image
                  src={assets.platformPreview.card2.src}
                  alt={assets.platformPreview.card2.alt}
                  width={assets.platformPreview.card2.width}
                  height={assets.platformPreview.card2.height}
                  className="h-auto w-full lg:w-full"
                />
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[var(--radius-lg)] bg-background-muted shadow-card">
            <div className="relative lg:min-h-[30rem] xl:min-h-[34rem]">
              <div className="relative z-10 p-6 sm:p-8 md:p-10 lg:max-w-[24rem] lg:p-12 xl:max-w-[26rem] xl:p-14">
                <h3 className="text-feature-title font-medium text-foreground">
                  {platformPreview.card3.heading}
                </h3>
                <p className="text-body-italic mt-4 max-w-[18rem] sm:mt-5">
                  {platformPreview.card3.description}
                </p>
              </div>

              <div className="relative px-4 sm:px-6 lg:absolute lg:right-0 lg:top-10 lg:w-[62%] lg:px-0 xl:w-[60%]">
                <Image
                  src={assets.platformPreview.card3.src}
                  alt={assets.platformPreview.card3.alt}
                  width={assets.platformPreview.card3.width}
                  height={assets.platformPreview.card3.height}
                  className="h-auto w-full lg:w-full"
                />
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[var(--radius-lg)] bg-background-muted shadow-card">
            <div className="relative lg:min-h-[30rem] xl:min-h-[34rem]">
              <div className="relative z-10 p-6 sm:p-8 md:p-10 lg:max-w-[24rem] lg:p-12 xl:max-w-[26rem] xl:p-14">
                <h3 className="text-feature-title font-medium text-foreground">
                  {platformPreview.card4.heading}
                </h3>
                <p className="text-body-italic mt-4 max-w-[18rem] sm:mt-5">
                  {platformPreview.card4.description}
                </p>
              </div>

              <div className="relative px-4 sm:px-6 lg:absolute lg:right-0 lg:top-10 lg:w-[62%] lg:px-0 xl:w-[60%]">
                <Image
                  src={assets.platformPreview.card4.src}
                  alt={assets.platformPreview.card4.alt}
                  width={assets.platformPreview.card4.width}
                  height={assets.platformPreview.card4.height}
                  className="h-auto w-full lg:w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}