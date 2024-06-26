module.exports =
{
  "env": {
    "node": true,
    "browser": true,
    "es6": true
  },
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "plugins": ["react", "@typescript-eslint", "prettier"],
  "extends": [
    "plugin:react/recommended",
    "airbnb",
    "plugin:prettier/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        "js": "never",
        "jsx": "never",
        "ts": "never",
        "tsx": "never"
      }
    ],
    "prettier/prettier": [
        "error",
        {
            endOfLine: "auto"
        }
    ],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "react/jsx-filename-extension": [
      1,
      { "extensions": [".js", ".jsx", ".ts", ".tsx"] }
    ],
    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": ["off"],
    "import/prefer-default-export": "off",
    "react/prop-types": "off",
    "lines-between-class-members": "off",
    "no-nested-ternary": "off",
    'import/no-unresolved': [2, { ignore: ['.png$', '.webp$', '.jpg$'] }],
    "react/destructuring-assignment": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "react/jsx-props-no-spreading": "off",
    "prefer-destructuring": "off",
    "no-useless-constructor": "off",
    "react/button-has-type": "off",
    "dot-notation": "off",
    "class-methods-use-this": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "jsx-a11y/anchor-is-valid": "off",
    "jsx-a11y/no-static-element-interactions": "off",
    "jsx-a11y/click-events-have-key-events": "off",
    "no-shadow": "off",
    "@typescript-eslint/no-shadow": ["error"]
  },
  "settings": {
    "import/resolver": {
      "node": {
        "extensions": [".js", ".jsx", ".ts", ".tsx"],
        "paths": ["src"]
      }
    }
  }
};