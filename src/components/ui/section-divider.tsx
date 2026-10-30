/**
 * A hairline that fades out at both ends, with a small gold diamond at its
 * center. "compact" is for the landing page, where the hero and the form card
 * must share the first screen of a phone.
 */
export function SectionDivider({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`rise ${compact ? "my-7 sm:my-14 [@media(max-height:700px)]:my-5" : "my-20"} mx-auto flex w-full max-w-[600px] items-center gap-4`}
      style={{ "--rise-delay": "700ms" } as React.CSSProperties}
      aria-hidden="true"
    >
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
      <span className="text-gold text-sm">◇</span>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
    </div>
  );
}
