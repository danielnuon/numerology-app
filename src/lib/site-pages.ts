/**
 * Site Pages
 *
 * The pages a visitor can reach from the menu and the footer, in two groups:
 * the reading and the pages that explain it, then the story behind Solini.
 * One list, so the menu and the footer never disagree.
 */

/** One page in the site's navigation. */
export interface SitePage {
  href: string;
  label: string;
}

/** A titled group of pages. */
export interface SitePageGroup {
  title: string;
  pages: readonly SitePage[];
}

/** Every page in the navigation, grouped and in reading order. */
export const SITE_PAGE_GROUPS = [
  {
    title: "Your reading",
    pages: [
      { href: "/", label: "Your cycle" },
      { href: "/how-it-works", label: "How your cycle is made" },
      { href: "/meaning", label: "What the numbers mean" },
    ],
  },
  {
    title: "Our story",
    pages: [
      { href: "/about", label: "About Solini" },
      { href: "/heritage", label: "Our heritage" },
    ],
  },
] as const satisfies readonly SitePageGroup[];

/** The path of any page in the navigation. */
export type SitePagePath = (typeof SITE_PAGE_GROUPS)[number]["pages"][number]["href"];
