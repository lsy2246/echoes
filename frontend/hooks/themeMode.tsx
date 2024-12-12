import React, { useState, useEffect } from "react";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { Button } from "@radix-ui/themes";

const THEME_KEY = "theme-preference";

// 修改主题脚本，确保在服务端和客户端都能正确初始化
const themeScript = `
  (function() {
    try {
      const savedTheme = localStorage.getItem("${THEME_KEY}");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const theme = savedTheme || (prefersDark ? "dark" : "light");
      document.documentElement.dataset.theme = theme;
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
    } catch (e) {
      console.error('[ThemeScript] Error:', e);
      document.documentElement.dataset.theme = 'light';
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add('light');
    }
  })()
`;

// ThemeScript 组件需要尽早执行
export const ThemeScript = () => {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: themeScript,
      }}
    />
  );
};

// 客户端专用的 hook
const useClientOnly = (callback: () => void, deps: any[] = []) => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      callback();
    }
  }, deps);
};

export const ThemeModeToggle: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<string>(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.dataset.theme || "light";
    }
    return "light";
  });

  useClientOnly(() => {
    const currentTheme = document.documentElement.dataset.theme || "light";
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(currentTheme);
    setTheme(currentTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem(THEME_KEY)) {
        const newTheme = e.matches ? "dark" : "light";
        updateTheme(newTheme);
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () =>
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [mounted]);

  const updateTheme = (newTheme: string) => {
    document.documentElement.dataset.theme = newTheme;
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
    setTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    updateTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  };

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        className="w-full h-full p-0 rounded-lg transition-all duration-300 transform"
        aria-label="Theme toggle"
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
      {theme === "dark" ? (
        <SunIcon className="w-full h-full" />
      ) : (
        <MoonIcon className="w-full h-full" />
      )}
    </Button>
  );
};

export const useThemeMode = () => {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<"light" | "dark">("light");

  useClientOnly(() => {
    const handleThemeChange = () => {
      const currentTheme = document.documentElement.dataset.theme as
        | "light"
        | "dark";
      setMode(currentTheme || "light");
    };

    handleThemeChange();
    setMounted(true);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "data-theme") {
          handleThemeChange();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return { mode: mounted ? mode : "light" };
};
