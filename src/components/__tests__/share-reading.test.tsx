/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ShareReading } from "../share-reading";

const props = { year: 1997, month: 7, day: 24 };
const SHARE_URL = "http://localhost/r/1997-07-24";

function setNavigator(values: { share?: unknown; clipboard?: unknown }) {
  Object.defineProperty(navigator, "share", { value: values.share, configurable: true });
  Object.defineProperty(navigator, "clipboard", { value: values.clipboard, configurable: true });
}

describe("ShareReading", () => {
  it("uses the native share sheet when the browser has one", async () => {
    const share = jest.fn().mockResolvedValue(undefined);
    const writeText = jest.fn();
    setNavigator({ share, clipboard: { writeText } });

    render(<ShareReading {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Share" }));

    await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
    expect(share.mock.calls[0][0].url).toBe(SHARE_URL);
    expect(writeText).not.toHaveBeenCalled();
  });

  it("copies the link when there is no share sheet", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    setNavigator({ share: undefined, clipboard: { writeText } });

    render(<ShareReading {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Share" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(SHARE_URL));
    expect(await screen.findByText(/Link copied/)).toBeInTheDocument();
  });

  it("does nothing more when the share sheet is dismissed", async () => {
    const share = jest.fn().mockRejectedValue(new DOMException("closed", "AbortError"));
    const writeText = jest.fn();
    setNavigator({ share, clipboard: { writeText } });

    render(<ShareReading {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Share" }));

    await waitFor(() => expect(share).toHaveBeenCalled());
    expect(writeText).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("says how to copy by hand when copying fails", async () => {
    const writeText = jest.fn().mockRejectedValue(new Error("denied"));
    setNavigator({ share: undefined, clipboard: { writeText } });

    render(<ShareReading {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Share" }));

    expect(await screen.findByText(/address bar/)).toBeInTheDocument();
  });

  it("links the download to this reading's preview image", () => {
    setNavigator({});
    render(<ShareReading {...props} />);
    const link = screen.getByRole("link", { name: "Download image" });
    expect(link).toHaveAttribute("href", "/r/1997-07-24/opengraph-image");
    expect(link).toHaveAttribute("download", "solini-reading-1997-07-24.png");
  });
});
