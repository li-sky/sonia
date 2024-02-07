/** @type {import('tailwindcss').Config} */

const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: ["./src/**/*.{html,js,jsx,tsx,ts}"],
  theme: {
    extend: {},
  },
  plugins: [],
});

