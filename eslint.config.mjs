// https://docs.expo.dev/guides/using-eslint/
import { FlatCompat } from "@eslint/eslintrc"
import tseslint from "@typescript-eslint/eslint-plugin"
import eslintPluginUnicorn from "eslint-plugin-unicorn"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends("expo"),
  eslintPluginUnicorn.configs["recommended"],
  {
    ignores: [
      "babel.config.js",
      "metro.config.js",
      "tailwind.config.js",
      "*.d.ts",
      "dist/*",
      "coverage/*",
    ],
  },
  {
    files: ["eslint.config.mjs"],
    rules: {
      "import/namespace": "off",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "unicorn/prefer-module": "off",
      "unicorn/consistent-function-scoping": "off",
      "unicorn/prevent-abbreviations": [
        "error",
        {
          replacements: {
            props: false,
            Props: false,
          },
          allowList: {
            props: true,
            Props: true,
            prev: true,
            utils: true,
            searchParams: true,
          },
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*", "./*"],
              message: "Use path aliases (e.g. '@/lib/api/...') instead of relative imports",
            },
          ],
        },
      ],
    },
  },
]

export default eslintConfig
