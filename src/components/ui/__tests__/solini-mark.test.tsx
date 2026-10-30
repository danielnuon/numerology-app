/**
 * @jest-environment jsdom
 */
import * as fs from "fs";
import * as path from "path";
import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  MARK_LIT_THREAD,
  MARK_THREADS,
  MENU_CLOSE_THREADS,
  SoliniMark,
  markThread,
  menuThreadClose,
  threadSway,
} from "../solini-mark";

describe("SoliniMark", () => {
  it("weaves one thread for each year of the cycle and lights one", () => {
    expect(MARK_THREADS).toHaveLength(12);
    const { container } = render(<SoliniMark />);
    expect(container.querySelectorAll(".mark-thread")).toHaveLength(12);
    expect(container.querySelectorAll(".mark-light rect.fill-gold-light")).toHaveLength(1);
  });

  it("counts the years up from the base and lights the first year on its own", () => {
    expect(MARK_LIT_THREAD).toBe(MARK_THREADS.length - 1);
    expect(markThread(0)).toBe(11);
    expect(markThread(11)).toBe(0);
    expect(markThread(12)).toBe(11);
    const litY = (container: HTMLElement) =>
      Number(container.querySelector(".mark-light rect.fill-gold-light")?.getAttribute("y"));
    expect(litY(render(<SoliniMark />).container)).toBe(MARK_THREADS[11].y);
    expect(litY(render(<SoliniMark year={3} />).container)).toBe(MARK_THREADS[8].y);
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

  it("turns into a close mark in the Menu button from the lit thread and the one above", () => {
    expect(MENU_CLOSE_THREADS).toEqual([MARK_LIT_THREAD - 1, MARK_LIT_THREAD]);
    const [above, lit] = MENU_CLOSE_THREADS.map(menuThreadClose);
    expect(lit["--open"]).toContain("rotate(45deg)");
    expect(above["--open"]).toContain("rotate(-45deg)");
    expect(lit["--open-opacity"]).toBe("1");
    // Every other thread fades, nearest the lit thread first
    const others = MARK_THREADS.map((_, i) => i).filter((i) => !MENU_CLOSE_THREADS.includes(i as never));
    for (const i of others) expect(menuThreadClose(i)["--open-opacity"]).toBe("0");
    expect(parseFloat(menuThreadClose(MARK_LIT_THREAD - 2)["--open-delay"])).toBeLessThan(
      parseFloat(menuThreadClose(0)["--open-delay"])
    );
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
