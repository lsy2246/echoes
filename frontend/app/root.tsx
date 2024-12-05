import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { NotificationProvider } from "hooks/notification";
import { Theme } from "@radix-ui/themes";
import { ThemeScript } from "hooks/themeMode";

import "~/index.css";

export function Layout() {
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
        <meta
          httpEquiv="Cache-Control"
          content="no-cache, no-store, must-revalidate"
        />
        <meta
          httpEquiv="Pragma"
          content="no-cache"
        />
        <meta
          httpEquiv="Expires"
          content="0"
        />

        <title>Echoes</title>
        <ThemeScript/>
        <Meta />
        <Links />
      </head>
      <body
        className="h-full"
        suppressHydrationWarning={true}
      >
        <Theme
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
