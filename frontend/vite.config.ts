import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import Routes from "~/routes"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      remix({
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
          v3_singleFetch: true,
          v3_lazyRouteDiscovery: true,
        },
        routes: (defineRoutes) => {
          return defineRoutes((route) => {
            if (!env.VITE_INIT_STATUS) {
              route("/", "init.tsx", { id: "index-route" });
              route("*", "init.tsx", { id: "catch-all-route" });
            }
            else {
              route("/", "routes.tsx", { id: "index-route" });
              route("*", "routes.tsx", { id: "catch-all-route" });
            }
          });
        }
      }),
      tsconfigPaths(),
    ],
    define: {
      "import.meta.env.VITE_SYSTEM_STATUS": JSON.stringify(false),
      "import.meta.env.VITE_SERVER_API": JSON.stringify("localhost:22000"),
      "import.meta.env.VITE_SYSTEM_PORT": JSON.stringify(22100),
    },
    server: {
      port: Number(env.VITE_SYSTEM_PORT ?? 22100),
      strictPort: true,
    },
  };
});