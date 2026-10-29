"use client";

/**
 * ReadingViewTabs
 *
 * A two-way switch at the top of the reading card, below the lg breakpoint,
 * between this year's reading and the 12-year wheel. Switching replaces one
 * view with the other in the same place, so nothing opens below the fold.
 * From lg up the card shows both side by side and the switch is hidden.
 *
 * It follows the tabs pattern: arrow keys move the choice and focus
 * together, and the ink outline glides between the two like every other
 * chooser.
 */

import { useRef, ViewTransition } from "react";

/** Which view of the reading the card shows on phones and tablets. */
export type ReadingView = "year" | "cycle";

/** Element ids of the two views, for the tabs' aria-controls. */
export const READING_VIEW_PANEL_IDS: Record<ReadingView, string> = {
  year: "reading-view-year",
  cycle: "reading-view-cycle",
};

const OPTIONS: { view: ReadingView; label: string }[] = [
  { view: "year", label: "This year" },
  { view: "cycle", label: "All 12 years" },
];

interface Props {
  /** The view the card is showing. */
  view: ReadingView;
  /** Called when the visitor picks the other view. */
  onChange: (view: ReadingView) => void;
}

export function ReadingViewTabs({ view, onChange }: Props) {
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKeyDown(event: React.KeyboardEvent, index: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next =
      event.key === "Home" ? 0 : event.key === "End" ? OPTIONS.length - 1 : (index + 1) % OPTIONS.length;
    optionRefs.current[next]?.focus();
    onChange(OPTIONS[next].view);
  }

  return (
    <div
      role="tablist"
      aria-label="Reading view"
      className="mx-auto mb-4 grid w-full max-w-[440px] grid-cols-2 gap-1 rounded-full border border-border p-1 lg:hidden"
    >
      {OPTIONS.map((option, index) => {
        const selected = option.view === view;
        return (
          <button
            key={option.view}
            ref={(el) => {
              optionRefs.current[index] = el;
            }}
            type="button"
            role="tab"
            id={`reading-view-tab-${option.view}`}
            aria-selected={selected}
            aria-controls={READING_VIEW_PANEL_IDS[option.view]}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.view)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={[
              "pressable relative min-h-[48px] min-w-0 whitespace-nowrap rounded-full px-2 text-base active:scale-[0.97]",
              // Ink marks the selection; gold is kept for "now"
              selected ? "font-medium text-ink" : "text-ink-light hover:text-ink",
            ].join(" ")}
          >
            {/* Selection outline: one shared element that glides between the two */}
            {selected && (
              <ViewTransition name="reading-view-selection" share="auto" default="none">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-full bg-ink/[0.06] ring-1 ring-inset ring-ink"
                />
              </ViewTransition>
            )}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
