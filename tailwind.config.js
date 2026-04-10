/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'float-delay': 'float-delay 5s ease-in-out infinite 1s',
        'float-slow': 'float-slow 6s ease-in-out infinite 2s',
      }
    },
  },
  plugins: [],
}