import React, { useState, useEffect } from "react";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { Button } from "@radix-ui/themes";

const THEME_KEY = "theme-preference";

// 添加这个脚本来预先设置主题，避免闪烁
const themeScript = `
  (function() {
    function getInitialTheme() {
      const savedTheme = localStorage.getItem("${THEME_KEY}");
      if (savedTheme) {
        document.documentElement.className = savedTheme;
        return savedTheme;
      }
      
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const theme = isDark ? "dark" : "light";
      document.documentElement.className = theme;
      localStorage.setItem("${THEME_KEY}", theme);
      return theme;
    }
    
    // 确保在 DOM 内容加载前执行
    if (document.documentElement) {
      getInitialTheme();
    } else {
      document.addEventListener('DOMContentLoaded', getInitialTheme);
    }
  })()
`;

export const ThemeScript = () => {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
};

export const ThemeModeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean | null>(null);
  
  // 初始化主题状态
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initTheme = () => {
        const savedTheme = localStorage.getItem(THEME_KEY);
        const currentTheme = document.documentElement.className;
        
        // 确保 localStorage 和 DOM 的主题状态一致
        if (savedTheme && savedTheme !== currentTheme) {
          document.documentElement.className = savedTheme;
        }
        
        setIsDark(savedTheme === 'dark' || currentTheme === 'dark');
      };

      initTheme();
      
      // 监听系统主题变化
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        if (!localStorage.getItem(THEME_KEY)) {
          const newTheme = e.matches ? 'dark' : 'light';
          document.documentElement.className = newTheme;
          setIsDark(e.matches);
        }
      };
      
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      
      return () => {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      };
    }
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
