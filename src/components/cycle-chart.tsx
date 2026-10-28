"use client";

/**
 * CycleChart
 *
 * The 12-year cycle as a wheel of lantern orbs, starting at the top with the
 * birth year and running clockwise, each with its zodiac animal outside it.
 * A gold arc traces the cycle from the birth year to this year.
 *
 * The orbs behave like tabs: one is always selected, arrow keys move focus
 * and selection together, and the centre of the wheel (the tab panel) shows a
 * short preview of the selected year. Tapping the centre, or the selected
 * orb again, blooms the full reading out over the wheel with a native view
 * transition; Escape, the close button or a tap outside it folds it back.
 */

import {
  useEffect,
  useId,
  useRef,
  useState,
  startTransition,
  ViewTransition,
} from "react";
import { motion } from "motion/react";
import { interpretYear, interpretTotal } from "@/lib/numerology/interpretation";
import { getActiveYear, getCycleIndex, getLifeArea } from "@/lib/numerology/year-lookup";
import { getZodiacAnimalForYear } from "@/lib/numerology/zodiac";
import { getTierTextClass, getCurrentYearColumn } from "@/lib/numerology/chart-helpers";
import { ZodiacIcon } from "@/components/ui/zodiac-icon";
import { DetailPanel } from "./detail-panel";
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
  /** The selected calendar year; its orb is the selected tab. */
  selectedYear: number;
  /** Called with the 0-indexed position when an orb is chosen. */
  onSelectPillar?: (columnIndex: number) => void;
}

