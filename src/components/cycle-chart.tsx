"use client";

/**
 * CycleChart
 *
 * The 12-year cycle as a wheel of threaded orbs, starting at the top with the
 * birth year and running clockwise, each with its zodiac animal outside it.
 * Under each number runs one woven thread in its tier's color, and the
 * current year's thread is lit, as in the woven flame.
 * A gold arc traces the cycle from the birth year to this year, and a dial of
 * twelve segments around this year's orb shows the month of the year, counted
 * from the birthday.
 *
 * The orbs behave like tabs: one is always selected, arrow keys move focus
 * and selection together, and the center of the wheel (the tab panel) shows a
 * short preview of the selected year. Tapping the center, or the selected
 * orb again, blooms the full reading out over the wheel with a native view
 * transition; Escape, the close button or a tap outside it folds it back.
 */

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  startTransition,
  ViewTransition,
} from "react";
import { motion } from "motion/react";
import type { Weekday } from "@/lib/numerology/calculate";
import { interpretYear } from "@/lib/numerology/interpretation";
import { getActiveYear, getCycleIndex, getLifeArea, getMonthOfActiveYear } from "@/lib/numerology/year-lookup";
import { getZodiacAnimalForYear } from "@/lib/numerology/zodiac";
import { getTierTextClass, getCurrentYearColumn } from "@/lib/numerology/chart-helpers";
import { ZodiacIcon } from "@/components/ui/zodiac-icon";
import { DetailPanel } from "./detail-panel";
import { TotalScoreCard } from "./total-score-card";
import { EASE, MOTION, PRESS } from "@/lib/motion";

export interface CycleChartProps {
  /** 12-element array of cycle numbers (each 0–11). */
  cycle: number[];
  /** Sum of all 12 cycle values. */
  totalScore: number;
  /** Birth year of the person (cycle anchor). */
  birthYear: number;
  /** Birth month (1–12) — used for timing-corrected "current year" highlight. */
  birthMonth: number;
  /** Birth day (1–31) — used for timing-corrected "current year" highlight. */
  birthDay: number;
  /** Birth weekday (1–7, Sunday=1) — passed to the reading for its day planet. */
  weekday: Weekday;
  /** The selected calendar year; its orb is the selected tab. */
  selectedYear: number;
  /** Called with the 0-indexed position when an orb is chosen. */
  onSelectPillar?: (columnIndex: number) => void;
  /** Called when the wheel has sat idle on another year long enough to return to now. */
  onReturnToCurrent?: () => void;
}

/**
 * How long the wheel rests on another year before gliding back to the
 * current one, counted from the last tap, key, scroll or wheel anywhere.
 */
export const RETURN_TO_CURRENT_MS = 9000;

/** Page activity that restarts the idle countdown. */
const ACTIVITY_EVENTS = ["pointerdown", "keydown", "wheel", "scroll"] as const;

/** A hint under the wheel fading in or out as the reading opens and closes. */
const HINT_FADE = "transition-opacity duration-[var(--duration-standard)] ease-standard";

/** Orbs sit on this ring, as a percentage of the wheel's width. */
const ORB_RADIUS = 36;
/** Zodiac animals sit just outside the orbs. */
const ANIMAL_RADIUS = 48;
/** Length of the full ring in SVG units (viewBox is 100 × 100). */
const RING_LENGTH = 2 * Math.PI * ORB_RADIUS;

/**
 * The month dial's twelve segments, clockwise from the top, as SVG arcs on a
 * 100-unit box centered on the orb. Rounded so the server and the browser
 * render identical markup.
 */
const MONTH_SEGMENTS = Array.from({ length: 12 }, (_, month) => {
  const radius = 48;
  const gap = 4; // degrees left open at each end of a segment
  const point = (degrees: number) => {
    const angle = (degrees * Math.PI) / 180;
    return `${(radius * Math.sin(angle)).toFixed(3)} ${(-radius * Math.cos(angle)).toFixed(3)}`;
  };
  return `M ${point(month * 30 + gap)} A ${radius} ${radius} 0 0 1 ${point(month * 30 + 30 - gap)}`;
});

