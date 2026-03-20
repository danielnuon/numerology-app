export function SectionDivider() {
  return (
    <div className="relative my-24 mx-auto w-full max-w-[600px]">
      <div className="border-t border-border" />
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-parchment px-4 text-gold text-sm">
        ◇
      </span>
    </div>
  );
}
