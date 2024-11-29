import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./common/**/*.{js,jsx,ts,tsx}",
    "./core/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        custom: {
          bg: {
            light: "#F5F5FB",
            dark: "#0F172A",
          },
          box: {
            light: "#FFFFFF",
            dark: "#1E293B",
          },
          p: {
            light: "#4b5563",
            dark: "#94A3B8",
          },
          title: {
            light: "#111827",
            dark: "#F1F5F9",
          },
        },
      },
    },
  },
  darkMode: "class",
} satisfies Config;
