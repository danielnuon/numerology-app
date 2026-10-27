/** A hairline that fades out at both ends, with a small gold diamond at its centre. */
export function SectionDivider() {
  return (
    <div
      className="rise my-20 mx-auto flex w-full max-w-[600px] items-center gap-4"
      style={{ "--rise-delay": "700ms" } as React.CSSProperties}
      aria-hidden="true"
    >
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
      <span className="text-gold text-sm">◇</span>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
    </div>
  );
}
