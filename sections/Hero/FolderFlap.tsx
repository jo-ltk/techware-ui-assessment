import Image from "next/image";
import type { CSSProperties } from "react";

import { assets } from "@/constants";

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

export function FolderFlap() {
  return (
    <div className="absolute bottom-0 left-0 z-30 w-full">
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
    </div>
  );
}
