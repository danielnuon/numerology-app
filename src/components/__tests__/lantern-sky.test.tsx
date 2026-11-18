/** @jest-environment jsdom */
import { act, render } from "@testing-library/react";
import { SCROLL_WEIGHT } from "@/lib/motion";
import { LanternSky, ROUTE_SETTLE_MS } from "../lantern-sky";

let pathname = "/about";
jest.mock("next/navigation", () => ({ usePathname: () => pathname }));
jest.mock("../create-dust-worker", () => ({ createDustWorker: jest.fn() }));
jest.mock("motion/react", () => ({ useReducedMotion: () => false }));

/** Where each held animation has been sought to, as pixels of offset. */
function offsets(seeks: { currentTime: number }[]) {
  return seeks.map((seek) => seek.currentTime - SCROLL_WEIGHT.maxLag);
}

describe("LanternSky scroll weight", () => {
  let frames: FrameRequestCallback[];
  let now: number;
  let seeks: { currentTime: number }[];
  const runFrame = (ms = 16) =>
    act(() => {
      now += ms;
      frames.splice(0).forEach((frame) => frame(now));
    });
  const scrollTo = (y: number) =>
    act(() => {
      Object.defineProperty(window, "scrollY", { value: y, configurable: true });
      window.dispatchEvent(new Event("scroll"));
    });

  beforeEach(() => {
    frames = [];
    now = 1000;
    seeks = [];
    pathname = "/about";
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
    jest.spyOn(performance, "now").mockImplementation(() => now);
    jest.spyOn(window, "requestAnimationFrame").mockImplementation((frame) => frames.push(frame));
    jest.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;
    Element.prototype.animate = function () {
      const held = { currentTime: 0, pause() {}, cancel() {} };
      seeks.push(held);
      return held as unknown as Animation;
    };
  });
  afterEach(() => jest.restoreAllMocks());

  it("trails a scroll within the page", () => {
    render(<LanternSky />);
    scrollTo(300);
    runFrame();
    expect(Math.max(...offsets(seeks))).toBeGreaterThan(1);
  });

  it("doesn't trail the jump to a new page's scroll position", () => {
    const { rerender } = render(<LanternSky />);
    scrollTo(450);
    for (let i = 0; i < 120; i++) runFrame();
    expect(offsets(seeks).every((px) => px === 0)).toBe(true);

    // The route changes, and the new page opens at its top a frame later
    pathname = "/";
    rerender(<LanternSky />);
    runFrame();
    scrollTo(0);
    for (let i = 0; i < 10; i++) {
      runFrame();
      expect(offsets(seeks).every((px) => px === 0)).toBe(true);
    }

    // Once the page has settled, a scroll carries weight again
    now += ROUTE_SETTLE_MS;
    scrollTo(300);
    runFrame();
    expect(Math.max(...offsets(seeks).map(Math.abs))).toBeGreaterThan(1);
  });
});
