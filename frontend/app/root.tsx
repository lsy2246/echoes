import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { NotificationProvider } from "hooks/notification";
import { Theme } from '@radix-ui/themes';
import { useEffect, useState } from "react";

import "~/index.css";

export function Layout() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // 初始化主题
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

    // 监听主题变化
    const handleThemeChange = (event: CustomEvent<{ theme: 'light' | 'dark' }>) => {
      setTheme(event.detail.theme);
    };

    window.addEventListener('theme-change', handleThemeChange as EventListener);
    return () => window.removeEventListener('theme-change', handleThemeChange as EventListener);
  }, []);

  return (
    <html
      lang="en"
      className="h-full"
      suppressHydrationWarning={true}
    >
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <meta
          name="generator"
          content="echoes"
        />
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                document.documentElement.classList.remove('dark');
                const savedTheme = localStorage.getItem('theme-preference');
                if (savedTheme) {
                  document.documentElement.classList.toggle('dark', savedTheme === 'dark');
                } else {
                  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                  document.documentElement.classList.toggle('dark', darkModeMediaQuery.matches);
                }
              })()
            `,
          }}
        />
      </head>
      <body
        className="h-full"
        suppressHydrationWarning={true}
      >
        <Theme 
          appearance={theme}
          accentColor="blue"
          grayColor="slate"
          radius="medium"
          scaling="100%"
        >
          <NotificationProvider>
            <Outlet />
          </NotificationProvider>
        </Theme>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Layout />;
}
