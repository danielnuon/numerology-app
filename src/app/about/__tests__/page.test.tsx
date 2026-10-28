/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AboutPage from "../page";

describe("About page", () => {
  it("links to the two companion pages and back to the reading", () => {
    render(<AboutPage />);
    expect(screen.getByRole("link", { name: /worked through, step by step/ })).toHaveAttribute("href", "/how-it-works");
    expect(screen.getByRole("link", { name: /What each number and life area means/ })).toHaveAttribute("href", "/meaning");
    expect(screen.getByRole("link", { name: "See your cycle" })).toHaveAttribute("href", "/");
  });
});
