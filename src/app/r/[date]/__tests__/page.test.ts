import { generateMetadata } from "../page";
import { SHARED_COMPARISON_TITLE, SHARED_READING_TITLE, SITE_TITLE } from "@/lib/site-copy";

/** Metadata for a share link, built on the server with no client JavaScript. */
function metadataFor(date: string) {
  return generateMetadata({ params: Promise.resolve({ date }) });
}

describe("share route metadata", () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date(2026, 9, 28) });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("describes a shared reading by this year's reading, for link previews", async () => {
    const metadata = await metadataFor("1997-07-24");
    expect(metadata.title).toBe(SHARED_READING_TITLE);
    expect(metadata.description).toMatch(/^2026: Very strong luck · Allies\. /);
    expect(metadata.openGraph).toMatchObject({ title: SHARED_READING_TITLE, description: metadata.description });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image", description: metadata.description });
  });

  it("follows the link's New Year rule", async () => {
    // Born between Chinese New Year and Khmer New Year 1994, so the animal and this year's reading differ by rule
    const khmer = await metadataFor("1994-03-01");
    const chinese = await metadataFor("1994-03-01-cny");
    expect(khmer.description).toMatch(/^2026: Moderate \/ neutral · Status\. /);
    expect(chinese.description).toMatch(/^2026: Strong luck · Status\. /);
  });

  it("describes a comparison by its stability assessment", async () => {
    const metadata = await metadataFor("1997-07-24+2000-03-15");
    expect(metadata.title).toBe(SHARED_COMPARISON_TITLE);
    expect(metadata.description).toMatch(/^(Strong|Moderate|Mixed|Low) stability/);
  });

  it("falls back to the site's own title for an invalid date", async () => {
    const metadata = await metadataFor("not-a-date");
    expect(metadata.title).toBe(SITE_TITLE);
    expect(metadata.openGraph).toBeUndefined();
  });
});
