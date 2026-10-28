/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { DetailPanel } from "../detail-panel";
import { AREA_READINGS } from "@/lib/numerology/life-area-data";

function renderPanel(columnIndex: number, cycleNumber: number) {
  return render(
    <DetailPanel
      headingId="reading"
      cycleNumber={cycleNumber}
      columnIndex={columnIndex}
      birthYear={1997}
      year={1997 + columnIndex}
      isCurrent={false}
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
});
