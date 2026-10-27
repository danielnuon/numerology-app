import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond,
  Hanken_Grotesk,
  Marcellus,
  Noto_Serif_Khmer,
} from "next/font/google";
import { LanternSky } from "@/components/lantern-sky";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const marcellus = Marcellus({
  variable: "--font-marcellus",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const notoSerifKhmer = Noto_Serif_Khmer({
  variable: "--font-noto-serif-khmer",
  subsets: ["khmer"],
  weight: ["400", "600"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#17131C",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://solini.vercel.app"
  ),
  title: "Solini — Life Cycle Calculator",
  description:
    "Discover your 12-year life cycle through Khmer numerology. Combines Khmer lunar calendar, Chinese zodiac, and weekday birth data.",
  openGraph: {
    title: "Solini — Life Cycle Calculator",
    description:
      "Discover your 12-year life cycle through Khmer numerology. Combines Khmer lunar calendar, Chinese zodiac, and weekday birth data.",
    type: "website",
    locale: "en_US",
    siteName: "Solini",
  },
  twitter: {
    card: "summary_large_image",
    title: "Solini — Life Cycle Calculator",
    description:
      "Discover your 12-year life cycle through Khmer numerology. Combines Khmer lunar calendar, Chinese zodiac, and weekday birth data.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${marcellus.variable} ${hanken.variable} ${notoSerifKhmer.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanternSky />
        <div className="relative z-[1] flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
