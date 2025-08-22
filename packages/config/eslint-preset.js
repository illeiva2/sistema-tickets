module.exports = {
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-var": "error"
  },
  env: {
    node: true,
    browser: true,
    es2020: true
  },
  overrides: [
    {
      files: ["**/*.tsx", "**/*.jsx"],
      extends: [
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:react/jsx-runtime"
      ],
      plugins: ["react", "react-hooks", "react-refresh"],
      rules: {
        "react-refresh/only-export-components": [
          "warn",
          { "allowConstantExport": true }
        ],
        "react/prop-types": "off",
        "react/react-in-jsx-scope": "off"
      },
      settings: {
        react: {
          version: "detect"
        }
      }
    }
  ]
};
