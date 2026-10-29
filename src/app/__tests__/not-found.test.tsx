/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import NotFound from "../not-found";

describe("Not-found page", () => {
  it("says the page doesn't exist and leads home and to every companion page", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { level: 1, name: "No lantern here" })).toBeInTheDocument();
    expect(screen.getByText(/doesn't exist/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "See your cycle" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "How your cycle is made" })).toHaveAttribute("href", "/how-it-works");
    expect(screen.getByRole("link", { name: "What the numbers mean" })).toHaveAttribute("href", "/meaning");
    expect(screen.getByRole("link", { name: "Your cycle" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "About Solini" })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: "Our heritage" })).toHaveAttribute("href", "/heritage");
  });
});
