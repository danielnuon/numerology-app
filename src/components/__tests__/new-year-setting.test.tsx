/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { NewYearSetting } from "../new-year-setting";

describe("NewYearSetting", () => {
  it("marks the current rule as checked", () => {
    render(<NewYearSetting rule="khmer" year={1997} month={7} day={24} onChange={jest.fn()} />);
    expect(screen.getByRole("radio", { name: /Khmer New Year/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: /Chinese New Year/ })).toHaveAttribute("aria-checked", "false");
  });

  it("reports a pick of the other rule", () => {
    const onChange = jest.fn();
    render(<NewYearSetting rule="khmer" year={1997} month={7} day={24} onChange={onChange} />);
    fireEvent.click(screen.getByRole("radio", { name: /Chinese New Year/ }));
    expect(onChange).toHaveBeenCalledWith("chinese");
  });

  it("moves the choice with arrow keys", () => {
    const onChange = jest.fn();
    render(<NewYearSetting rule="khmer" year={1997} month={7} day={24} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole("radio", { name: /Khmer New Year/ }), { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith("chinese");
  });

  it("says when the choice changes the animal", () => {
    render(<NewYearSetting rule="khmer" year={1997} month={2} day={10} onChange={jest.fn()} />);
    expect(screen.getByText(/Khmer New Year gives the Rat, Chinese New Year the Ox/)).toBeInTheDocument();
  });

  it("says when both rules agree", () => {
    render(<NewYearSetting rule="khmer" year={1997} month={7} day={24} onChange={jest.fn()} />);
    expect(screen.getByText(/Both give the Ox/)).toBeInTheDocument();
  });
});
