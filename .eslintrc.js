module.exports = {
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  env: {
    browser: true,
    es2021: true,
  },
  plugins: [
    'eslint-plugin-import',
  ],
  extends: 'airbnb-base',
  overrides: [
    {
      files: [
        'ui/public/**/*.js',
      ],
    },
  ],
  ignorePatterns: [
    'ui/public/libs/*.js',
    'ui/public/sw.js',
  ],
  rules: {
    "import/extensions": [0, { "js": "always" }],
    "import/prefer-default-export": "off",
    "no-bitwise": "off",
    "no-console": "off",
    "no-throw-literal": "off",
  },
};
