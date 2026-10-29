/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ReadingViewTabs, READING_VIEW_PANEL_IDS } from "../reading-view-tabs";

describe("ReadingViewTabs", () => {
  it("marks the current view as selected, with an ink outline", () => {
    render(<ReadingViewTabs view="year" onChange={jest.fn()} />);
    const year = screen.getByRole("tab", { name: "This year" });
    expect(year).toHaveAttribute("aria-selected", "true");
    expect(year.querySelector(".ring-ink")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "All 12 years" })).toHaveAttribute("aria-selected", "false");
  });

  it("points each tab at its view", () => {
    render(<ReadingViewTabs view="year" onChange={jest.fn()} />);
    expect(screen.getByRole("tab", { name: "All 12 years" })).toHaveAttribute(
      "aria-controls",
      READING_VIEW_PANEL_IDS.cycle
    );
  });

  it("reports a tap on the other view", () => {
    const onChange = jest.fn();
    render(<ReadingViewTabs view="year" onChange={onChange} />);
    fireEvent.click(screen.getByRole("tab", { name: "All 12 years" }));
    expect(onChange).toHaveBeenCalledWith("cycle");
  });

  it("moves the choice with arrow keys", () => {
    const onChange = jest.fn();
    render(<ReadingViewTabs view="year" onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole("tab", { name: "This year" }), { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith("cycle");
    expect(screen.getByRole("tab", { name: "All 12 years" })).toHaveFocus();
  });
});
