/** @jest-environment jsdom */
import { readFileSync } from "fs";
import { join } from "path";
import { act, fireEvent, render, screen } from "@testing-library/react";
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

  // Captures the IntersectionObserver the follow flame watches the mark with
  let report: (entry: Partial<IntersectionObserverEntry>) => void = () => {};
  beforeEach(() => {
    window.IntersectionObserver = jest.fn((callback: IntersectionObserverCallback) => {
      report = (entry) => act(() => callback([entry as IntersectionObserverEntry], {} as IntersectionObserver));
      return { observe: jest.fn(), disconnect: jest.fn() };
    }) as unknown as typeof IntersectionObserver;
  });

  function renderPage() {
    const { container } = render(
      <>
        <a href="#top">
          <span data-follow-from="" />
          Solini
        </a>
        <FollowFlame />
      </>
    );
    return container.querySelector(".follow-flame") as HTMLButtonElement;
  }

  it("waits, out of reach, while the mark beside Solini is on screen", () => {
    const flame = renderPage();
    report({ isIntersecting: true, boundingClientRect: { bottom: 60 } as DOMRect });
    expect(flame).not.toHaveAttribute("data-shown");
    expect(flame).toHaveAttribute("inert");
  });

  it("arrives as a Back to top button once the mark has scrolled off the top", () => {
    const flame = renderPage();
    report({ isIntersecting: false, boundingClientRect: { bottom: -20 } as DOMRect });
    expect(flame).toHaveAttribute("data-shown", "true");
    expect(flame).not.toHaveAttribute("inert");
    expect(screen.getByRole("button", { name: "Back to top" })).toBe(flame);
    report({ isIntersecting: true, boundingClientRect: { bottom: 10 } as DOMRect });
    expect(flame).not.toHaveAttribute("data-shown");
  });

  it("scrolls to the top and hands focus to the Solini link", () => {
    window.scrollTo = jest.fn();
    const flame = renderPage();
    report({ isIntersecting: false, boundingClientRect: { bottom: -20 } as DOMRect });
    fireEvent.click(flame);
    expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
    expect(document.activeElement).toBe(screen.getByRole("link", { name: "Solini" }));
  });

  it("arrives and leaves on a timed transition, not on the scroll", () => {
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
    const rule = css.match(/\.follow-flame\[data-shown\] \{([^}]*)\}/)?.[1] ?? "";
    expect(rule).toMatch(/transition:/);
    expect(css).not.toMatch(/\.follow-mark\s*\{[^}]*animation-timeline/);
  });
});
