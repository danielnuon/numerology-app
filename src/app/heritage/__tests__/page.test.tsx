/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import HeritagePage from "../page";

describe("Our heritage page", () => {
  it("has a section for each part of the story, reachable by anchor", () => {
    const { container } = render(<HeritagePage />);
    for (const id of ["khmer-or-cambodian", "origins", "angkor", "independence", "khmer-rouge", "our-family", "what-endured", "sources"]) {
      expect(container.querySelector(`section#${id} h2`)).not.toBeNull();
    }
  });

  it("says plainly where history is still debated", () => {
    render(<HeritagePage />);
    expect(screen.getByText(/How far Funan was a Khmer kingdom is still debated/)).toBeInTheDocument();
    expect(screen.getByText(/How much each mattered is still debated/)).toBeInTheDocument();
    expect(screen.getByText(/Estimates differ because so few records survived/)).toBeInTheDocument();
  });

  it("links every source to its page", () => {
    const { container } = render(<HeritagePage />);
    const sources = container.querySelectorAll("#sources li a");
    expect(sources.length).toBeGreaterThan(0);
    for (const link of sources) expect(link.getAttribute("href")).toMatch(/^https:\/\//);
  });
});
