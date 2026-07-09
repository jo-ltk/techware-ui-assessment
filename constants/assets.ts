export const assets = {
  heroGradient: {
    src: "/assets/hero-gradient.png",
    width: 762,
    height: 1903,
    alt: "",
  },
  logo: {
    src: "/assets/logo.png",
    width: 105,
    height: 108,
    alt: "The Crypto App logo",
  },
  icons: {
    community: "/assets/icon1.svg",
    shield: "/assets/icon3.svg",
    scale: "/assets/icon4.svg",
    figure: "/assets/icon2.svg",
  },
  heroShowcase: {
    iphone: {
      src: "/assets/iphone-14-pro.png",
      width: 1204,
      height: 2454,
      alt: "Verify Global mobile app on iPhone",
    },
    folderTop: {
      src: "/assets/folder-top.svg",
      maskSrc: "/assets/folder-top-mask.svg",
      width: 1400,
      height: 1078,
      alt: "",
    },
    folderBottom: {
      src: "/assets/folder-bottom.svg",
      width: 1400,
      height: 1078,
      alt: "",
    },
    avatars: [
      { src: "/assets/hero-avatar-1.png", width: 80, height: 80, alt: "" },
      { src: "/assets/hero-avatar-2.png", width: 80, height: 80, alt: "" },
      { src: "/assets/hero-avatar-3.png", width: 80, height: 80, alt: "" },
      { src: "/assets/hero-avatar-4.png", width: 80, height: 80, alt: "" },
    ],
  },
} as const;
