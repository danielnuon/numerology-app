/** @jest-environment jsdom */
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { activeYearOn } from "@/lib/numerology/year-lookup";
import { useToday, utcDay } from "@/lib/use-today";

/** A reading's year line for someone born on November 16, as ThisYearCard writes it. */
function YearLine({ renderedAt }: { renderedAt: number }) {
  const today = useToday(renderedAt);
  return <p>{activeYearOn(today, { year: 1990, month: 11, day: 16 })} reading</p>;
}

describe("useToday", () => {
  afterEach(() => jest.useRealTimers());

  it("reads a moment's UTC day whatever the local time zone", () => {
    const day = utcDay(new Date(Date.UTC(2026, 10, 15, 23, 59)));
    expect([day.getFullYear(), day.getMonth() + 1, day.getDate()]).toEqual([2026, 11, 15]);
  });

  it("hydrates on the server's date, then moves to the visitor's own without an error", async () => {
    // The server renders on November 15; the birthday is the next day
    const renderedAt = Date.UTC(2026, 10, 15, 13, 30);
    jest.useFakeTimers({ now: renderedAt });
    const html = renderToString(<YearLine renderedAt={renderedAt} />);
    expect(html).toContain("2025");

    // The visitor's clock already reads November 16
    jest.setSystemTime(new Date(2026, 10, 16, 3, 30));
    const container = document.createElement("div");
    container.innerHTML = html;
    const onRecoverableError = jest.fn();
    await act(async () => {
      hydrateRoot(container, <YearLine renderedAt={renderedAt} />, { onRecoverableError });
    });

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container.textContent).toBe("2026 reading");
  });
});
