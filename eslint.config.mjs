import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Project rules that enforce docs/standards. Each message points at the
 * standard so whoever hits it knows where the rule comes from.
 */
const STANDARDS_SYNTAX = [
  {
    // "#E2B65A" or a Tailwind arbitrary color like "text-[#E2B65A]"
    selector: "Literal[value=/#[0-9a-fA-F]{3,8}\\b/], TemplateElement[value.raw=/#[0-9a-fA-F]{3,8}\\b/]",
    message: "Use a color token (text-ink, bg-manuscript, ...) instead of a raw hex value. See docs/standards/design-language.md#color.",
  },
  {
    selector: "Literal[value=/active:scale-(?!\\[0\\.97\\])/], TemplateElement[value.raw=/active:scale-(?!\\[0\\.97\\])/]",
    message: "Pressed controls scale to 0.97: use \"pressable active:scale-[0.97]\" or PRESS from @/lib/motion. See docs/standards/design-language.md#interaction.",
  },
  {
    selector: "Literal[value=/\\banimate-(pulse|spin|bounce|ping)\\b/], TemplateElement[value.raw=/\\banimate-(pulse|spin|bounce|ping)\\b/]",
    message: "Tailwind's loops are too fast and too large for Solini. Glows breathe with .title-glow or .breathe-glow; see Living surfaces in docs/standards/design-language.md#motion.",
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-console": ["error", { allow: ["error", "warn"] }],
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "framer-motion",
              message: "Import from \"motion/react\" (the Motion library). See docs/standards/code.md#styling.",
            },
          ],
        },
      ],
      "no-restricted-syntax": ["error", ...STANDARDS_SYNTAX],
    },
  },
  {
    // Places that cannot read CSS variables repeat token values, kept in step
    // with globals.css by src/lib/__tests__/standards.test.ts.
    files: [
      "src/lib/og-theme.ts",
      "src/app/layout.tsx",
      "src/app/manifest.ts",
      "src/**/__tests__/**",
    ],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
