"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { MapPin, Phone } from "lucide-react";

import { assets } from "@/constants";
import { useIntersection, useReducedMotion } from "@/hooks";

const FOOTER_VIDEO_SRC = "/videos/footer_video.mp4";
/** Start loading slightly before the footer enters the viewport. */
const VIDEO_ROOT_MARGIN = "280px 0px";

const footerLinks = {
  product: {
    title: "Product",
    links: [
      { label: "Home", href: "#hero" },
      { label: "Solution", href: "#solution" },
      { label: "Process", href: "#process" },
      { label: "Industries", href: "#industries" },
      { label: "Platform", href: "#platform-preview" },
      { label: "Contact", href: "#contact" },
    ],
  },
  company: {
    title: "Company & Resources",
    links: [
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "FAQs", href: "/faqs" },
    ],
  },
} as const;

const contact = {
  title: "Contact",
  items: [
    { icon: MapPin, label: "USA" },
    { icon: Phone, label: "+971 51 547 3625" },
  ],
} as const;

const connect = {
  title: "Connect",
  links: [
    {
      icon: assets.footer.linkedin,
      label: "LinkedIn",
      href: "https://www.linkedin.com/company/techwarelab/",
    },
    {
      icon: assets.footer.instagram,
      label: "Instagram",
      href: "https://www.instagram.com/techwarelab",
    },
    {
      icon: assets.footer.mail,
      label: "Email",
      href: "mailto:people-support@techwarelab.com",
    },
  ],
} as const;

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isNearViewport = useIntersection(footerRef, {
    rootMargin: VIDEO_ROOT_MARGIN,
    threshold: 0,
  });
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  // Latch once the footer approaches the viewport (keep loaded after leaving).
  if (!shouldLoadVideo && !prefersReducedMotion && isNearViewport) {
    setShouldLoadVideo(true);
  }

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !shouldLoadVideo) {
      return;
    }

    if (isNearViewport) {
      void video.play().catch(() => {
        // Autoplay can be blocked; muted + playsInline usually succeeds.
      });
      return;
    }

    video.pause();
  }, [isNearViewport, shouldLoadVideo]);

  return (
    <footer
      ref={footerRef}
      id="contact"
      className="bg-background px-0 sm:px-6"
    >
      <div className="mx-auto w-full sm:w-[min(100%-(var(--container-padding-inline-sm)*2),var(--container-content))]">
        <div className="relative min-h-[24rem] overflow-hidden rounded-none bg-[#0a0f1c] sm:min-h-[32rem] sm:rounded-t-[var(--radius-lg)]">
          {shouldLoadVideo ? (
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              src={FOOTER_VIDEO_SRC}
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden
              tabIndex={-1}
            />
          ) : null}

          {/* Readability scrim — keeps link text contrast over the video */}
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(6,10,20,0.55)_0%,rgb(6,10,20,0.72)_45%,rgb(6,10,20,0.82)_100%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgb(196,88,32,0.22),transparent_55%)] mix-blend-soft-light"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgb(32,64,140,0.2),transparent_55%)] mix-blend-soft-light"
            aria-hidden
          />

          <div className="relative z-10 flex min-h-[inherit] flex-col p-5 sm:p-10 md:p-12 lg:p-14">
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:gap-x-8 sm:gap-y-12 md:grid-cols-4">
              <div>
                <h3 className="font-[family-name:var(--font-family-sans)] text-[0.9375rem] font-normal leading-none tracking-[-0.03em] text-white sm:text-[length:var(--font-size-xl)]">
                  {footerLinks.product.title}
                </h3>
                <ul className="mt-3 flex flex-col gap-2 sm:mt-5 sm:gap-3">
                  {footerLinks.product.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="font-[family-name:var(--font-family-sans)] text-[0.8125rem] font-normal leading-none tracking-[-0.03em] text-white/75 transition-colors hover:text-white sm:text-[length:var(--font-size-md)]"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-[family-name:var(--font-family-sans)] text-[0.9375rem] font-normal leading-none tracking-[-0.03em] text-white sm:text-[length:var(--font-size-xl)]">
                  {footerLinks.company.title}
                </h3>
                <ul className="mt-3 flex flex-col gap-2 sm:mt-5 sm:gap-3">
                  {footerLinks.company.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="font-[family-name:var(--font-family-sans)] text-[0.8125rem] font-normal leading-none tracking-[-0.03em] text-white/75 transition-colors hover:text-white sm:text-[length:var(--font-size-md)]"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-[family-name:var(--font-family-sans)] text-[0.9375rem] font-normal leading-none tracking-[-0.03em] text-white sm:text-[length:var(--font-size-xl)]">
                  {contact.title}
                </h3>
                <ul className="mt-3 flex flex-col gap-2 sm:mt-5 sm:gap-3">
                  {contact.items.map((item) => (
                    <li
                      key={item.label}
                      className="flex items-center gap-2 font-[family-name:var(--font-family-sans)] text-[0.8125rem] font-normal leading-none tracking-[-0.03em] text-white/75 sm:text-[length:var(--font-size-md)]"
                    >
                      <item.icon className="size-3 shrink-0 sm:size-3.5" aria-hidden />
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-[family-name:var(--font-family-sans)] text-[0.9375rem] font-normal leading-none tracking-[-0.03em] text-white sm:text-[length:var(--font-size-xl)]">
                  {connect.title}
                </h3>
                <div className="mt-3 flex items-center gap-2.5 sm:mt-5 sm:gap-3">
                  {connect.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      aria-label={link.label}
                      target="_blank"
                      rel="noreferrer"
                      className="transition-opacity hover:opacity-80"
                    >
                      <Image
                        src={link.icon.src}
                        alt={link.icon.alt}
                        width={link.icon.width}
                        height={link.icon.height}
                        sizes="30px"
                        className="size-6 sm:size-[30px]"
                        aria-hidden
                      />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-auto pt-10 text-right font-[family-name:var(--font-family-sans)] text-[0.75rem] font-normal leading-none tracking-[-0.03em] text-white/60 sm:pt-16 sm:text-[length:var(--font-size-md)]">
              © 2026 Lorem.app. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
