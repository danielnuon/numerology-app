import type { Metadata } from "next";
import { Cormorant_Garamond, Noto_Serif_Khmer } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const notoSerifKhmer = Noto_Serif_Khmer({
  variable: "--font-noto-serif-khmer",
  subsets: ["khmer"],
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Khmer Numerology — Life Cycle Reading",
  description:
    "Discover your 12-year life cycle through Khmer numerology. Combines Khmer lunar calendar, Chinese zodiac, and weekday birth data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${notoSerifKhmer.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col paper-texture">
        {children}
      </body>
    </html>
  );
}
