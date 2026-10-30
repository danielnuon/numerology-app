/**
 * @jest-environment jsdom
 */
import { swapInPlace } from "../swap-in-place";

function setReducedMotion(reduce: boolean) {
  window.matchMedia = ((query: string) => ({ matches: reduce, media: query })) as unknown as typeof window.matchMedia;
}

/** Web Animations stand-in whose animations finish when told to. */
function mockAnimate() {
  const started: { target: Element; keyframes: Keyframe[]; resolve: () => void; cancel: jest.Mock }[] = [];
  Element.prototype.animate = function (this: Element, keyframes: Keyframe[] | PropertyIndexedKeyframes | null) {
    let resolve = () => {};
    const finished = new Promise<void>((r) => {
      resolve = r;
    });
    const cancel = jest.fn();
    started.push({ target: this, keyframes: keyframes as Keyframe[], resolve, cancel });
    return { finished, cancel } as unknown as Animation;
  };
  return started;
}

function setup() {
  document.body.innerHTML = `<main><div id="card"><div id="slot"><p id="old">Old</p></div></div><div id="below"></div></main>`;
  return {
    slot: document.getElementById("slot")!,
    old: document.getElementById("old")!,
  };
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("swapInPlace", () => {
  afterEach(() => {
    delete (Element.prototype as Partial<Element>).animate;
  });

  it("swaps at once with Reduce Motion", () => {
    setReducedMotion(true);
    mockAnimate();
    const { slot, old } = setup();
    const swap = jest.fn();
    swapInPlace({ slot, outgoing: [old], swap, incoming: () => [] });
    expect(swap).toHaveBeenCalledTimes(1);
  });

  it("swaps at once without Web Animations", () => {
    setReducedMotion(false);
    const { slot, old } = setup();
    const swap = jest.fn();
    swapInPlace({ slot, outgoing: [old], swap, incoming: () => [] });
    expect(swap).toHaveBeenCalledTimes(1);
  });

  it("fades the old view out before laying out the new one, then fades the new one in", async () => {
    setReducedMotion(false);
    const started = mockAnimate();
    const { slot, old } = setup();
    const incoming = document.createElement("p");
    const swap = jest.fn(() => {
      old.replaceWith(incoming);
    });

    swapInPlace({ slot, outgoing: [old], swap, incoming: () => [incoming] });
    expect(swap).not.toHaveBeenCalled();
    expect(started.map((a) => a.target)).toEqual([old]);
    expect(started[0].keyframes.at(-1)).toMatchObject({ opacity: 0 });

    started[0].resolve();
    await flush();
    expect(swap).toHaveBeenCalledTimes(1);
    const fadeIn = started.find((a) => a.target === incoming)!;
    expect(fadeIn.keyframes[0]).toMatchObject({ opacity: 0 });

    // Once everything has played, the held frames are dropped together
    started.forEach((a) => a.resolve());
    await flush();
    started.forEach((a) => expect(a.cancel).toHaveBeenCalled());
  });

  it("finishes at once when asked, landing on the new view", () => {
    setReducedMotion(false);
    const started = mockAnimate();
    const { slot, old } = setup();
    const swap = jest.fn();
    const running = swapInPlace({ slot, outgoing: [old], swap, incoming: () => [] });
    running.finish();
    expect(swap).toHaveBeenCalledTimes(1);
    expect(started[0].cancel).toHaveBeenCalled();
    running.finish();
    expect(swap).toHaveBeenCalledTimes(1);
  });
});
