// components/font-provider.tsx
"use client";

import { createContext, useContext } from "react";
import {
  Inter,
  Roboto_Mono,
  Open_Sans,
  Playfair_Display,
} from "next/font/google";

// Configure your custom fonts
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-mono",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair-display",
});

// Create a context for font classes
const FontContext = createContext({});

export function FontProvider({ children }: { children: React.ReactNode }) {
  const fontClassNames = `${inter.variable} ${robotoMono.variable} ${openSans.variable} ${playfairDisplay.variable}`;

  return <div className={fontClassNames}>{children}</div>;
}

// Custom hook to use fonts
export function useFonts() {
  return useContext(FontContext);
}

export { inter, robotoMono, openSans, playfairDisplay };
