import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const colourLiteralPattern =
  "/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\\b|rgb\\(|hsl\\(|oklch\\(|(bg|text|border|fill|stroke|ring)-(red|blue|green|gray|slate|zinc|neutral|stone|amber|yellow|orange|purple|violet|indigo|pink|rose|teal|cyan|sky|emerald|lime)-[0-9]{2,3}/";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["components/**/*.{js,jsx,ts,tsx}", "app/**/*.{js,jsx,ts,tsx}"],
    ignores: ["components/ui/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: `JSXAttribute Literal[value=${colourLiteralPattern}]`,
          message:
            "Colour literals are forbidden outside Tier 1 tokens. Use a CSS variable from globals.css instead of hex/rgb/hsl/oklch or a Tailwind palette class.",
        },
        {
          selector: `JSXExpressionContainer Literal[value=${colourLiteralPattern}]`,
          message:
            "Colour literals are forbidden outside Tier 1 tokens. Use a CSS variable from globals.css instead of hex/rgb/hsl/oklch or a Tailwind palette class.",
        },
      ],
    },
  },
]);

export default eslintConfig;
