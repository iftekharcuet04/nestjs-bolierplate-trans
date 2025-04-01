module.exports = {
  env: {
    es2022: true,
    browser: true,
    node: true,
    experimentalDecorators: true
  },
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  parserOptions: {
    ecmaVersion: 13,
    sourceType: "module"
  },
  rules: {
    "prettier/prettier": [
      "error",
      {
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
        semi: true,
        singleQuote: false,
        trailingComma: "none",
        bracketSpacing: true,
        arrowParens: "always",
        endOfLine: "lf"
      }
    ],
    quotes: ["error", "double"] // Ensure ESLint enforces double quotes
  }
};

