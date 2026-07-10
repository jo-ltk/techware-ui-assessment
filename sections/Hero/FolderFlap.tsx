import Image from "next/image";
import type { CSSProperties } from "react";

import { assets } from "@/constants";

const folderShapePath =
  "M513.925 0C557.167 0 598.271 18.8108 626.537 51.5361C654.803 84.2615 695.907 103.072 739.15 103.072H1231.61C1324.61 103.072 1400 178.461 1400 271.457V909.278C1400 1002.27 1324.61 1077.66 1231.61 1077.66H168.385C75.3886 1077.66 0 1002.27 0 909.278V168.385C0 75.3884 75.3885 0 168.385 0H513.925Z";

const folderFlapMaskStyle: CSSProperties = {
  WebkitMaskImage: `url(${assets.heroShowcase.folderTop.maskSrc})`,
  maskImage: `url(${assets.heroShowcase.folderTop.maskSrc})`,
  WebkitMaskSize: "100% 100%",
  maskSize: "100% 100%",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "bottom left",
  maskPosition: "bottom left",
};

const folderStrokeFadeStyle: CSSProperties = {
  WebkitMaskImage:
    "linear-gradient(to bottom, black 0%, black 40%, transparent 70%)",
  maskImage:
    "linear-gradient(to bottom, black 0%, black 40%, transparent 70%)",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskSize: "100% 100%",
  maskSize: "100% 100%",
};

export function FolderFlap() {
  return (
    <div className="absolute bottom-0 left-0 z-30 w-full translate-y-6">
      <Image
        src={assets.heroShowcase.folderTop.src}
        alt={assets.heroShowcase.folderTop.alt}
        width={assets.heroShowcase.folderTop.width}
        height={assets.heroShowcase.folderTop.height}
        className="relative z-0 w-full"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 backdrop-blur-3xl"
        style={folderFlapMaskStyle}
      />
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 h-full w-full"
        viewBox="0 0 1400 1078"
        preserveAspectRatio="none"
        fill="none"
        style={folderStrokeFadeStyle}
      >
        <path d={folderShapePath} stroke="#FFFFFF" strokeWidth={6} />
        <g transform="translate(700 539) scale(0.97429 0.9666) translate(-700 -539)">
          <path
            d={folderShapePath}
            stroke="rgba(255, 255, 255, 0.65)"
            strokeWidth={4}
            strokeDasharray="12 12"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}
