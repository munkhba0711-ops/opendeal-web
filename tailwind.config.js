/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#0f91bd",
        "primary-dark": "#0a6a8b",
        "primary-hover": "#0c7fa6",
        "background-light": "#f6f7f8",
        "background-dark": "#101d22",
        "surface-light": "#ffffff",
        "surface-dark": "#18282e", // Эсвэл #1a2c32, #1a292e зэрэг хувилбаруудыг нэгтгэх
        "text-main": "#111618",
        "text-secondary": "#617f89",
        "text-primary-light": "#111618",
        "text-primary-dark": "#e0e6e8",
        "text-secondary-light": "#617f89",
        "text-secondary-dark": "#9ab0b5",
        "border-light": "#e0e6e9",
        "border-dark": "#2a3d45",
      },
      fontFamily: {
        "display": ["Roboto", "Noto Sans", "sans-serif"]
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}