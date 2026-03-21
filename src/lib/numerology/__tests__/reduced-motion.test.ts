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

  it("globals.css disables the breathe animation under reduced motion", () => {
    // The media query block should target .animate-breathe and set animation: none
    const reducedMotionBlock = cssContent.match(
      /@media\s*\(\s*prefers-reduced-motion[^)]*\)[^{]*\{([\s\S]*?)\}/
    );
    expect(reducedMotionBlock).not.toBeNull();
    const blockContent = reducedMotionBlock![1];
    expect(blockContent).toMatch(/\.animate-breathe/);
    expect(blockContent).toMatch(/animation\s*:\s*none/);
  });
});
