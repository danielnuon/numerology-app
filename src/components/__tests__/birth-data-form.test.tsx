/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BirthDataForm, isFieldComplete } from "../birth-data-form";

function renderForm() {
  render(<BirthDataForm onResult={jest.fn()} newYearRule="khmer" onNewYearRuleChange={jest.fn()} />);
  return {
    day: screen.getByLabelText("Day") as HTMLInputElement,
    month: screen.getByLabelText("Month") as HTMLInputElement,
    year: screen.getByLabelText("Year") as HTMLInputElement,
  };
}

describe("isFieldComplete", () => {
  it("completes at full length, or at one digit that can't take a second", () => {
    expect(isFieldComplete("24", 2, 3)).toBe(true);
    expect(isFieldComplete("2", 2, 3)).toBe(false);
    expect(isFieldComplete("5", 2, 3)).toBe(true);
    expect(isFieldComplete("1", 2, 1)).toBe(false);
    expect(isFieldComplete("7", 2, 1)).toBe(true);
    expect(isFieldComplete("199", 4)).toBe(false);
  });
});

describe("BirthDataForm date fields", () => {
  it("moves focus to the next field once a field is filled", () => {
    const { day, month, year } = renderForm();
    day.focus();
    fireEvent.change(day, { target: { value: "24" } });
    expect(month).toHaveFocus();
    fireEvent.change(month, { target: { value: "7" } });
    expect(year).toHaveFocus();
  });

  it("does not move on while a field could take another digit", () => {
    const { day } = renderForm();
    day.focus();
    fireEvent.change(day, { target: { value: "2" } });
    expect(day).toHaveFocus();
  });

  it("starts a full field over when another digit is typed", () => {
    const { year } = renderForm();
    fireEvent.change(year, { target: { value: "1997" } });
    fireEvent.change(year, { target: { value: "19975" } });
    expect(year).toHaveValue("5");
  });

  it("keeps the first digits that fit when pasting", () => {
    const { day } = renderForm();
    fireEvent.change(day, { target: { value: "2407" } });
    expect(day).toHaveValue("24");
  });

  it("goes back a field on Backspace in an empty field", () => {
    const { day, month } = renderForm();
    month.focus();
    fireEvent.keyDown(month, { key: "Backspace" });
    expect(day).toHaveFocus();
  });

  it("does not move on when deleting", () => {
    const { day, month } = renderForm();
    fireEvent.change(day, { target: { value: "24" } });
    day.focus();
    fireEvent.change(day, { target: { value: "2" } });
    expect(day).toHaveFocus();
    expect(month).not.toHaveFocus();
  });
});

describe("BirthDataForm deleting", () => {
  it("does not move on when deleting leaves a one-digit complete value", () => {
    const { month, year } = renderForm();
    fireEvent.change(month, { target: { value: "07" } });
    month.focus();
    // Deleting the 0 leaves "7", which would count as complete if typed
    fireEvent.change(month, { target: { value: "7" } });
    expect(month).toHaveFocus();
    expect(year).not.toHaveFocus();
  });
});
