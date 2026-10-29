/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { DetailPanel } from "../detail-panel";
import { AREA_READINGS } from "@/lib/numerology/life-area-data";
import { NO_DAY_PLANET_NOTE } from "@/lib/numerology/day-planet-data";

function renderPanel(columnIndex: number, cycleNumber: number) {
  return render(
    <DetailPanel
      headingId="reading"
      cycleNumber={cycleNumber}
      columnIndex={columnIndex}
      birthYear={1997}
      year={1997 + columnIndex}
      isCurrent={false}
      weekday={5}
    />
  );
}

describe("DetailPanel", () => {
  it("shows the reading for the year's life area and tier", () => {
    renderPanel(4, 8); // column 5, Money, strong
    expect(screen.getByText("Money")).toBeTruthy();
    expect(screen.getByText(AREA_READINGS[5].strong)).toBeTruthy();
  });

  it("gives the same number a different reading in another life area", () => {
    renderPanel(7, 8); // column 8, Health, strong
    expect(screen.getByText("Health")).toBeTruthy();
    expect(screen.getByText(AREA_READINGS[8].strong)).toBeTruthy();
    expect(screen.queryByText(AREA_READINGS[5].strong)).toBeNull();
  });

  it("names the day planet over a year the day row reaches", () => {
    renderPanel(0, 3); // Self, born on a Thursday
    expect(screen.getByText(/^Your birth day's planet, Jupiter, stands over this year\./)).toBeTruthy();
  });

  it("says no day planet stands over a year past the day row", () => {
    renderPanel(9, 4); // column 10, Opportunity
    expect(screen.getByText(NO_DAY_PLANET_NOTE)).toBeTruthy();
  });
});
