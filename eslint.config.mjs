// https://docs.expo.dev/guides/using-eslint/
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { FlatCompat } from "@eslint/eslintrc"
import eslintPluginUnicorn from "eslint-plugin-unicorn"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends("expo"),
  eslintPluginUnicorn.configs["recommended"],
  {
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
    ignores: ["dist/*"],
  },
]

export default eslintConfig
