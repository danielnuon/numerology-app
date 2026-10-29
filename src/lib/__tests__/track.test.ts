import { track } from "@vercel/analytics";
import { trackEvent } from "../track";

jest.mock("@vercel/analytics", () => ({ track: jest.fn() }));

describe("trackEvent", () => {
  it("sends the event with only the shared-link flag", () => {
    trackEvent("Reading revealed", true);
    expect(track).toHaveBeenCalledWith("Reading revealed", { fromSharedLink: true });
  });
});
