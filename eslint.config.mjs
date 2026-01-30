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
      "unicorn/prevent-abbreviations": [
        "error",
        {
          allowList: {
            props: true,
            prev: true,
            utils: true,
            searchParams: true,
          },
        },
      ],
    },
    ignores: ["dist/*"],
  },
]

export default eslintConfig
