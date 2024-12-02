import React, { useState, useEffect } from "react";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { Button } from "@radix-ui/themes";

const THEME_KEY = "theme-preference";

export const ThemeModeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
      setIsDark(saved === "dark");
      document.documentElement.classList.toggle("dark", saved === "dark");
    } else {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(systemDark);
      document.documentElement.classList.toggle("dark", systemDark);
    }

    // 添加滚动监听
    let lastScroll = 0;
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setVisible(currentScroll <= lastScroll || currentScroll < 50);
      lastScroll = currentScroll;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem(THEME_KEY, newIsDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newIsDark);

    const event = new CustomEvent("theme-change", {
      detail: { theme: newIsDark ? "dark" : "light" },
    });
    window.dispatchEvent(event);
  };

  if (!mounted) return null;

  return (
    <Button
      variant="ghost"
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-all duration-300 transform ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <SunIcon width="24" height="24" className="text-yellow-400" /> 
      ) : (
        <MoonIcon width="24" height="24" /> 
      )}
    </Button>
  );
};
