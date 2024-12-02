import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./common/**/*.{js,jsx,ts,tsx}",
    "./core/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        progress: {
          from: { transform: 'scaleX(1)' },
          to: { transform: 'scaleX(0)' }
        }
      },
      animation: {
        progress: 'progress 3s linear'
      }
    },
  },
} satisfies Config;
