/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Reveal } from "../reveal";

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
