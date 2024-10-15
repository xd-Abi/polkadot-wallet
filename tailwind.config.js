/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,tsx,js}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        primary: "#fcec4c",
      },
      fontFamily: {
        "rubik-bubbles": ['"Rubik Bubbles"', "system-ui"],
        roboto: ['"Roboto"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