/**
 * This year's month, as twelve segments around the current year's orb:
 * months behind are lit, this month breathes, months ahead stay faint.
 */
function MonthDial({ month }: { month: number }) {
  return (
    <svg
      viewBox="-50 -50 100 100"
      aria-hidden="true"
      className="pointer-events-none absolute -inset-[3px] size-[calc(100%+6px)] overflow-visible"
    >
      {MONTH_SEGMENTS.map((d, index) => {
        const state = index + 1 < month ? "past" : index + 1 === month ? "now" : "ahead";
        return <path key={index} d={d} className={`wheel-month wheel-month-${state}`} />;
      })}
    </svg>
  );
}

/**
 * Position on the wheel for a cycle position, clockwise from the top.
 * Rounded so the server and the browser render identical styles.
 */
function polar(index: number, radius: number): { left: string; top: string } {
  const angle = (index / 12) * 2 * Math.PI;
  return {
    left: `${(50 + radius * Math.sin(angle)).toFixed(3)}%`,
    top: `${(50 - radius * Math.cos(angle)).toFixed(3)}%`,
  };
}

/** Staggers orb entrances by 40 ms, clockwise from the birth year. */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

/** Each orb fades in and swells gently into place. */
const itemVariants = {
  hidden: { scale: 0.6, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: { duration: MOTION.gentle, ease: EASE.enter },
  },
};

