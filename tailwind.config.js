/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ice: {
          snow: "#f8f9fa",
          glacier: "#e4e6e7",
          frost: "#8d99ae",
          glacierBlue: "#6c8ebf",
          deepBlue: "#2c5aa0",
          coldGray: "#4a4a5a",
        }
      },
      fontFamily: {
        display: ["'Inter'", "sans-serif"],
      }
    }
  },
  plugins: []
}
