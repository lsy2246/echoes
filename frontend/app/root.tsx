import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import { HubProvider } from "core/hub";
import { MessageProvider, MessageContainer } from "hooks/message";

import "~/index.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
      </head>
      <body suppressHydrationWarning={true}>
        <HubProvider>
          <MessageProvider>
            <MessageContainer />
            <Outlet />
          </MessageProvider>
        </HubProvider>

        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function() {
              // 立即应用系统主题
              function applyTheme(isDark) {
                document.documentElement.classList.toggle('dark', isDark);
              }

              // 获取系统主题并立即应用
              const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
              applyTheme(darkModeMediaQuery.matches);

              // 添加主题变化监听
              try {
                // 现代浏览器的方式
                darkModeMediaQuery.addEventListener('change', (e) => {
                  applyTheme(e.matches);
                });
              } catch (e) {
                // 兼容旧版浏览器
                darkModeMediaQuery.addListener((e) => {
                  applyTheme(e.matches);
                });
              }
            })()
          `,
          }}
        />
        <Scripts />
      </body>
    </html>
  );
}
export default function App() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
