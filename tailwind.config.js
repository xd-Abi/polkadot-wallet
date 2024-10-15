/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,tsx,js}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        primary: "#fcec4c",
      },
      fontFamily: {
        "bebas-neue": ['"Bebas Neue"', "sans-serif"],
        roboto: ['"Roboto"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
