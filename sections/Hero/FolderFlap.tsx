import Image from "next/image";
import type { CSSProperties } from "react";

import { assets } from "@/constants";

const folderShapePath =
  "M513.925 0C557.167 0 598.271 18.8108 626.537 51.5361C654.803 84.2615 695.907 103.072 739.15 103.072H1231.61C1324.61 103.072 1400 178.461 1400 271.457V909.278C1400 1002.27 1324.61 1077.66 1231.61 1077.66H168.385C75.3886 1077.66 0 1002.27 0 909.278V168.385C0 75.3884 75.3885 0 168.385 0H513.925Z";

/**
 * Solid white folder silhouette (no luminance fade). The asset mask SVG fades
 * white→black, which some engines treat as transparent and lets the phone leak
 * through — this data-URI keeps the shape fully opaque for occlusion.
 */
const solidFolderMask = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 1078"><path fill="white" d="${folderShapePath}"/></svg>`,
)}")`;

/** Opaque through the phone-overlap band; dissolve only at the very bottom. */
const bottomDissolve =
  "linear-gradient(to bottom, black 0%, black 70%, transparent 92%)";

/** Folder silhouette ∩ bottom dissolve — occlusion + glass share this. */
const folderOcclusionMaskStyle: CSSProperties = {
  WebkitMaskImage: `${solidFolderMask}, ${bottomDissolve}`,
  maskImage: `${solidFolderMask}, ${bottomDissolve}`,
  WebkitMaskSize: "100% 100%, 100% 100%",
  maskSize: "100% 100%, 100% 100%",
  WebkitMaskRepeat: "no-repeat, no-repeat",
  maskRepeat: "no-repeat, no-repeat",
  WebkitMaskPosition: "center, center",
  maskPosition: "center, center",
  WebkitMaskComposite: "source-in",
  maskComposite: "intersect",
  // Force alpha so white/black fills aren't read as luminance transparency.
  maskMode: "alpha, alpha",
  WebkitMaskSourceType: "alpha, alpha",
} as CSSProperties;

const folderStrokeFadeStyle: CSSProperties = {
  WebkitMaskImage: bottomDissolve,
  maskImage: bottomDissolve,
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskSize: "100% 100%",
  maskSize: "100% 100%",
};

type FolderFlapProps = {
  /** Optional placement override for breakpoint-specific compositions. */
  className?: string;
};

export function FolderFlap({ className }: FolderFlapProps) {
  return (
    <div
      className={`absolute left-0 z-30 w-full ${className ?? "bottom-0 translate-y-12"}`}
    >
      {/*
        Opaque occlusion under the glass. The fill SVG is only ~20% opacity and
        backdrop-blur does not block — without this, the phone shows through.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-background"
        style={folderOcclusionMaskStyle}
      />

      <Image
        src={assets.heroShowcase.folderTop.src}
        alt={assets.heroShowcase.folderTop.alt}
        width={assets.heroShowcase.folderTop.width}
        height={assets.heroShowcase.folderTop.height}
        className="relative z-[1] w-full"
        style={{
          WebkitMaskImage: bottomDissolve,
          maskImage: bottomDissolve,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] backdrop-blur-3xl"
        style={folderOcclusionMaskStyle}
      />

      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[3] h-full w-full"
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
