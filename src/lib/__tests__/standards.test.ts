/**
 * Project standards that a linter can't see (docs/standards/README.md lists
 * where each rule is enforced):
 * - American spelling across code, comments, copy and docs
 * - Motion tokens agree between CSS (globals.css) and JavaScript (motion.ts)
 * - Nothing animates a property that changes layout
 * - Colors repeated outside CSS (preview images, browser theme, manifest)
 *   agree with the color tokens
 */

import * as fs from "fs";
import * as path from "path";
import { EASE, MOTION } from "@/lib/motion";
import { OG_COLORS, threadedOrb } from "@/lib/og-theme";
import manifest from "@/app/manifest";

const ROOT = path.resolve(__dirname, "../../..");
const read = (relative: string) => fs.readFileSync(path.join(ROOT, relative), "utf-8");
const css = read("src/app/globals.css");

/** The value of a CSS custom property declared in globals.css. */
function cssVar(name: string): string {
  const match = css.match(new RegExp(`--${name}:\\s*([^;]+);`));
  if (!match) throw new Error(`--${name} is not declared in globals.css`);
  return match[1].trim();
}

/** Every file under a folder whose name matches the pattern. */
function filesUnder(relative: string, pattern: RegExp): string[] {
  const dir = path.join(ROOT, relative);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { recursive: true, encoding: "utf-8" })
    .filter((file) => pattern.test(file))
    .map((file) => path.join(relative, file));
}

describe("American spelling", () => {
  // British forms that have a distinct American spelling. Matched as whole
  // words, so "aria-labelledby" and similar API names are not affected.
  const BRITISH =
    /\b(colours?|coloured|centre[sd]?|favourites?|behaviours?|honours?|neighbours?|flavours?|organis(e|ed|es|ing|ation)|recognis(e|ed|es|ing)|realis(e|ed|es|ing)|personalis(e|ed|es|ing|ation)|customis(e|ed|es|ing)|optimis(e|ed|es|ing|ation)|prioritis(e|ed|es|ing)|analys(e|ed|es|ing)|catalogues?|grey|cancelled|cancelling|travelled|travelling|modelling|defence|offence|whilst|amongst)\b/i;

  const files = [
    ...filesUnder("src", /\.(ts|tsx|css)$/),
    ...filesUnder("docs", /\.md$/),
    ...filesUnder(".claude/skills", /\.md$/),
    "README.md",
    "CLAUDE.md",
    "AGENTS.md",
  ].filter((file) => !file.endsWith("standards.test.ts"));

  it.each(files)("%s uses American spelling", (file) => {
    const offending = read(file)
      .split("\n")
      .map((line, index) => ({ line: index + 1, word: line.match(BRITISH)?.[0] }))
      .filter((hit) => hit.word);
    expect(offending).toEqual([]);
  });
});

describe("motion tokens", () => {
  it("durations in motion.ts match the CSS duration variables", () => {
    expect(cssVar("duration-press")).toBe(`${MOTION.press * 1000}ms`);
    expect(cssVar("duration-quick")).toBe(`${MOTION.quick * 1000}ms`);
    expect(cssVar("duration-standard")).toBe(`${MOTION.standard * 1000}ms`);
    expect(cssVar("duration-gentle")).toBe(`${MOTION.gentle * 1000}ms`);
  });

  it("curves in motion.ts match the CSS easing variables", () => {
    const bezier = (points: readonly number[]) => `cubic-bezier(${points.join(", ")})`;
    expect(cssVar("ease-enter")).toBe(bezier(EASE.enter));
    expect(cssVar("ease-standard")).toBe(bezier(EASE.standard));
    expect(cssVar("ease-exit")).toBe(bezier(EASE.exit));
  });
});

