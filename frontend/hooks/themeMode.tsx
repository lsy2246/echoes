import React, { useState, useEffect } from "react";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { Button } from "@radix-ui/themes";

const THEME_KEY = "theme-preference";

// 添加这个脚本来预先设置主题，避免闪烁
const themeScript = `
  (function() {
    function getInitialTheme() {
      const savedTheme = localStorage.getItem("${THEME_KEY}");
      if (savedTheme) return savedTheme;
      
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const theme = isDark ? "dark" : "light";
      localStorage.setItem("${THEME_KEY}", theme);
      return theme;
    }
    document.documentElement.className = getInitialTheme();
  })()
`;

export const ThemeScript = () => {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
};

export const ThemeModeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(THEME_KEY);
      const initialIsDark = savedTheme === 'dark' || document.documentElement.className === 'dark';
      setIsDark(initialIsDark);
    }
  }, []);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDarkTheme = document.documentElement.className === 'dark';
          setIsDark(isDarkTheme);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    if (isDark === null) return;
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    const newTheme = newIsDark ? "dark" : "light";
    document.documentElement.className = newTheme;
    localStorage.setItem(THEME_KEY, newTheme);
  };

  if (isDark === null) {
    return (
      <Button
        variant="ghost"
        className="w-full h-full p-0 rounded-lg transition-all duration-300 transform"
        aria-label="Loading theme"
      >
        <MoonIcon className="w-full h-full" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      onClick={toggleTheme}
      className="w-full h-full p-0 rounded-lg transition-all duration-300 transform"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <SunIcon className="w-full h-full" />
      ) : (
        <MoonIcon className="w-full h-full" />
      )}
    </Button>
  );
};

// 更新类型定义
declare global {
  interface Window {
    __THEME__?: "light" | "dark";
  }
}

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
