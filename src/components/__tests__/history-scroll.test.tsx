/** @jest-environment jsdom */
import { act, render } from "@testing-library/react";
import { HistoryScroll, RESTORE_WINDOW_MS } from "../history-scroll";

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