describe("compositor-only motion", () => {
  // Properties that lay out the page on every frame they animate
  const LAYOUT = "height|max-height|min-height|width|grid-template-rows|grid-template-columns|letter-spacing|margin[a-z-]*|padding[a-z-]*|top|bottom|left|right";

  it("CSS never transitions or keyframes a layout property", () => {
    const transitions = css.match(/transition(-property)?:[^;]+;/g) ?? [];
    const offending = transitions.filter((rule) => new RegExp(`(^|[\\s:,])(${LAYOUT})(\\s|,|;)`).test(rule.replace(/^transition(-property)?:/, " ")));
    const keyframes = (css.match(/@keyframes[^{]+\{([^{}]*\{[^}]*\})*\s*\}/g) ?? []).filter((block) =>
      new RegExp(`[{;\\s](${LAYOUT})\\s*:`).test(block.replace(/^@keyframes[^{]+\{/, ""))
    );
    expect([...offending, ...keyframes]).toEqual([]);
  });

  it("components never use Tailwind transitions on layout properties", () => {
    const offending = filesUnder("src", /\.tsx$/)
      .filter((file) => !file.includes("__tests__"))
      .filter((file) => new RegExp(`transition-\\[(${LAYOUT})\\]|transition-all`).test(read(file)));
    expect(offending).toEqual([]);
  });

  it("looping glows move only opacity and scale, never a painted shadow", () => {
    const loops = [...css.matchAll(/animation:\s*([\w-]+)[^;]*\binfinite\b/g)].map((m) => m[1]);
    const offending = [...new Set(loops)].filter((name) => {
      const block = css.match(new RegExp(`@keyframes ${name}\\s*\\{([^{}]*\\{[^}]*\\})*\\s*\\}`))?.[0] ?? "";
      return /(box-shadow|text-shadow|filter|background)\s*:/.test(block);
    });
    expect(offending).toEqual([]);
  });

  it("every title glow names its words for the halo (data-glow)", () => {
    const offending = filesUnder("src", /\.tsx$/)
      .filter((file) => !file.includes("__tests__"))
      .flatMap((file) =>
        [...read(file).matchAll(/<[a-z0-9]+\b[^>]*\btitle-glow\b[^>]*>/g)]
          .filter((tag) => !/\bdata-glow=/.test(tag[0]))
          .map(() => file)
      );
    expect(offending).toEqual([]);
  });
});

describe("colors outside CSS", () => {
  const token = (name: string) => cssVar(`color-${name}`).split(/\s/)[0].toUpperCase();

  it("preview-image colors match the color tokens", () => {
    expect(OG_COLORS.page.toUpperCase()).toBe(token("parchment"));
    expect(OG_COLORS.card.toUpperCase()).toBe(token("manuscript"));
    expect(OG_COLORS.ink.toUpperCase()).toBe(token("ink"));
    expect(OG_COLORS.inkLight.toUpperCase()).toBe(token("ink-light"));
    expect(OG_COLORS.gold.toUpperCase()).toBe(token("gold"));
    expect(OG_COLORS.goldDeep.toUpperCase()).toBe(token("gold-deep"));
    expect(OG_COLORS.goldLight.toUpperCase()).toBe(token("gold-light"));
    expect(OG_COLORS.inkFaint.toUpperCase()).toBe(token("ink-faint"));
    expect(OG_COLORS.border.toUpperCase()).toBe(token("border"));
    expect(OG_COLORS.zero.toUpperCase()).toBe(token("tier-zero"));
    expect(css).toMatch(new RegExp(`\\.wheel-orb \\{[^}]*${OG_COLORS.orb}`, "i"));
  });

  it.each(["very-strong", "strong", "moderate", "weak"] as const)(
    "the %s preview orb's thread takes its tier token",
    (tier) => {
      expect(threadedOrb(tier).thread.slice(0, 7).toUpperCase()).toBe(token(`tier-${tier}`));
    }
  );

  it("a zero year's preview orb is an unlit niche with a faint thread", () => {
    expect(threadedOrb("zero")).toMatchObject({ background: OG_COLORS.zero, border: OG_COLORS.border });
    expect(threadedOrb("zero").thread.slice(0, 7)).toBe(OG_COLORS.inkFaint);
  });

  it("a lit preview orb's thread is gold, as the woven flame's", () => {
    expect(threadedOrb("strong", true).thread).toBe(OG_COLORS.goldLight);
    expect(threadedOrb("zero", true).thread).toBe(OG_COLORS.goldLight);
  });

  it("a preview orb is opaque and backlit by its tier's light", () => {
    expect(threadedOrb("weak").background).toBe(OG_COLORS.orb);
    expect(threadedOrb("weak").boxShadow).toContain(token("tier-weak"));
  });

  it("the browser theme and web manifest use the page color", () => {
    const page = token("parchment");
    expect(read("src/app/layout.tsx")).toMatch(new RegExp(`themeColor:\\s*"${page}"`, "i"));
    expect(manifest().theme_color?.toUpperCase()).toBe(page);
    expect(manifest().background_color?.toUpperCase()).toBe(page);
  });
});
