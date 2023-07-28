/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}',
  'node_modules/preline/dist/*.js', ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('preline/plugin'),
  ],
};
