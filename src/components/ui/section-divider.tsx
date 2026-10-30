import { WovenDivider } from "@/components/ui/woven-flame-parts";

/**
 * A hairline that fades out at both ends, with a small gold diamond at its
 * center. "compact" is for the top of a page, where the hero and what follows
 * must share the first screen of a phone. Between the sections of a long page
 * the divider is woven instead: the flame's threads unweave into the line as
 * it scrolls into view (WovenDivider).
 */
export function SectionDivider({ compact = false }: { compact?: boolean }) {
  if (!compact) return <WovenDivider />;
  return (
    <div
      className="rise my-7 sm:my-14 [@media(max-height:700px)]:my-5 mx-auto flex w-full max-w-[600px] items-center gap-4"
      style={{ "--rise-delay": "700ms" } as React.CSSProperties}
      aria-hidden="true"
    >
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
      <span className="text-gold text-sm">◇</span>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
    </div>
  );
}
