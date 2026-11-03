// Flat config (ESLint v9+).
// eslint-config-airbnb only supports ESLint 7/8, so the airbnb rules come from
// eslint-config-airbnb-extended's legacy configs, which keep airbnb's rule set
// (eslint-plugin-import, react, jsx-a11y) in flat-config form.

import js from "@eslint/js";
import { configs as airbnb } from "eslint-config-airbnb-extended/legacy";
import react from "eslint-plugin-react";
import globals from "globals";

export default [
  js.configs.recommended,
  react.configs.flat.recommended,
  ...airbnb.react.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      // airbnb pins parserOptions.ecmaVersion to 2018, which rejects optional chaining
      parserOptions: { ecmaVersion: "latest", ecmaFeatures: { jsx: true } },
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
