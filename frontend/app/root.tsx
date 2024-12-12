import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { NotificationProvider } from "hooks/Notification";
import { Theme } from "@radix-ui/themes";
import { ThemeScript } from "hooks/themeMode";

import "~/index.css";

export function Layout() {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning={true}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="Expires" content="0" />

        <title>Echoes</title>
        <ThemeScript />
        <Meta />
        <Links />
      </head>
      <body
        className="h-full"
        suppressHydrationWarning={true}
        data-cz-shortcut-listen="false"
      >
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
