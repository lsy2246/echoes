import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./common/**/*.{js,jsx,ts,tsx}",
    "./core/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        custom: {
          bg: {
            light: "#FAFAFA", // 更柔和的背景色
            dark: "#111827", // 更深邃的暗色背景
          },
          box: {
            light: "#FFFFFF",
            dark: "#1E293B",
          },
          p: {
            light: "#374151", // 更清晰的文本颜色
            dark: "#D1D5DB", // 更亮的暗色文本，提高可读性
          },
          title: {
            light: "#111827",
            dark: "#F8FAFC", // 更亮的标题颜色
          },
        },
      },
      animation: {
        hide: 'hide 100ms ease-in',
        slideIn: 'slideIn 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        swipeOut: 'swipeOut 100ms ease-out',
      },
    },
  },
  darkMode: "class",
} satisfies Config;
