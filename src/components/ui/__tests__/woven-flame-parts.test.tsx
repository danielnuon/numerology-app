/** @jest-environment jsdom */
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MARK_THREADS } from "@/components/ui/solini-mark";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  FOLLOW_GLIDE_PX,
  FollowFlame,
  WEAVE_THREADS,
  WovenDivider,
  followThreadRange,
} from "@/components/ui/woven-flame-parts";

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

  describe("on arrival", () => {
    let report: (isIntersecting: boolean) => void;
    const original = global.IntersectionObserver;
    beforeEach(() => {
      global.IntersectionObserver = class {
        constructor(callback: IntersectionObserverCallback) {
          report = (isIntersecting) =>
            callback([{ isIntersecting } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
        }
        observe() {}
        disconnect() {}
      } as unknown as typeof IntersectionObserver;
    });
    afterEach(() => {
      global.IntersectionObserver = original;
    });

    it("unweaves on a clock when it is on screen once the page has its scroll position", () => {
      const { container } = render(<WovenDivider />);
      report(true);
      expect((container.firstElementChild as HTMLElement).dataset.arrive).toBe("true");
    });

    it("stays on the scroll when it is off screen, including above a restored scroll position", () => {
      const { container } = render(<WovenDivider />);
      report(false);
      expect((container.firstElementChild as HTMLElement).dataset.arrive).toBeUndefined();
    });
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

  /** Sets how far the page can scroll, which jsdom doesn't lay out. */
  const setScrollRange = (range: number) =>
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: window.innerHeight + range,
    });

  it("lifts off the mark beside Solini and is hidden from screen readers", () => {
    setScrollRange(FOLLOW_GLIDE_PX * 4);
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

  it("measures its glide by the same scroll range the CSS uses", () => {
    const css = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");
    const glide = css.match(/\.follow-mark \{[^}]*animation-range: 0px (\d+)px/);
    expect(Number(glide?.[1])).toBe(FOLLOW_GLIDE_PX);
  });

  it("stays home on a page too short to scroll through its glide", () => {
    setScrollRange(FOLLOW_GLIDE_PX - 1);
    const { container } = render(
      <>
        <span data-follow-from="" />
        <FollowFlame />
      </>
    );
    const flame = container.querySelector(".follow-flame") as HTMLElement;
    expect(flame.dataset.ready).toBeUndefined();
  });
});
