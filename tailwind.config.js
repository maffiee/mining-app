// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1D1D1F',
          soft: '#F5F5F7',
          gold: '#B89E65',
        },
        surface: '#FFFFFF',
        text: {
          DEFAULT: '#1D1D1F',
          muted: '#6E6E73',
        },
        border: '#E5E5E7',
      },
    },
  },
  plugins: [],
};