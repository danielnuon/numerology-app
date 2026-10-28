/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AboutPage from "../page";

describe("About page", () => {
  it("shows the worked example's cycle and total from the calculation", () => {
    render(<AboutPage />);
    const example = screen.getByLabelText(/Worked example for 24 July 1997/);
    // Cycle from the system spec's worked example
    const cells = Array.from(example.querySelectorAll("div.grid"))
      .at(-1)!
      .querySelectorAll("span");
    expect(Array.from(cells, (c) => c.textContent)).toEqual(
      ["3", "6", "9", "5", "8", "11", "2", "0", "2", "4", "6", "8"]
    );
    expect(screen.getByText(/Total score 64/)).toBeInTheDocument();
  });

  it("links back to the reading", () => {
    render(<AboutPage />);
    expect(screen.getByRole("link", { name: "See your cycle" })).toHaveAttribute("href", "/");
  });
});
