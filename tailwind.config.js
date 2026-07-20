/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FFF9F5',
        orange: { 500: '#FB923C' },
        brown: { 700: '#7B4B2C' }
      }
    },
  },
  plugins: [],
}