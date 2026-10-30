/** @jest-environment jsdom */
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MARK_THREADS } from "@/components/ui/solini-mark";
import { FollowFlame, WEAVE_THREADS, WovenDivider, followThreadRange } from "@/components/ui/woven-flame-parts";

const BASE = MARK_THREADS.length - 1;

describe("WovenDivider", () => {
  it("lays the twelve threads end to end inside the drawing, base thread at the center", () => {
    const sorted = [...WEAVE_THREADS].sort((a, b) => a.x - b.x);
    expect(sorted[0].x).toBeGreaterThanOrEqual(0);
    expect(sorted[sorted.length - 1].x + sorted[sorted.length - 1].width).toBeLessThanOrEqual(560);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].x).toBeGreaterThan(sorted[i - 1].x + sorted[i - 1].width);
    }
    const base = WEAVE_THREADS[BASE];
    expect(base.x + base.width / 2).toBeCloseTo(280);
  });

  it("unweaves base first, each thread above a little later", () => {
    const starts = WEAVE_THREADS.map((t) => parseFloat(t.range.split(" ")[1]));
    for (let i = 0; i < BASE; i++) expect(starts[i]).toBeGreaterThan(starts[i + 1]);
  });

  it("is decorative", () => {
    const { container } = render(<WovenDivider />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelectorAll("rect")).toHaveLength(MARK_THREADS.length);
  });
});

describe("FollowFlame", () => {
  it("lights the threads above the base in order across the whole page", () => {
    expect(followThreadRange(BASE - 1)).toBe("0.00% 9.09%");
    expect(followThreadRange(0)).toBe("90.91% 100.00%");
  });

  it("lifts off the mark beside Solini and is hidden from screen readers", () => {
    const { container } = render(
      <>
        <span data-follow-from="" />
        <FollowFlame />
      </>
    );
    const flame = container.querySelector(".follow-flame") as HTMLElement;
    expect(flame).toHaveAttribute("aria-hidden", "true");
    expect(flame.dataset.ready).toBe("true");
    expect(flame.style.getPropertyValue("--from-x")).toMatch(/px$/);
  });
});
