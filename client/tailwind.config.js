/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: "#008080",
        },
      },
    },
  },
  plugins: [],
};
