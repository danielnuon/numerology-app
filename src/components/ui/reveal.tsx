/**
 * Reveal
 *
 * Opens and closes a disclosure's content smoothly. The slot's height eases
 * between nothing and the content's height (grid rows 0fr → 1fr), so the
 * page below glides instead of jumping, and the content fades and settles
 * in. Closed content stays mounted but inert and hidden from assistive
 * technology, so it can animate out as well as in. See "Transitions" in
 * docs/standards/design-language.md.
 */

interface Props {
  open: boolean;
  /** For the toggle's aria-controls. */
  id?: string;
  /** Classes for the content wrapper (spacing, layout). */
  className?: string;
  children: React.ReactNode;
}

export function Reveal({ open, id, className = "", children }: Props) {
  return (
    <div
      id={id}
      data-open={open}
      inert={!open}
      aria-hidden={!open}
      className="reveal"
    >
      <div className="reveal-clip">
        <div className={`reveal-content ${className}`}>{children}</div>
      </div>
    </div>
  );
}
