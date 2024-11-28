import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
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
            if (Number(env.VITE_INIT_STATUS??1)<4) {
              route("/", "init.tsx", { id: "index-route" });
              route("*", "init.tsx", { id: "catch-all-route" });
            } else {
              route("/", "routes.tsx", { id: "index-route" });
              route("*", "routes.tsx", { id: "catch-all-route" });
            }
          });
        },
      }),
      tsconfigPaths(),
    ],
    define: {
      "import.meta.env.VITE_INIT_STATUS": JSON.stringify(1),
      "import.meta.env.VITE_SERVER_API": JSON.stringify("localhost:22000"),
      "import.meta.env.VITE_PORT": JSON.stringify(22100),
      "import.meta.env.VITE_ADDRESS": JSON.stringify("localhost"),
    },
    server: {
      host: true,
      address: "localhost",
      port: Number(env.VITE_SYSTEM_PORT ?? 22100),
      strictPort: true,
      hmr: true, // 确保启用热更新
      watch: {
        usePolling: true, // 添加这个配置可以解决某些系统下热更新不工作的问题
      },
    },
    publicDir: resolve(__dirname, "public"),
  };
});
