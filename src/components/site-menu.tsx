"use client";

/**
 * SiteMenu
 *
 * The Menu button in the top corner of every page, and the short list of
 * pages it opens (`SITE_PAGE_GROUPS`). The button wears the woven flame.
 * When the list opens, two of its threads cross into a close mark and five
 * fly into the list to become the links' underlines (`useThreadFlight`). It behaves like a disclosure menu on
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
import { useReducedMotion } from "motion/react";
import { SITE_PAGE_GROUPS, type SitePage } from "@/lib/site-pages";
import { EASE, MOTION } from "@/lib/motion";
import {
  MARK_LIT_THREAD,
  MARK_THREAD_HEIGHT,
  MARK_THREADS,
  MENU_LINK_THREADS,
  menuThreadClose,
} from "@/components/ui/solini-mark";

/**
 * A line's place in the menu, counting each group's heading (pageIndex -1)
 * and its links in order, so the stagger runs straight down the list.
 */
function itemIndex(groupIndex: number, pageIndex: number): number {
  const before = SITE_PAGE_GROUPS.slice(0, groupIndex).reduce((n, group) => n + group.pages.length + 1, 0);
  return before + pageIndex + 1;
}

/** Every link in the menu, top to bottom. */
const LINKS = SITE_PAGE_GROUPS.flatMap((group): readonly SitePage[] => group.pages);

/** A link's place among all the links, counting down every group. */
function linkIndex(groupIndex: number, pageIndex: number): number {
  return SITE_PAGE_GROUPS.slice(0, groupIndex).reduce((n, group) => n + group.pages.length, 0) + pageIndex;
}

/** An element's offset from `ancestor`, untouched by transforms mid-glide. */
function offsetWithin(element: HTMLElement, ancestor: HTMLElement) {
  let x = 0;
  let y = 0;
  for (let el: HTMLElement | null = element; el && el !== ancestor; el = el.offsetParent as HTMLElement | null) {
    x += el.offsetLeft;
    y += el.offsetTop;
  }
  return { x, y };
}

/**
 * As the list opens, each of the flame's MENU_LINK_THREADS flies from the
 * button to its link and stretches into the underline. A stand-in thread
 * (`flights`) makes the trip over the panel, which is still fading in, and
 * the real underline appears where it lands. Measured once, at the start,
 * and moved with transforms only. With Reduce Motion the underlines are
 * simply there.
 */
function useThreadFlight(
  isOpen: boolean,
  frame: React.RefObject<HTMLDivElement | null>,
  threads: React.RefObject<(SVGRectElement | null)[]>,
  underlines: React.RefObject<(HTMLSpanElement | null)[]>,
  flights: React.RefObject<(HTMLSpanElement | null)[]>
) {
  const prefersReducedMotion = useReducedMotion();
  useEffect(() => {
    const box = frame.current;
    if (!isOpen || prefersReducedMotion || !box || typeof Element.prototype.animate !== "function") return;
    const origin = box.getBoundingClientRect();
    const running = MENU_LINK_THREADS.map((thread, k) => {
      const from = threads.current[thread]?.getBoundingClientRect();
      const underline = underlines.current[k];
      const flight = flights.current[k];
      if (!from || !underline || !flight) return null;
      const to = offsetWithin(underline, box);
      const width = underline.offsetWidth;
      const height = underline.offsetHeight;
      Object.assign(flight.style, { left: `${to.x}px`, top: `${to.y}px`, width: `${width}px`, height: `${height}px` });
      underline.style.visibility = "hidden";
      const animation = flight.animate(
        [
          {
            opacity: 1,
            transform: `translate(${from.left - origin.left - to.x}px, ${from.top - origin.top - to.y}px) scale(${from.width / width}, ${from.height / height})`,
          },
          { opacity: 1, transform: "none" },
        ],
        {
          duration: MOTION.gentle * 1000 + 100,
          delay: parseFloat(menuThreadClose(thread)["--open-delay"]),
          easing: `cubic-bezier(${EASE.standard.join(", ")})`,
          fill: "backwards",
        }
      );
      animation.onfinish = () => {
        underline.style.visibility = "";
        animation.cancel();
      };
      return { animation, underline };
    });
    return () => {
      for (const flight of running) {
        if (!flight) continue;
        flight.animation.cancel();
        flight.underline.style.visibility = "";
      }
    };
  }, [isOpen, prefersReducedMotion, frame, threads, underlines, flights]);
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
  const frameRef = useRef<HTMLDivElement>(null);
  const threadRefs = useRef<(SVGRectElement | null)[]>([]);
  const underlineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const flightRefs = useRef<(HTMLSpanElement | null)[]>([]);
  useThreadFlight(isOpen, frameRef, threadRefs, underlineRefs, flightRefs);

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
      <div ref={frameRef} className="relative">
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
          {/* The woven flame; open, its lit thread and the one above cross
              into a close mark while the others fade away or fly into the
              list as its underlines. */}
          <svg viewBox="0 0 64 64" className="menu-flame h-6 w-6 overflow-visible" aria-hidden="true">
            {MARK_THREADS.map((thread, i) => (
              <rect
                key={i}
                ref={(el) => {
                  threadRefs.current[i] = el;
                }}
                className={`menu-thread ${i === MARK_LIT_THREAD ? "fill-gold-deep" : "fill-gold"}`}
                x={thread.x}
                y={thread.y}
                width={thread.width}
                height={MARK_THREAD_HEIGHT}
                rx={MARK_THREAD_HEIGHT / 2}
                style={menuThreadClose(i) as React.CSSProperties}
              />
            ))}
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
                            "group flex min-h-[44px] items-center rounded-xl px-3 text-base",
                            isCurrent ? "text-gold-deep" : "text-ink hover:bg-manuscript-alt",
                          ].join(" ")}
                        >
                          <span className="relative">
                            {page.label}
                            {/* A thread from the flame, brighter for this page or on hover */}
                            <span
                              ref={(el) => {
                                underlineRefs.current[linkIndex(groupIndex, pageIndex)] = el;
                              }}
                              aria-hidden="true"
                              className={[
                                "menu-underline absolute inset-x-0 -bottom-1 h-[1.5px] rounded-full",
                                isCurrent ? "bg-gold-deep" : "bg-gold/50 group-hover:bg-gold",
                              ].join(" ")}
                            />
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

        {/* Stand-ins for the threads in flight, drawn over the fading panel */}
        {MENU_LINK_THREADS.map((thread, k) => (
          <span
            key={thread}
            data-current={LINKS[k]?.href === pathname}
            ref={(el) => {
              flightRefs.current[k] = el;
            }}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 rounded-full bg-gold opacity-0 [transform-origin:0_0] data-[current=true]:bg-gold-deep"
          />
        ))}
      </div>
    </div>
  );
}
