module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module"
    },
    "plugins": [
      "mocha"
    ],
    "extends": [
      "plugin:mocha/recommended"
    ],
    "rules": {
        "mocha/max-top-level-suites": [
          "warn", {
            limit: 5
          }
        ],
        "indent": [
            "error",
            2,
            {
              "FunctionDeclaration": {
                "parameters": "first"
              },
              "VariableDeclarator": {
                "var": 2, "let": 2, "const": 3
              },
              "ignoredNodes": [
              ],
              "SwitchCase": 1,
            },
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "never"
        ],
        "no-unused-vars": [
          "error",
          {"argsIgnorePattern": "next"}
        ],
        "no-console": [
          "error",
          {"allow": ["warn", "error"]}
        ]
    }
};
