/**
 * @jest-environment jsdom
 */
import * as fs from "fs";
import * as path from "path";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FlameAnchor, PageFlame, resetPageArrival } from "../flame-anchor";
import { SoliniMark } from "../solini-mark";

const css = fs.readFileSync(path.join(__dirname, "../../../app/globals.css"), "utf8");

describe("page arrival", () => {
  beforeEach(() => resetPageArrival());

  it("weaves the flame in on the first page, and lands it on pages reached by a link", () => {
    const first = render(<PageFlame />);
    expect(first.container.querySelector(".solini-mark")).toHaveClass("mark-woven");
    expect(first.container.querySelector(".solini-mark")).not.toHaveClass("mark-landed");
    first.unmount();

    const next = render(<PageFlame />);
    const mark = next.container.querySelector(".solini-mark");
    expect(mark).toHaveClass("mark-landed");
    expect(mark).not.toHaveClass("mark-woven");
  });

  it("names the page's flame so it travels to the next page", () => {
    const { container } = render(
      <FlameAnchor>
        <SoliniMark />
      </FlameAnchor>
    );
    expect(container.firstChild).toHaveClass("flame-anchor");
    expect(css).toMatch(/\.flame-anchor\s*\{\s*view-transition-name:\s*solini-flame;/);
    expect(css).toMatch(/\.flame-anchor\[data-out-of-view\]\s*\{\s*view-transition-name:\s*none;/);
  });
});

describe("a landed flame", () => {
  it("skips the entrance and flares its lit thread once", () => {
    const { container } = render(<SoliniMark woven landed />);
    expect(container.querySelector(".solini-mark")).toHaveClass("mark-landed");
    expect(container.querySelectorAll(".mark-flare.mark-flare-landed")).toHaveLength(1);
  });

  it("has no flare when it arrives with its page", () => {
    const { container } = render(<SoliniMark woven />);
    expect(container.querySelector(".mark-flare")).toBeNull();
  });
});
