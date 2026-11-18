/** @jest-environment jsdom */
import { act, render } from "@testing-library/react";
import { RESTING_ATTR, RestOffscreen } from "../rest-offscreen";

/** A stand-in IntersectionObserver whose reports the test sends. */
class FakeObserver {
  static latest: FakeObserver;
  targets = new Set<Element>();
  constructor(public report: (entries: { target: Element; isIntersecting: boolean }[]) => void) {
    FakeObserver.latest = this;
  }
  observe(el: Element) {
    this.targets.add(el);
  }
  unobserve(el: Element) {
    this.targets.delete(el);
  }
  disconnect() {
    this.targets.clear();
  }
}

describe("RestOffscreen", () => {
  let frames: FrameRequestCallback[];
  const runFrame = () => act(() => frames.splice(0).forEach((frame) => frame(0)));
  const see = (el: Element, isIntersecting: boolean) => act(() => FakeObserver.latest.report([{ target: el, isIntersecting }]));

  beforeEach(() => {
    frames = [];
    Object.assign(window, { IntersectionObserver: FakeObserver });
    jest.spyOn(window, "requestAnimationFrame").mockImplementation((frame) => frames.push(frame));
    jest.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    document.body.innerHTML = `<h1 class="title-glow">Solini</h1><p>Plain text</p>`;
  });
  afterEach(() => jest.restoreAllMocks());

  it("rests a living surface while it is off screen and wakes it when it returns", () => {
    render(<RestOffscreen />);
    const title = document.querySelector(".title-glow")!;
    expect(FakeObserver.latest.targets.has(title)).toBe(true);
    expect(FakeObserver.latest.targets.has(document.querySelector("p")!)).toBe(false);

    see(title, false);
    expect(title.hasAttribute(RESTING_ATTR)).toBe(true);
    see(title, true);
    expect(title.hasAttribute(RESTING_ATTR)).toBe(false);
  });

  it("finds surfaces that arrive later and lets go of ones that leave", async () => {
    render(<RestOffscreen />);
    const title = document.querySelector(".title-glow")!;
    const orb = document.createElement("button");
    orb.className = "lamp-orb";
    await act(async () => {
      document.body.append(orb);
      title.remove();
    });
    runFrame();
    expect(FakeObserver.latest.targets.has(orb)).toBe(true);
    expect(FakeObserver.latest.targets.has(title)).toBe(false);
  });

  it("wakes everything when it unmounts", () => {
    const { unmount } = render(<RestOffscreen />);
    const title = document.querySelector(".title-glow")!;
    see(title, false);
    unmount();
    expect(title.hasAttribute(RESTING_ATTR)).toBe(false);
  });
});
