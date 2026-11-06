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

  it("with reduced motion, view transitions only fade the new view in, without travel", () => {
    const block = cssContent.match(/\* lands \(restrained transitions[\s\S]*?\n\}/)?.[0] ?? "";
    // Groups don't glide or grow, and the old view is gone at once
    expect(block).toMatch(/::view-transition-group\(\*\),\s*::view-transition-image-pair\(\*\)\s*\{\s*animation:\s*none\s*!important/);
    expect(block).toMatch(/::view-transition-old\(\*\)\s*\{\s*animation:\s*vt-fade-out 0s both !important/);
    expect(block).toMatch(/::view-transition-new\(\*\)\s*\{\s*animation:\s*vt-appear /);
    // The fade it uses changes opacity and nothing else
    const appear = cssContent.match(/@keyframes vt-appear\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(appear.trim()).toBe("from { opacity: 0;");
  });

  it("loops only on living surfaces, and only when motion is allowed", () => {
    // Glows breathe and the wheel's lanterns live (see "Living surfaces" in
    // docs/standards/design-language.md). Every looping rule must sit in a
    // no-preference block and style one of the registered living surfaces.
    const LIVING = /\.(wheel-|sky-glow|title-glow|breathe-glow|lamp-orb|mark-glow|mark-sway|mark-drift)/;
    const lines = cssContent.split("\n");
    lines.forEach((line, index) => {
      if (!/\binfinite\b/.test(line)) return;
      const before = lines.slice(0, index);
      const media = before.filter((l) => l.trim().startsWith("@media")).pop() ?? "";
      expect(media).toMatch(/prefers-reduced-motion:\s*no-preference/);
      const selector = before.filter((l) => l.trim().endsWith("{")).pop() ?? "";
      expect(selector).toMatch(LIVING);
    });
  });

  it("living loops are slow and symmetric", () => {
    // A breath, not a blink: every loop eases with --ease-sine, and the glow
    // breath takes at least four seconds each way.
    const loops = cssContent.split("\n").filter((line) => /\binfinite\b/.test(line));
    expect(loops.length).toBeGreaterThan(0);
    for (const line of loops) {
      expect(line).toMatch(/var\(--ease-sine\)|linear|cubic-bezier\(0\.37, 0, 0\.63, 1\)/);
    }
    const breath = cssContent.match(/--breathe-duration:\s*([\d.]+)s/);
    expect(Number(breath?.[1])).toBeGreaterThanOrEqual(4);
    const low = cssContent.match(/--breathe-low:\s*([\d.]+)/);
    expect(Number(low?.[1])).toBeGreaterThanOrEqual(0.5);
  });

  it("scroll-driven animations only run when motion is allowed", () => {
    expect(cssContent).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*no-preference\)\s*\{\s*\.scroll-settle/
    );
    expect(cssContent).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*no-preference\)\s*\{\s*\.sky-glow/
    );
    expect(cssContent).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*no-preference\)\s*\{\s*\.glass\s*\{\s*view-timeline/
    );
  });

  it("the glass light is hidden under Reduce Motion and Reduce Transparency", () => {
    for (const query of ["prefers-reduced-motion", "prefers-reduced-transparency"]) {
      expect(cssContent).toMatch(
        new RegExp(
          `@media\\s*\\(${query}:\\s*reduce\\)\\s*\\{[^@]*?\\.glass::before,\\s*\\.glass::after\\s*\\{\\s*display:\\s*none`
        )
      );
    }
  });
});
