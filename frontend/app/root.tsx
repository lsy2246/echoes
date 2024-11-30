import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import { BaseProvider } from "hooks/servicesProvider";


import "~/index.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="generator" content="echoes" />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning={true}>
        <BaseProvider>
            <Outlet />
        </BaseProvider>

          <ScrollRestoration />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  function getInitialColorMode() {
                    const persistedColorPreference = window.localStorage.getItem('theme');
                    const hasPersistedPreference = typeof persistedColorPreference === 'string';
                    if (hasPersistedPreference) {
                      return persistedColorPreference;
                    }
                    const mql = window.matchMedia('(prefers-color-scheme: dark)');
                    const hasMediaQueryPreference = typeof mql.matches === 'boolean';
                    if (hasMediaQueryPreference) {
                      return mql.matches ? 'dark' : 'light';
                    }
                    return 'light';
                  }
                  const colorMode = getInitialColorMode();
                  document.documentElement.classList.toggle('dark', colorMode === 'dark');
                  
                  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                    const newColorMode = e.matches ? 'dark' : 'light';
                    document.documentElement.classList.toggle('dark', newColorMode === 'dark');
                    localStorage.setItem('theme', newColorMode);
                  });
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
