import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { NotificationProvider } from "hooks/Notification";
import { ThemeScript } from "hooks/ThemeMode";

import "~/index.css";

export function Layout() {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning={true}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="Expires" content="0" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />

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
        <NotificationProvider>
            <Outlet />
          </NotificationProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Layout />;
}
