/**
 * @jest-environment jsdom
 */
import { act, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Reveal, useLastPresent } from "../reveal";

describe("Reveal", () => {
  it("keeps closed content mounted but inert and hidden from assistive technology", () => {
    render(
      <Reveal open={false} id="more">
        <button type="button">Inside</button>
      </Reveal>
    );
    const panel = document.getElementById("more")!;
    expect(panel).toHaveAttribute("data-open", "false");
    expect(panel).toHaveAttribute("aria-hidden", "true");
    expect(panel).toHaveAttribute("inert");
    expect(screen.queryByRole("button", { name: "Inside" })).not.toBeInTheDocument();
  });

  it("opens to reachable content", () => {
    render(
      <Reveal open id="more">
        <button type="button">Inside</button>
      </Reveal>
    );
    const panel = document.getElementById("more")!;
    expect(panel).toHaveAttribute("data-open", "true");
    expect(panel).not.toHaveAttribute("inert");
    expect(screen.getByRole("button", { name: "Inside" })).toBeInTheDocument();
  });
});

describe("Reveal motion", () => {
  type Frames = Keyframe[];
  let calls: { el: Element; frames: Frames; finish: () => void }[];
  const original = HTMLElement.prototype.animate;

  beforeEach(() => {
    calls = [];
    HTMLElement.prototype.animate = function (this: HTMLElement, frames: Keyframe[] | PropertyIndexedKeyframes | null) {
      let finish = () => {};
      const finished = new Promise((resolve) => {
        finish = () => resolve(undefined);
      });
      calls.push({ el: this, frames: frames as Frames, finish });
      return { finished, reverse: jest.fn(), cancel: jest.fn() } as unknown as Animation;
    };
  });

  afterEach(() => {
    HTMLElement.prototype.animate = original;
  });

  function Page({ open }: { open: boolean }) {
    return (
      <div>
        <Reveal open={open} id="more">
          <p>Inside</p>
        </Reveal>
        <p data-testid="below">Below</p>
      </div>
    );
  }

  it("glides only with transform, clip-path and opacity, never with layout properties", () => {
    const { rerender } = render(<Page open={false} />);
    // jsdom has no layout, so make the content below move when the slot opens
    jest.spyOn(screen.getByTestId("below"), "getBoundingClientRect").mockImplementation(() =>
      ({ top: document.getElementById("more")!.hasAttribute("data-shown") ? 200 : 0 }) as DOMRect
    );
    rerender(<Page open />);
    const properties = new Set(calls.flatMap(({ frames }) => frames.flatMap((frame) => Object.keys(frame))));
    properties.delete("offset");
    expect([...properties].sort()).toEqual(["clipPath", "opacity", "transform"]);
    expect(calls.find(({ el }) => el === screen.getByTestId("below"))?.frames[0]).toEqual({ transform: "translateY(-200px)" });
  });

  it("keeps the content laid out until the closing glide ends", async () => {
    const { rerender } = render(<Page open />);
    rerender(<Page open={false} />);
    const panel = document.getElementById("more")!;
    expect(panel).toHaveAttribute("aria-hidden", "true");
    expect(panel).toHaveAttribute("data-shown");
    await act(async () => calls.forEach(({ finish }) => finish()));
    expect(panel).not.toHaveAttribute("data-shown");
  });

  it("opens and closes at once with Reduce Motion", () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
    const { rerender } = render(<Page open={false} />);
    rerender(<Page open />);
    expect(document.getElementById("more")).toHaveAttribute("data-shown");
    rerender(<Page open={false} />);
    expect(document.getElementById("more")).not.toHaveAttribute("data-shown");
    expect(calls).toHaveLength(0);
    delete (window as { matchMedia?: unknown }).matchMedia;
  });
});

describe("useLastPresent", () => {
  function Held({ value }: { value: string | null }) {
    return <p>{useLastPresent(value) ?? "nothing yet"}</p>;
  }

  it("keeps showing the last value while it folds away", () => {
    const { rerender } = render(<Held value={null} />);
    expect(screen.getByText("nothing yet")).toBeInTheDocument();
    rerender(<Held value="Enter a day from 1 to 31." />);
    rerender(<Held value={null} />);
    expect(screen.getByText("Enter a day from 1 to 31.")).toBeInTheDocument();
    rerender(<Held value="Enter a month from 1 to 12." />);
    expect(screen.getByText("Enter a month from 1 to 12.")).toBeInTheDocument();
  });
});
