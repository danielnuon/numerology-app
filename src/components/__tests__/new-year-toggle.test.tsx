/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { NewYearToggle } from "../new-year-toggle";

describe("NewYearToggle", () => {
  it("marks the current rule as checked", () => {
    render(<NewYearToggle rule="khmer" onChange={jest.fn()} />);
    expect(screen.getByRole("radio", { name: /Khmer New Year/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: /Chinese New Year/ })).toHaveAttribute("aria-checked", "false");
  });

  it("marks the choice with an ink outline, keeping gold for the current year", () => {
    const { rerender } = render(<NewYearToggle rule="khmer" onChange={jest.fn()} />);
    const khmer = screen.getByRole("radio", { name: /Khmer New Year/ });
    const chinese = screen.getByRole("radio", { name: /Chinese New Year/ });
    expect(khmer.querySelector(".ring-ink")).toBeInTheDocument();
    expect(chinese.querySelector(".ring-ink")).not.toBeInTheDocument();
    expect(khmer.className).not.toMatch(/gold/);

    rerender(<NewYearToggle rule="chinese" onChange={jest.fn()} />);
    expect(khmer.querySelector(".ring-ink")).not.toBeInTheDocument();
    expect(chinese.querySelector(".ring-ink")).toBeInTheDocument();
  });

  it("reports a pick of the other rule", () => {
    const onChange = jest.fn();
    render(<NewYearToggle rule="khmer" onChange={onChange} />);
    fireEvent.click(screen.getByRole("radio", { name: /Chinese New Year/ }));
    expect(onChange).toHaveBeenCalledWith("chinese");
  });

  it("moves the choice with arrow keys", () => {
    const onChange = jest.fn();
    render(<NewYearToggle rule="khmer" onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole("radio", { name: /Khmer New Year/ }), { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith("chinese");
  });

  it("says when the choice changes the animal", () => {
    render(
      <NewYearToggle rule="khmer" onChange={jest.fn()} animals={{ khmer: "Rat", chinese: "Ox" }} />
    );
    expect(screen.getByText(/Khmer New Year makes you the Rat, Chinese New Year the Ox/)).toBeInTheDocument();
  });

  it("explains the default when the rules agree or the date is incomplete", () => {
    const { rerender } = render(
      <NewYearToggle rule="khmer" onChange={jest.fn()} animals={{ khmer: "Ox", chinese: "Ox" }} />
    );
    expect(screen.getByText(/Cambodia turns the animal year at Khmer New Year/)).toBeInTheDocument();
    rerender(<NewYearToggle rule="khmer" onChange={jest.fn()} />);
    expect(screen.getByText(/Cambodia turns the animal year at Khmer New Year/)).toBeInTheDocument();
  });
});
