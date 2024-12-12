/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/*.{html,js,css}",
    "./src/views/**/*.ejs",
    "./node_modules/flowbite/**/*.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        niconne: ["Niconne", "serif"],
        sans: ["Be VietNam", "sans-serif"],
        serif: ["EB Garamond", "serif"],
        dancing: ["Dancing Script", "serif"],
        MuseoModerno: ["MuseoModerno", "serif"],
      },
      transitionTimingFunction: {
        "header-ease": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
