// Flat config (ESLint v9+). Migrated from .eslintrc.json.
// Uses @eslint/eslintrc's FlatCompat to import airbnb's legacy-format config
// since airbnb has not yet shipped a native flat config.

import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  js.configs.recommended,
  ...compat.extends("plugin:react/recommended", "airbnb"),
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    rules: {
      "react/prop-types": "off",
      "no-shadow": "off", // disabled due to use of bindActionCreators
      "react/jsx-filename-extension": [1, { extensions: [".js", ".jsx"] }],
      "import/no-unresolved": "off", // most cross-module refs unresolved by design
      "max-len": ["error", { code: 120 }],
    },
  },
];
