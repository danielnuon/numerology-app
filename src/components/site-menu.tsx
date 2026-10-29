"use client";

/**
 * SiteMenu
 *
 * The Menu button in the top corner of every page, and the short list of
 * pages it opens (`SITE_PAGE_GROUPS`). It behaves like a disclosure menu on
 * any familiar site: the button toggles the list, Escape or a tap outside it
 * closes it, and following a link closes it on the new page. The current
 * page is marked with `aria-current` and the "now" gold.
 *
 * The list stays mounted so it can unfold and fold away (`.menu-panel` in
 * globals.css); while closed it is invisible and inert.
 */

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_PAGE_GROUPS } from "@/lib/site-pages";

/**
 * A line's place in the menu, counting each group's heading (pageIndex -1)
 * and its links in order, so the stagger runs straight down the list.
 */
function itemIndex(groupIndex: number, pageIndex: number): number {
  const before = SITE_PAGE_GROUPS.slice(0, groupIndex).reduce((n, group) => n + group.pages.length + 1, 0);
  return before + pageIndex + 1;
}

export function SiteMenu() {
  const pathname = usePathname();
  // The path the menu was opened on: it counts as open only on that page,
  // so a link that navigates away closes it without an effect.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const isOpen = openOn === pathname;
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Light dismiss and Escape, attached only while the list is open
  useEffect(() => {
    if (!isOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpenOn(null);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpenOn(null);
      buttonRef.current?.focus();
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="safe-gutter absolute top-0 right-0 z-20 pt-3 sm:pt-5">
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setOpenOn(isOpen ? null : pathname)}
          className={[
            // Icon only on phones, where the word would crowd the home page title
            "inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full px-3 sm:px-4",
            "text-sm uppercase tracking-[0.14em]",
            "border border-transparent hover:border-border",
            isOpen ? "border-border text-gold-deep" : "text-ink-light hover:text-ink",
            "pressable active:scale-[0.97]",
          ].join(" ")}
        >
          <svg viewBox="0 0 16 16" className="menu-icon h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line className="menu-icon-top" x1="2" y1="4.5" x2="14" y2="4.5" />
            <line className="menu-icon-middle" x1="2" y1="8" x2="14" y2="8" />
            <line className="menu-icon-bottom" x1="2" y1="11.5" x2="14" y2="11.5" />
          </svg>
          <span className="max-sm:sr-only">Menu</span>
        </button>

        <nav
            id={panelId}
            aria-label="Site"
            data-open={isOpen}
            inert={!isOpen}
            className={[
              "menu-panel absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-2rem)]",
              "rounded-2xl border border-border bg-manuscript p-2",
              "shadow-[var(--shadow-raised)]",
            ].join(" ")}
          >
            {SITE_PAGE_GROUPS.map((group, groupIndex) => (
              <div key={group.title} className="py-1">
                <p
                  className="menu-item px-3 pt-2 pb-1 text-sm uppercase tracking-[0.14em] text-ink-light"
                  style={{ "--i": itemIndex(groupIndex, -1) } as React.CSSProperties}
                >
                  {group.title}
                </p>
                <ul>
                  {group.pages.map((page, pageIndex) => {
                    const isCurrent = page.href === pathname;
                    return (
                      <li
                        key={page.href}
                        className="menu-item"
                        style={{ "--i": itemIndex(groupIndex, pageIndex) } as React.CSSProperties}
                      >
                        <Link
                          href={page.href}
                          aria-current={isCurrent ? "page" : undefined}
                          onClick={() => setOpenOn(null)}
                          className={[
                            "flex min-h-[44px] items-center rounded-xl px-3 text-base",
                            isCurrent ? "text-gold-deep" : "text-ink hover:bg-manuscript-alt",
                          ].join(" ")}
                        >
                          {page.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
      </div>
    </div>
  );
}
