/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,js}", "./placas.js"],
    theme: {
      extend: {
        colors: {
          'avanzi-red': '#b51515',
          'avanzi-yellow': '#ffe400',
        }
      },
    },
    plugins: [],
  }