import React, { useState, useEffect } from "react";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { Button } from "@radix-ui/themes";

const THEME_KEY = "theme-preference";

export const ThemeModeToggle: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(THEME_KEY);
    const initialTheme =
      saved ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    setIsDark(initialTheme === "dark");
    if (saved) {
      document.documentElement.className = saved;
    } else {
      document.documentElement.className = initialTheme;
    }

    let lastScroll = 0;
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setVisible(currentScroll <= lastScroll || currentScroll < 50);
      lastScroll = currentScroll;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    const newTheme = newIsDark ? "dark" : "light";
    document.documentElement.className = newTheme;
    localStorage.setItem(THEME_KEY, newTheme);
  };

  if (!mounted) return null;

  return (
    <Button
      variant="ghost"
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-all duration-300 transform ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <SunIcon width="24" height="24" />
      ) : (
        <MoonIcon width="24" height="24" />
      )}
    </Button>
  );
};

export const useThemeMode = () => {
  const [mode, setMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved) {
        setMode(saved as "light" | "dark");
      } else {
        const isDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        setMode(isDark ? "dark" : "light");
      }

      // 监听主题变化事件
      const handleThemeChange = (e: CustomEvent) => {
        setMode(e.detail.theme);
      };

      window.addEventListener(
        "theme-change",
        handleThemeChange as EventListener,
      );
      return () =>
        window.removeEventListener(
          "theme-change",
          handleThemeChange as EventListener,
        );
    }
  }, []);

  return { mode };
};
