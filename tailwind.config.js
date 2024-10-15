/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,tsx,js}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        primary: "#fff",
        gray1: "#8e8e93",
        gray2: "#636366",
        gray3: "#48484a",
        gray4: "#3a3a3c",
        gray5: "#2c2c2e",
        gray6: "#1c1c1e",
      },
      fontFamily: {
        "bebas-neue": ['"Bebas Neue"', "sans-serif"],
        roboto: ['"Roboto"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
