module.exports = {
  root: true,
  env: {
    node: true,
    es2024: true,
  },
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  parserOptions: {
    sourceType: "module",
    parser: "babel-eslint",
    ecmaVersion: 2024,
  },
  plugins: ["prettier"],
  rules: {
    indent: [
      "error",
      2,
      {
        FunctionDeclaration: { parameters: "first" },
        VariableDeclarator: { var: 2, let: 2, const: 3 },
        ignoredNodes: [],
        SwitchCase: 1,
      },
    ],
    "func-call-spacing": ["error", "never"],
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "double"],
    semi: ["error", "never"],
    "no-unused-vars": ["error", { argsIgnorePattern: "next" }],
    "no-console": ["error", { allow: ["warn", "error"] }],
    "prettier/prettier": "error",
    "max-len": [2, { code: 90, tabWidth: 2, ignoreUrls: true }],
  },
}
