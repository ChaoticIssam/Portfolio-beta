import tailwindcssAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./srcs/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        // Add custom animations here if needed
      },
    },
  },
  plugins: [
    tailwindcssAnimate,
  ],
}
