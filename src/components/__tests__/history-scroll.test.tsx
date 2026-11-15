/** @jest-environment jsdom */
import { act, render } from "@testing-library/react";
import { HistoryScroll, REGROW_WINDOW_MS, RESTORE_WINDOW_MS, SCROLL_STORAGE_PREFIX } from "../history-scroll";

describe("HistoryScroll", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("makes scrolling instant while Back or Forward restores the page, then hands it back", () => {
    render(<HistoryScroll />);
    const html = document.documentElement;
    expect(html.style.scrollBehavior).toBe("");

    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(html.style.scrollBehavior).toBe("auto");

    act(() => {
      jest.advanceTimersByTime(RESTORE_WINDOW_MS);
    });
    expect(html.style.scrollBehavior).toBe("");
  });

  it("leaves nothing behind when it unmounts mid-step", () => {
    const { unmount } = render(<HistoryScroll />);
    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    unmount();
    expect(document.documentElement.style.scrollBehavior).toBe("");
  });
});

describe("HistoryScroll: a reload of a page that grows after it loads", () => {
  let grow: () => void;
  let scrollTo: jest.Mock;
  const setPage = (scrollHeight: number, scrollY: number) => {
    Object.defineProperty(document.documentElement, "scrollHeight", { value: scrollHeight, configurable: true });
    Object.defineProperty(window, "scrollY", { value: scrollY, configurable: true });
  };
  const loadAs = (type: string) => {
    performance.getEntriesByType = jest.fn(() => [{ type }]) as never;
  };

  beforeEach(() => {
    jest.useFakeTimers();
    sessionStorage.clear();
    scrollTo = jest.fn();
    window.scrollTo = scrollTo as never;
    Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
    global.ResizeObserver = class {
      constructor(callback: () => void) {
        grow = callback;
      }
      observe() {}
      disconnect() {
        grow = () => {};
      }
    } as never;
  });
  afterEach(() => jest.useRealTimers());

  it("remembers the position when the page is hidden", () => {
    loadAs("navigate");
    setPage(2500, 900);
    render(<HistoryScroll />);
    window.dispatchEvent(new Event("pagehide"));
    expect(sessionStorage.getItem(`${SCROLL_STORAGE_PREFIX}/`)).toBe("900");
  });

  it("returns to the position once the saved reading has made the page tall enough", () => {
    loadAs("reload");
    sessionStorage.setItem(`${SCROLL_STORAGE_PREFIX}/`, "900");
    // The server's page holds only the form: the browser stops at its end
    setPage(1132, 332);
    render(<HistoryScroll />);
    grow();
    expect(scrollTo).not.toHaveBeenCalled();

    setPage(2500, 332);
    grow();
    expect(scrollTo).toHaveBeenCalledWith({ top: 900, behavior: "instant" });
  });

  it("leaves a first visit to the page alone", () => {
    loadAs("navigate");
    sessionStorage.setItem(`${SCROLL_STORAGE_PREFIX}/`, "900");
    setPage(2500, 0);
    render(<HistoryScroll />);
    grow?.();
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("gives way as soon as the visitor scrolls or taps, and after a few seconds", () => {
    loadAs("reload");
    sessionStorage.setItem(`${SCROLL_STORAGE_PREFIX}/`, "900");
    setPage(1132, 332);
    const { unmount } = render(<HistoryScroll />);
    window.dispatchEvent(new Event("touchstart"));
    setPage(2500, 332);
    grow();
    expect(scrollTo).not.toHaveBeenCalled();
    unmount();

    setPage(1132, 332);
    render(<HistoryScroll />);
    act(() => {
      jest.advanceTimersByTime(REGROW_WINDOW_MS);
    });
    setPage(2500, 332);
    grow();
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
