/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MorePages } from "@/components/ui/page-parts";

const linkNames = () => screen.getAllByRole("link").map((link) => link.textContent);

describe("MorePages", () => {
  it("lists every page but the current one, in two groups", () => {
    render(<MorePages current="/about" />);
    expect(linkNames()).toEqual(["Your cycle", "How your cycle is made", "What the numbers mean", "Our heritage"]);
    expect(screen.getByText("Your reading")).toBeInTheDocument();
    expect(screen.getByText("Our story")).toBeInTheDocument();
  });

  it("leaves out pages already linked just above, and drops a group left empty", () => {
    render(<MorePages current="/" linkedAbove={["/how-it-works", "/meaning"]} />);
    expect(linkNames()).toEqual(["About Solini", "Our heritage"]);
    expect(screen.queryByText("Your reading")).not.toBeInTheDocument();
  });
});
