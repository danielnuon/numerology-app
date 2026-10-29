/**
 * Building blocks shared by the reading's companion pages (About, Our
 * heritage, How your cycle is made, What the numbers mean): the page shell,
 * a titled section, a row of twelve number cells, and the links between the
 * pages.
 */

import Link from "next/link";
import { SITE_PAGE_GROUPS, type SitePagePath } from "@/lib/site-pages";

/** An underlined gold link inside running text. */
export const MORE_LINK =
  "text-gold-deep underline underline-offset-4 decoration-gold-deep/40 hover:decoration-gold-deep";

/** Anchor of the total score section on How your cycle is made; the comparison links to it. */
export const TOTAL_SCORE_SECTION_ID = "total-score";

/** Page shell: the Solini wordmark linking home, then a lit title. */
export function InfoPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="safe-gutter flex flex-1 flex-col items-center pt-9 sm:pt-16 pb-[max(4rem,calc(env(safe-area-inset-bottom)+2rem))]">
      <p className="text-sm uppercase text-ink-light tracking-[0.18em]">
        <Link href="/" className="hover:text-gold-deep">
          Solini
        </Link>
      </p>
      <h1 className="title-glow mt-3 text-center font-display text-4xl leading-tight text-ink tracking-[0.08em] sm:text-6xl">
        {title}
      </h1>
      {children}
    </main>
  );
}

export function Section({
  title,
  id,
  children,
}: {
  title: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="w-full max-w-[640px] scroll-mt-8">
      <h2 className="font-display text-2xl text-gold-deep tracking-[0.04em] sm:text-3xl">{title}</h2>
      <div className="mt-4 space-y-4 text-ink-light leading-relaxed">{children}</div>
    </section>
  );
}

/** One row of a worked cycle: a caption, then twelve small cells. */
export function NumberRow({
  label,
  values,
  highlight = false,
}: {
  label: string;
  values: (number | null)[];
  highlight?: boolean;
}) {
  return (
    <div className="mt-4">
      <p className="text-sm uppercase tracking-[0.12em] text-ink-light">{label}</p>
      <div className="mt-1.5 grid grid-cols-12 gap-0.5 sm:gap-1">
        {values.map((value, i) => (
          <span
            key={i}
            className={[
              "flex h-8 items-center justify-center rounded-md border text-xs tabular-nums sm:h-10 sm:text-sm",
              highlight
                ? "border-gold-deep text-gold-deep font-medium text-sm sm:text-base"
                : "border-border text-ink",
            ].join(" ")}
          >
            {value ?? "·"}
          </span>
        ))}
      </div>
    </div>
  );
}

/** The gold pill button used to send a visitor back to the reading. */
export function PillLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="pressable inline-flex min-h-[48px] items-center rounded-full border border-gold-deep px-8 text-base font-medium text-gold-deep hover:bg-gold-deep hover:text-parchment active:scale-[0.97]"
    >
      {children}
    </Link>
  );
}

/**
 * The site's pages in their two groups, at the foot of a page. The current
 * page is left out; the Menu button at the top lists them all.
 */
export function MorePages({ current }: { current?: SitePagePath }) {
  return (
    <nav aria-label="More about Solini" className="mt-12 grid w-full max-w-[640px] gap-6 text-center sm:grid-cols-2">
      {SITE_PAGE_GROUPS.map((group) => (
        <div key={group.title}>
          <p className="text-sm uppercase tracking-[0.14em] text-ink-light">{group.title}</p>
          <ul className="mt-1">
            {group.pages
              .filter((page) => page.href !== current)
              .map((page) => (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    className="inline-flex min-h-[44px] items-center text-sm text-ink-light underline underline-offset-4 decoration-border hover:text-gold-deep"
                  >
                    {page.label}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
