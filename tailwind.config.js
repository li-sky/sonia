/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./src/*.{js,jsx,ts,tsx}"],
  presets: [require('tailwindcss/defaultConfig')], // 添加默认预设
  theme: {},
  plugins: [],
};