import Image from "next/image";
import { MapPin, Phone } from "lucide-react";

import { assets } from "@/constants";

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
  return (
    <footer className="bg-background px-0 sm:px-6">
      <div className="mx-auto w-full sm:w-[min(100%-(var(--container-padding-inline-sm)*2),var(--container-content))]">
        <div className="relative min-h-[24rem] overflow-hidden rounded-none sm:min-h-[32rem] sm:rounded-t-[var(--radius-lg)]">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src="/videos/footer_video.mp4"
            autoPlay
            muted
            loop
            playsInline
          />

          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgb(196,88,32,0.22),transparent_55%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgb(32,64,140,0.2),transparent_55%)]"
            aria-hidden
          />

          <div className="relative z-10 flex min-h-[inherit] flex-col p-5 sm:p-10 md:p-12 lg:p-14">
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:gap-x-8 sm:gap-y-12 md:grid-cols-4">
              <div>
                <h3 className="text-sm font-medium text-white">
                  {footerLinks.product.title}
                </h3>
                <ul className="mt-4 flex flex-col gap-2.5 sm:mt-5 sm:gap-3">
                  {footerLinks.product.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-white/60 transition-colors hover:text-white"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white">
                  {footerLinks.company.title}
                </h3>
                <ul className="mt-4 flex flex-col gap-2.5 sm:mt-5 sm:gap-3">
                  {footerLinks.company.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-white/60 transition-colors hover:text-white"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white">
                  {contact.title}
                </h3>
                <ul className="mt-4 flex flex-col gap-2.5 sm:mt-5 sm:gap-3">
                  {contact.items.map((item) => (
                    <li
                      key={item.label}
                      className="flex items-center gap-2 text-sm text-white/60"
                    >
                      <item.icon className="size-3.5 shrink-0" aria-hidden />
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white">
                  {connect.title}
                </h3>
                <div className="mt-4 flex items-center gap-3 sm:mt-5">
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
                        className="size-[30px]"
                        aria-hidden
                      />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-auto pt-10 text-right text-xs text-white/40 sm:pt-16">
              © 2026 Lorem.app. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
