/**
 * @jest-environment jsdom
 */
import * as fs from "fs";
import * as path from "path";
import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MARK_LIT_THREAD, MARK_THREADS, SoliniMark, threadSway } from "../solini-mark";

describe("SoliniMark", () => {
  it("weaves one thread for each year of the cycle and lights one", () => {
    expect(MARK_THREADS).toHaveLength(12);
    const { container } = render(<SoliniMark />);
    expect(container.querySelectorAll(".mark-thread")).toHaveLength(12);
    expect(container.querySelectorAll(".mark-light rect.fill-gold-light")).toHaveLength(1);
  });

  it("is decorative, since the name Solini is always written beside it", () => {
    const { container } = render(<SoliniMark />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("plays the weave only when asked, laying the bottom thread first", () => {
    const { container: still } = render(<SoliniMark />);
    expect(still.querySelector("svg")).not.toHaveClass("mark-woven");
    const { container } = render(<SoliniMark woven />);
    expect(container.querySelector("svg")).toHaveClass("mark-woven");
    const threads = container.querySelectorAll<SVGRectElement>(".mark-thread");
    expect(threads[threads.length - 1].style.getPropertyValue("--weave-delay")).toBe("0ms");
    expect(threads[0].style.getPropertyValue("--weave-delay")).toBe("770ms");
  });

  it("sways most at the tip and least at the base, in a ripple that climbs", () => {
    const sway = MARK_THREADS.map((_, i) => parseFloat(threadSway(i)["--sway"]));
    for (let i = 1; i < sway.length; i++) expect(sway[i]).toBeLessThan(sway[i - 1]);
    expect(sway[0]).toBeLessThanOrEqual(2);
    expect(parseFloat(threadSway(0)["--sway-delay"])).toBeGreaterThan(
      parseFloat(threadSway(11)["--sway-delay"])
    );
  });

  it("on an iPhone, asks once for the phone's tilt when the flame is tapped", async () => {
    const requestPermission = jest.fn().mockResolvedValue("granted");
    Object.defineProperty(window, "DeviceOrientationEvent", {
      configurable: true,
      value: { requestPermission },
    });
    try {
      render(<SoliniMark reactive />);
      const ask = await screen.findByRole("button", { name: "Let the flame follow your phone's tilt" });
      await act(async () => fireEvent.click(ask));
      expect(requestPermission).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    } finally {
      delete (window as { DeviceOrientationEvent?: unknown }).DeviceOrientationEvent;
    }
  });

  it("offers no tilt button where the browser can't share the tilt", () => {
    render(<SoliniMark reactive />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("draws the same threads as the app icon", () => {
    const icon = fs.readFileSync(path.resolve(__dirname, "../../../app/icon.svg"), "utf-8");
    for (const [i, thread] of MARK_THREADS.entries()) {
      const rect = `x="${thread.x.toFixed(2)}" y="${thread.y.toFixed(2)}" width="${thread.width.toFixed(2)}"`;
      expect(icon).toContain(rect);
      if (i === MARK_LIT_THREAD) expect(icon).toMatch(new RegExp(`${rect}[^>]*fill="#F0CD8C"`));
    }
  });
});