/** Orbs sit on this ring, as a percentage of the wheel's width. */
const ORB_RADIUS = 36;
/** Zodiac animals sit just outside the orbs. */
const ANIMAL_RADIUS = 48;
/** Length of the full ring in SVG units (viewBox is 100 × 100). */
const RING_LENGTH = 2 * Math.PI * ORB_RADIUS;

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
  selectedYear,
  onSelectPillar,
}: CycleChartProps) {
  const currentYear = new Date().getFullYear();
  const activeYear = getActiveYear(currentYear, birthMonth, birthDay);
  const currentColumn = getCurrentYearColumn(birthYear, currentYear, birthMonth, birthDay);
  const selectedIndex = getCycleIndex(birthYear, selectedYear);
  // The twelve calendar years of the cycle that holds the selected year
  const cycleStart = selectedYear - selectedIndex;

  const [readingOpen, setReadingOpen] = useState(false);
  const orbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const hubRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const readingRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  // False when the reading closed because of a tap elsewhere on the page, so
  // focus stays with whatever was tapped instead of jumping back to the wheel.
  const returnFocus = useRef(true);
  const headingId = useId();

  const selected = interpretYear(cycle[selectedIndex]);
  const selectedAnimal = getZodiacAnimalForYear(selectedYear);
  const totalInterp = interpretTotal(totalScore);

  // Move focus into the reading when it opens and back to the centre when it
  // closes, so keyboard and screen reader users stay where they were.
  useEffect(() => {
    if (readingOpen) closeRef.current?.focus();
    else if (wasOpen.current && returnFocus.current) hubRef.current?.focus();
    wasOpen.current = readingOpen;
    returnFocus.current = true;
  }, [readingOpen]);

  function setOpen(open: boolean) {
    startTransition(() => setReadingOpen(open));
  }

  // Light dismiss: a tap or click anywhere outside the reading folds it back.
  useEffect(() => {
    if (!readingOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (readingRef.current?.contains(event.target as Node)) return;
      returnFocus.current = false;
      startTransition(() => setReadingOpen(false));
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [readingOpen]);

  function handleOrbClick(index: number) {
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
    <section aria-label="Life cycle chart" className="w-full">
      <div className="@container mx-auto grid w-full max-w-[440px] grid-cols-[minmax(0,1fr)]">
        {/* The ring: orbs, animals and the gold arc */}
        <div
          className="relative col-start-1 row-start-1 aspect-square w-full"
          inert={readingOpen}
        >
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
              const isCurrent = index === currentColumn;
              const isSelected = index === selectedIndex;

              const ariaLabel = [
                `${year}`,
                getLifeArea(index + 1),
                `cycle number ${cycleNumber}`,
                interp.label,
                `Year of the ${animal}`,
                isCurrent ? "current year" : "",
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
                  style={polar(index, ORB_RADIUS)}
                  className={[
                    "wheel-orb pressable absolute grid size-[clamp(44px,13cqw,58px)] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full",
                    "focus-visible:outline-offset-[6px]",
                    interp.tier === "zero" ? "text-ink-light" : "text-ink",
                    isCurrent ? "wheel-orb-current" : "",
                  ].join(" ")}
                >
                  <span
                    aria-hidden="true"
                    className="font-sans text-[clamp(1.05rem,5cqw,1.4rem)] font-medium leading-none tabular-nums"
                  >
                    {cycleNumber}
                  </span>

                  {/* Current year marker */}
                  {isCurrent && (
                    <span
                      aria-hidden="true"
                      className="absolute top-0.5 right-0.5 size-1.5 rounded-full bg-gold-deep shadow-[0_0_8px_rgba(226,182,90,0.8)]"
                    />
                  )}

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

        {/* Tab panel: a preview in the centre, or the full reading over the wheel */}
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
                  className="pressable absolute top-2 right-2 grid size-11 place-items-center rounded-full border border-border bg-parchment/70 text-ink hover:border-gold"
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
                />
              </div>
            </ViewTransition>
          ) : (
            <div className="grid h-[100cqw] place-items-center">
              <ViewTransition name="wheel-bloom" share="auto" update="panel-swap" default="none">
                <button
                  ref={hubRef}
                  type="button"
                  data-tier={selected.tier}
                  aria-expanded={false}
                  aria-label={`Read ${selectedYear} in full: cycle number ${cycle[selectedIndex]}, ${selected.label}`}
                  onClick={() => setOpen(true)}
                  className="wheel-hub pressable pointer-events-auto flex aspect-square w-[52cqw] flex-col items-center justify-center gap-0.5 rounded-full px-[6cqw] text-center text-ink hover:brightness-110"
                >
                  <span className="text-[clamp(0.6rem,3cqw,0.72rem)] uppercase tracking-[0.14em] text-ink-light">
                    {selectedYear}
                    {selectedYear === activeYear ? " · Now" : ""}
                  </span>
                  <span className="text-[clamp(0.6rem,3cqw,0.72rem)] uppercase tracking-[0.14em] text-ink-light">
                    {getLifeArea(selectedIndex + 1)}
                  </span>
                  <span className="font-sans text-[clamp(2.1rem,12cqw,3.25rem)] font-medium leading-none tabular-nums title-glow">
                    {cycle[selectedIndex]}
                  </span>
                  <span className={`text-[clamp(0.72rem,3.4cqw,0.9rem)] leading-tight ${getTierTextClass(selected.tier)}`}>
                    {selected.label}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[clamp(0.65rem,3cqw,0.8rem)] text-ink-light">
                    <ZodiacIcon animal={selectedAnimal} className="size-[1.4em] text-gold-deep" />
                    {selectedAnimal}
                  </span>
                  <span className="mt-0.5 text-[clamp(0.58rem,2.8cqw,0.7rem)] uppercase tracking-[0.14em] text-gold-deep">
                    Read more
                  </span>
                </button>
              </ViewTransition>
            </div>
          )}
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-ink-light">
        {readingOpen
          ? "Tap outside the reading to close it and choose another year."
          : "Tap a number to choose a year, then the centre to read it in full."}
      </p>

      {/* Total score summary */}
      <div
        className={[
          "mt-6 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4",
          "rounded-xl border border-border bg-parchment/40 px-5 py-4",
        ].join(" ")}
      >
        <div className="flex shrink-0 items-baseline gap-2">
          <span className="text-ink-light text-sm uppercase tracking-widest whitespace-nowrap">
            Total score
          </span>
          <span className="font-display text-3xl text-gold-deep title-glow tabular-nums">{totalScore}</span>
        </div>
        <div className="hidden sm:block w-px h-8 bg-border" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-ink leading-tight">
            {totalInterp.label}
          </p>
          <p className="text-sm text-ink-light">{totalInterp.description}</p>
        </div>
      </div>
    </section>
  );
}
