/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "../../packages/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#F4F8F8",
        surface: "#FFFFFF",
        border: "#DCE6E5",
        foreground: "#16211F",
        muted: "#5B6B69",
        primary: {
          DEFAULT: "#0F5C5C",
          soft: "#E3EFEF",
        },
        amber: {
          DEFAULT: "#E8A33D",
          soft: "#FBF0DD",
        },
        success: {
          DEFAULT: "#2F8F5B",
          soft: "#E3F1E9",
        },
        danger: {
          DEFAULT: "#E2665A",
          soft: "#FBE7E5",
        },
      },
    },
  },
  plugins: [],
};