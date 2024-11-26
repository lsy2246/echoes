import {
  Links,
  Meta,
  Outlet,
  ScrollRestoration,
} from "@remix-run/react";

import { BaseProvider } from "hooks/servicesProvider";
import { LinksFunction } from "@remix-run/react/dist/routeModules";

import "~/tailwind.css"; 

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
      <body>
        {children}
        <ScrollRestoration />
      </body>
    </html>
  );
}
export default function App() {
  return (
    <BaseProvider>
      <Layout>
        <Outlet />
      </Layout>
    </BaseProvider>
  );
}
