/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
  singleQuote: true,
  trailingComma: 'none',
  printWidth: 100,
  arrowParens: 'always',
  objectWrap: 'preserve',
  tailwindPreserveWhitespace: true,
  plugins: ['prettier-plugin-tailwindcss']
};

export default config;
