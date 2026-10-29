import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond,
  Hanken_Grotesk,
  Marcellus,
  Noto_Serif_Khmer,
} from "next/font/google";
import { LanternSky } from "@/components/lantern-sky";
import { SiteAnalytics } from "@/components/site-analytics";
import { SiteMenu } from "@/components/site-menu";
import {
  SHARE_DESCRIPTION,
  SHARE_TITLE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
} from "@/lib/site-copy";
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
  // Draw under the notch and home indicator; .safe-gutter keeps content clear.
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://solini.vercel.app"
  ),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
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
      // Smooth scrolling is for in-page links only. This tells Next.js to
      // switch it off while it moves to a new page, so the page change
      // lands in place instead of gliding up or down after it.
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${marcellus.variable} ${hanken.variable} ${notoSerifKhmer.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanternSky />
        <div className="relative z-[1] flex flex-1 flex-col">
          <SiteMenu />
          {children}
        </div>
        <SiteAnalytics />
      </body>
    </html>
  );
}
