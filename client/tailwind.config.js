/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        osrs: {
          bg: "#151b26",
          panel: "#222a38",
          border: "#3a4558",
          accent: "#f5d376",
          accentDark: "#cfa246",
          text: "#fdfaf3",
          muted: "#d7deee",
          red: "#f59a92",
          green: "#93e2b6",
          shadow: "#0b1020",
        },
      },
      fontFamily: {
        osrs: ["\"RuneScapeBold\"", "serif"],
        osrsBody: ["\"RuneScapeSmall\"", "serif"],
      },
      fontSize: {
        xs: "0.85rem",
        sm: "0.95rem",
        base: "1.05rem",
        lg: "1.2rem",
        xl: "1.35rem",
      },
      boxShadow: {
        osrs: "0 6px 18px rgba(0, 0, 0, 0.45)",
      },
    },
  },
  plugins: [],
};
