import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { NotificationProvider } from "hooks/notification";
import { Theme } from "@radix-ui/themes";
import { useEffect, useState } from "react";

import "~/index.css";

export function Layout() {
  return (
    <html lang="en" className="h-full light" suppressHydrationWarning={true}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="generator" content="echoes" />
        <title>Echoes</title>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function getInitialTheme() {
                  const savedTheme = localStorage.getItem('theme-preference');
                  if (savedTheme) return savedTheme;
                  
                  return window.matchMedia('(prefers-color-scheme: dark)').matches 
                    ? 'dark' 
                    : 'light';
                }

                document.documentElement.className = getInitialTheme();
              })();
            `,
          }}
        />
        <Meta />
        <Links />
      </head>
      <body className="h-full" suppressHydrationWarning={true}>
        <Theme grayColor="slate" radius="medium" scaling="100%">
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
