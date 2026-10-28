import * as fs from "fs";
import * as path from "path";

/**
 * Verifies that the CSS files contain the required prefers-reduced-motion
 * media query overrides for accessibility compliance.
 */

const GLOBALS_CSS_PATH = path.resolve(
  __dirname,
  "../../../app/globals.css"
);

describe("prefers-reduced-motion CSS rules", () => {
  let cssContent: string;

  beforeAll(() => {
    cssContent = fs.readFileSync(GLOBALS_CSS_PATH, "utf-8");
  });

  it("globals.css contains a prefers-reduced-motion media query", () => {
    expect(cssContent).toMatch(/prefers-reduced-motion/);
  });

  it("globals.css collapses animations and transitions under reduced motion", () => {
    const blocks = [
      ...cssContent.matchAll(
        /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*\{([\s\S]*?)\n\}/g
      ),
    ].map((m) => m[1]);
    expect(blocks.length).toBeGreaterThan(0);
    const blockContent = blocks.join("\n");
    expect(blockContent).toMatch(/animation-duration\s*:\s*0\.01ms/);
    expect(blockContent).toMatch(/transition-duration\s*:\s*0\.01ms/);
    expect(blockContent).toMatch(/scroll-behavior\s*:\s*auto/);
    expect(blockContent).toMatch(/::view-transition-group\(\*\)/);
  });

  it("loops only on the cycle wheel, and only when motion is allowed", () => {
    // The wheel's ambient light is the one sanctioned exception to the
    // no-loops rule; every looping rule must sit in a no-preference block
    // and style a .wheel- element.
    const lines = cssContent.split("\n");
    lines.forEach((line, index) => {
      if (!/\binfinite\b/.test(line)) return;
      const before = lines.slice(0, index);
      const media = before.filter((l) => l.trim().startsWith("@media")).pop() ?? "";
      expect(media).toMatch(/prefers-reduced-motion:\s*no-preference/);
      const selector = before.filter((l) => l.trim().endsWith("{")).pop() ?? "";
      expect(selector).toMatch(/\.wheel-/);
    });
  });

  it("scroll-driven animations only run when motion is allowed", () => {
    expect(cssContent).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*no-preference\)\s*\{\s*\.scroll-settle/
    );
    expect(cssContent).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*no-preference\)\s*\{\s*\.sky-glow/
    );
  });
});
