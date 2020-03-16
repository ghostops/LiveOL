module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "extends": [
        "airbnb-base"
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "ignorePatterns": ["test/**/*", "client/**/*"],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
        "indent": ["error", 4],
        "max-len": ["error", 100, 2, {
            ignoreUrls: true,
            ignoreComments: false,
            ignoreRegExpLiterals: true,
            ignoreStrings: false,
            ignoreTemplateLiterals: false,
        }],
        "import/prefer-default-export": "off",
        "implicit-arrow-linebreak": "off",
        "import/no-unresolved": "off",
        "import/extensions": "off",
        // https://github.com/typescript-eslint/typescript-eslint/issues/363
        "no-unused-vars": "off",
        "dot-notation": "off",
        "import/no-extraneous-dependencies": ["error", {"devDependencies": ["**/*.test.js", "swagger/**/*"]}],
        "camelcase": 0,
        "import/no-extraneous-dependencies": "off",
    }
};
