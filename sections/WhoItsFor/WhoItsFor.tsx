import Image from "next/image";

import { assets } from "@/constants";

const whoItsFor = {
  eyebrow: "Who It's For",
  heading: "Built for workflows where trust is non-negotiable.",
  description: "Wherever credentials matter, Lorem handles the verification",
} as const;

export function WhoItsFor() {
  return (
    <section
      id="who-its-for"
      aria-labelledby="who-its-for-heading"
      className="relative overflow-hidden bg-background px-5 pt-20 pb-10 text-center sm:px-6 sm:pt-24 md:pt-28 lg:pb-16"
    >
      <div className="container-content relative z-10 flex flex-col items-center">
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

        <p className="text-body mt-4 max-w-[36rem]">
          {whoItsFor.description}
        </p>

        <div className="mt-12 w-full max-w-[55.875rem] sm:mt-14 md:mt-16">
          <Image
            src={assets.whoItsFor.src}
            alt={assets.whoItsFor.alt}
            width={assets.whoItsFor.width}
            height={assets.whoItsFor.height}
            className="mx-auto h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}
