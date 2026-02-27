/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'display': ['Cormorant Garamond', 'serif'],
        'sans': ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}