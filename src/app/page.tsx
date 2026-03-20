import { SectionDivider } from "@/components/ui/section-divider";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-8 py-32">
      <h1 className="text-4xl font-light tracking-[0.08em] text-ink">
        Khmer Numerology
      </h1>
      <p className="mt-4 text-lg text-ink-light italic">
        Uncover the rhythm of your years
      </p>

      <SectionDivider />

      <div className="max-w-[480px] w-full rounded-sm border border-border bg-manuscript p-12 shadow-[0_1px_3px_rgba(44,36,23,0.08)]">
        <h2 className="text-center text-[22px] font-medium tracking-[0.02em]">
          Discover Your Life Cycle
        </h2>
        <p className="mt-6 text-center text-ink-light text-sm tracking-[0.04em]">
          Enter your birth date to reveal your 12-year cycle
        </p>
      </div>

      <SectionDivider />

      {/* Tier color preview */}
      <div className="flex gap-4">
        {[
          { label: "Very Strong", color: "bg-tier-very-strong", symbol: "●" },
          { label: "Strong", color: "bg-tier-strong", symbol: "◕" },
          { label: "Moderate", color: "bg-tier-moderate", symbol: "◑" },
          { label: "Weak", color: "bg-tier-weak", symbol: "◔" },
          { label: "Zero", color: "bg-tier-zero", symbol: "⊙" },
        ].map((tier) => (
          <div key={tier.label} className="flex flex-col items-center gap-2">
            <div
              className={`w-10 h-10 rounded-sm ${tier.color} opacity-20`}
            />
            <span className="text-sm text-ink-light">{tier.symbol}</span>
            <span className="text-xs text-ink-faint">{tier.label}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
