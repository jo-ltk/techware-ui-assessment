import { Outfit, PT_Serif } from "next/font/google";

/**
 * Primary UI typeface — headings, navigation, buttons, labels, and stats.
 * Figma uses Outfit Regular (400), Medium (500), and Light (300).
 */
export const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-outfit",
  display: "swap",
});

/**
 * Secondary editorial typeface — body copy, descriptions, and supporting text.
 * Figma pairs PT Serif Regular with italic for feature descriptions.
 */
export const ptSerif = PT_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-pt-serif",
  display: "swap",
});

export const fontVariables = `${outfit.variable} ${ptSerif.variable}`;
