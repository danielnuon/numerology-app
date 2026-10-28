import { redactEvent, redactUrl } from "../analytics";

describe("redactUrl", () => {
  it("removes the birth date pre-fill query", () => {
    expect(
      redactUrl("https://solini.vercel.app/?day=24&month=7&year=1997&ny=khmer")
    ).toBe("https://solini.vercel.app/");
  });

  it("replaces the share route date with a placeholder", () => {
    expect(redactUrl("https://solini.vercel.app/r/1997-07-24-cny")).toBe(
      "https://solini.vercel.app/r/[date]"
    );
  });

  it("keeps sub-paths of the share route, such as the OG image", () => {
    expect(
      redactUrl("https://solini.vercel.app/r/1997-07-24-cny/opengraph-image?x=1")
    ).toBe("https://solini.vercel.app/r/[date]/opengraph-image");
  });

  it("removes the hash", () => {
    expect(redactUrl("https://solini.vercel.app/about#tradition")).toBe(
      "https://solini.vercel.app/about"
    );
  });

  it("leaves plain pages unchanged", () => {
    expect(redactUrl("https://solini.vercel.app/about")).toBe(
      "https://solini.vercel.app/about"
    );
  });

  it("returns null for an unparseable URL", () => {
    expect(redactUrl("not a url")).toBeNull();
  });
});

describe("redactEvent", () => {
  it("redacts the url and keeps the other fields", () => {
    expect(
      redactEvent({
        type: "vital",
        url: "https://solini.vercel.app/r/1997-07-24-cny",
        route: "/r/[date]",
      })
    ).toEqual({
      type: "vital",
      url: "https://solini.vercel.app/r/[date]",
      route: "/r/[date]",
    });
  });

  it("drops the event when the url cannot be parsed", () => {
    expect(redactEvent({ type: "pageview", url: "::" })).toBeNull();
  });
});