export function CycleChart({
  cycle,
  totalScore,
  birthYear,
  birthMonth,
  birthDay,
  weekday,
  selectedYear,
  onSelectPillar,
  onReturnToCurrent,
}: CycleChartProps) {
  const currentYear = new Date().getFullYear();
  const activeYear = getActiveYear(currentYear, birthMonth, birthDay);
  const currentColumn = getCurrentYearColumn(birthYear, currentYear, birthMonth, birthDay);
  const monthOfYear = getMonthOfActiveYear(birthMonth, birthDay);
  const selectedIndex = getCycleIndex(birthYear, selectedYear);
  // The twelve calendar years of the cycle that holds the selected year
  const cycleStart = selectedYear - selectedIndex;
  const showsActiveYear = activeYear >= cycleStart && activeYear < cycleStart + 12;

  const [readingOpen, setReadingOpen] = useState(false);
  const orbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rippleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const hubRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const readingRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const wasOpen = useRef(false);
  // False when the reading closed because of a tap elsewhere on the page, so
  // focus stays with whatever was tapped instead of jumping back to the wheel.
  const returnFocus = useRef(true);
  const headingId = useId();

  const selected = interpretYear(cycle[selectedIndex]);
  const selectedAnimal = getZodiacAnimalForYear(selectedYear);

  // Move focus into the reading when it opens and back to the center when it
  // closes, so keyboard and screen reader users stay where they were.
  // Layout effects run inside the commit, while passive effects wait for the
  // bloom's view transition to finish, which some browsers delay or never do.
  useLayoutEffect(() => {
    if (readingOpen) closeRef.current?.focus();
    else if (wasOpen.current && returnFocus.current) hubRef.current?.focus();
    wasOpen.current = readingOpen;
    returnFocus.current = true;
  }, [readingOpen]);

  function setOpen(open: boolean) {
    startTransition(() => setReadingOpen(open));
  }

  // Light dismiss: a tap or click anywhere outside the reading folds it back.
  // Attached in a layout effect for the same reason as the focus handling.
  useLayoutEffect(() => {
    if (!readingOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (readingRef.current?.contains(event.target as Node)) return;
      returnFocus.current = false;
      startTransition(() => setReadingOpen(false));
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [readingOpen]);

  // Return to now: after a quiet spell on another year, the selection glides
  // back to the current one. Never while a reading is open, the pointer rests
  // on the wheel, or the keyboard is working in it.
  useEffect(() => {
    if (!onReturnToCurrent || readingOpen || selectedYear === activeYear) return;
    let timer = 0;
    function isInUse(): boolean {
      const section = sectionRef.current;
      if (!section) return false;
      // Touch screens keep :hover on the last tap, so only real pointers count
      const hovered = window.matchMedia("(hover: hover)").matches && section.matches(":hover");
      let keyboardFocus = false;
      try {
        keyboardFocus = section.querySelector(":focus-visible") !== null;
      } catch {
        // Older engines without :focus-visible: treat focus as not keyboard
      }
      return hovered || keyboardFocus;
    }
    function restart() {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (isInUse()) restart();
        else onReturnToCurrent?.();
      }, RETURN_TO_CURRENT_MS);
    }
    restart();
    for (const type of ACTIVITY_EVENTS) window.addEventListener(type, restart, { passive: true });
    return () => {
      window.clearTimeout(timer);
      for (const type of ACTIVITY_EVENTS) window.removeEventListener(type, restart);
    };
  }, [onReturnToCurrent, readingOpen, selectedYear, activeYear]);

  // One soft ring spreads from a tapped number (CSS, so Reduce Motion skips it)
  function ripple(index: number) {
    const el = rippleRefs.current[index];
    if (!el) return;
    el.classList.remove("wheel-ripple-run");
    void el.offsetWidth; // restart the animation on a repeat tap
    el.classList.add("wheel-ripple-run");
  }

  function handleOrbClick(index: number) {
    ripple(index);
    if (index === selectedIndex) setOpen(true);
    else onSelectPillar?.(index);
  }

  // Tabs pattern (WAI-ARIA, automatic activation): arrows move focus and
  // selection together around the wheel, Home/End jump to the ends.
  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const targets: Record<string, number> = {
      ArrowRight: (index + 1) % 12,
      ArrowDown: (index + 1) % 12,
      ArrowLeft: (index + 11) % 12,
      ArrowUp: (index + 11) % 12,
      Home: 0,
      End: 11,
    };
    const next = targets[event.key];
    if (next === undefined) return;
    event.preventDefault();
    orbRefs.current[next]?.focus();
    onSelectPillar?.(next);
  }

  const arcLength = (RING_LENGTH * currentColumn) / 12;

  return (
    <section ref={sectionRef} aria-label="Life cycle chart" className="w-full">
      <div className="@container mx-auto grid w-full max-w-[440px] grid-cols-[minmax(0,1fr)]">
        {/* The ring: orbs, animals and the gold arc */}
        <div
          className={`wheel-depth-ring relative col-start-1 row-start-1 aspect-square w-full ${
            // Let taps on the ring fall through to the page, since browsers
            // differ on delivering pointer events that land on inert content.
            readingOpen ? "pointer-events-none" : ""
          }`}
          inert={readingOpen}
        >
          {/* A fine tick ring that turns very slowly */}
          <div aria-hidden="true" className="wheel-ticks pointer-events-none absolute inset-[9%] rounded-full" />
          <svg
            viewBox="0 0 100 100"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 size-full overflow-visible"
          >
            <circle cx="50" cy="50" r={ORB_RADIUS} fill="none" stroke="var(--color-border)" strokeWidth="0.5" />
            {arcLength > 0 && (
              <circle
                className="wheel-arc"
                cx="50"
                cy="50"
                r={ORB_RADIUS}
                fill="none"
                stroke="var(--color-gold)"
                strokeOpacity="0.7"
                strokeWidth="0.7"
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                strokeDasharray={`${arcLength} ${RING_LENGTH}`}
                style={{ "--arc-length": arcLength } as React.CSSProperties}
              />
            )}
          </svg>

          <motion.div
            role="tablist"
            aria-label="12-year life cycle"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {cycle.map((cycleNumber, index) => {
              const interp = interpretYear(cycleNumber);
              const year = cycleStart + index;
              const animal = getZodiacAnimalForYear(year);
              const isCurrent = year === activeYear;
              const isSelected = index === selectedIndex;

              const ariaLabel = [
                `${year}`,
                getLifeArea(index + 1),
                `cycle number ${cycleNumber}`,
                interp.label,
                `Year of the ${animal}`,
                isCurrent ? `current year, month ${monthOfYear} of 12` : "",
              ]
                .filter(Boolean)
                .join(", ");

              return (
                <motion.button
                  key={index}
                  ref={(el) => {
                    orbRefs.current[index] = el;
                  }}
                  id={`pillar-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls="cycle-detail-panel"
                  tabIndex={isSelected ? 0 : -1}
                  aria-label={ariaLabel}
                  data-tier={interp.tier}
                  variants={itemVariants}
                  whileTap={{ scale: PRESS.scale, transition: PRESS.spring }}
                  onClick={() => handleOrbClick(index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  style={{
                    ...polar(index, ORB_RADIUS),
                    // Each number floats at its own pace so the ring never moves in unison
                    "--breathe-duration": `${(5 + ((index * 7) % 5) * 0.9).toFixed(1)}s`,
                    "--breathe-delay": `${(-index * 1.3).toFixed(1)}s`,
                  } as React.CSSProperties}
                  className={[
                    "wheel-orb pressable absolute grid size-[clamp(44px,13cqw,58px)] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full pb-1.5",
                    "focus-visible:outline-offset-[6px]",
                    interp.tier === "zero" ? "text-ink-light" : "text-ink",
                    isCurrent ? "wheel-orb-current" : "",
                  ].join(" ")}
                >
                  <span
                    aria-hidden="true"
                    className="wheel-orb-number font-sans text-[clamp(1.05rem,5cqw,1.4rem)] font-medium leading-none tabular-nums"
                  >
                    {cycleNumber}
                  </span>
                  <span aria-hidden="true" className="wheel-thread" />
                  <span
                    aria-hidden="true"
                    ref={(el) => {
                      rippleRefs.current[index] = el;
                    }}
                    className="wheel-ripple pointer-events-none absolute inset-0 rounded-full"
                  />

                  {isCurrent && <MonthDial month={monthOfYear} />}

                  {/* Selection ring: one shared element that glides between orbs */}
                  {isSelected && (
                    <ViewTransition name="wheel-selection" share="auto" default="none">
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -inset-[5px] rounded-full ring-2 ring-ink"
                      />
                    </ViewTransition>
                  )}
                </motion.button>
              );
            })}
          </motion.div>

          {cycle.map((_, index) => (
            <span
              key={index}
              aria-hidden="true"
              style={polar(index, ANIMAL_RADIUS)}
              className={[
                "absolute -translate-x-1/2 -translate-y-1/2 transition-colors duration-[var(--duration-gentle)]",
                index === selectedIndex ? "text-gold-deep" : "text-ink-faint",
              ].join(" ")}
            >
              <ZodiacIcon
                animal={getZodiacAnimalForYear(cycleStart + index)}
                className="size-[clamp(16px,4.6cqw,22px)]"
              />
            </span>
          ))}
        </div>

        {/* Tab panel: a preview in the center, or the full reading over the wheel */}
        <div
          id="cycle-detail-panel"
          role="tabpanel"
          aria-labelledby={`pillar-${selectedIndex}`}
          className="pointer-events-none relative z-[1] col-start-1 row-start-1 grid min-w-0 grid-cols-[minmax(0,1fr)]"
        >
          {readingOpen ? (
            <ViewTransition name="wheel-bloom" share="auto" default="none">
              <div
                ref={readingRef}
                role="dialog"
                aria-modal="false"
                aria-labelledby={headingId}
                data-tier={selected.tier}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setOpen(false);
                }}
                className="wheel-reading pointer-events-auto relative m-[4cqw] min-h-[92cqw] rounded-3xl border border-border p-5 sm:p-7"
              >
                <button
                  ref={closeRef}
                  type="button"
                  aria-label="Close the reading"
                  onClick={() => setOpen(false)}
                  className="pressable absolute top-2 right-2 grid size-11 place-items-center rounded-full border border-border bg-parchment/70 text-ink hover:border-gold active:scale-[0.97]"
                >
                  <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M4 4l8 8M12 4l-8 8" />
                  </svg>
                </button>
                <DetailPanel
                  headingId={headingId}
                  cycleNumber={cycle[selectedIndex]}
                  columnIndex={selectedIndex}
                  birthYear={birthYear}
                  year={selectedYear}
                  isCurrent={selectedYear === activeYear}
                  weekday={weekday}
                />
              </div>
            </ViewTransition>
          ) : (
            <div className="wheel-depth-hub grid h-[100cqw] place-items-center">
              <ViewTransition name="wheel-bloom" share="auto" update="panel-swap" default="none">
                <button
                  ref={hubRef}
                  type="button"
                  data-tier={selected.tier}
                  aria-expanded={false}
                  aria-label={`Read ${selectedYear} in full: cycle number ${cycle[selectedIndex]}, ${selected.label}`}
                  onClick={() => setOpen(true)}
                  className="wheel-hub pressable pointer-events-auto flex aspect-square w-[52cqw] flex-col items-center justify-center gap-0.5 rounded-full px-[6cqw] text-center text-ink hover:brightness-110 active:scale-[0.97]"
                >
                  <span className="text-[clamp(0.75rem,3cqw,0.8rem)] uppercase tracking-[0.14em] text-ink-light">
                    {selectedYear}
                    {selectedYear === activeYear ? " · Now" : ""}
                  </span>
                  <span className="text-[clamp(0.75rem,3cqw,0.8rem)] uppercase tracking-[0.14em] text-ink-light">
                    {getLifeArea(selectedIndex + 1)}
                  </span>
                  <span className="font-sans text-[clamp(1.9rem,12cqw,3.25rem)] font-medium leading-none tabular-nums title-glow">
                    {cycle[selectedIndex]}
                  </span>
                  <span className={`text-[clamp(0.8rem,3.4cqw,0.95rem)] leading-tight ${getTierTextClass(selected.tier)}`}>
                    {selected.label}
                  </span>
                  {/* Too tight for a sixth line on small phones; the ring and the full reading name the animal */}
                  <span className="inline-flex items-center gap-1 text-[clamp(0.75rem,3cqw,0.85rem)] text-ink-light @max-xs:hidden">
                    <ZodiacIcon animal={selectedAnimal} className="size-[1.4em] text-gold-deep" />
                    {selectedAnimal}
                  </span>
                  <span className="mt-0.5 text-[clamp(0.75rem,2.8cqw,0.8rem)] uppercase tracking-[0.14em] text-gold-deep">
                    Read more
                  </span>
                </button>
              </ViewTransition>
            </div>
          )}
        </div>
      </div>

      {/* The hints share one place and crossfade, keeping the space of the
          longest, so the total score below never jumps */}
      <p className="mt-3 grid text-center text-sm text-ink-light">
        <span aria-hidden={readingOpen} className={`col-start-1 row-start-1 ${HINT_FADE} ${readingOpen ? "opacity-0" : ""}`}>
          Tap a number to choose a year, then the center to read it in full.
          <span aria-hidden={!showsActiveYear} className={`block ${HINT_FADE} ${showsActiveYear ? "" : "opacity-0"}`}>
            The ring around {activeYear} shows month {monthOfYear} of 12, counted from the birthday.
          </span>
        </span>
        <span aria-hidden={!readingOpen} className={`col-start-1 row-start-1 ${HINT_FADE} ${readingOpen ? "" : "opacity-0"}`}>
          Tap outside the reading to close it and choose another year.
        </span>
      </p>

      <TotalScoreCard totalScore={totalScore} />
    </section>
  );
}
