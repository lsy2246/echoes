import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "path";
import { readEnvFile } from "./server/env";
import { DEFAULT_CONFIG, EnvConfig } from "./app/env";

// 修改为异步函数来读取最新的环境变量
async function getLatestEnv() {
  try {
    const envData = await readEnvFile();
    return {
      ...DEFAULT_CONFIG,
      ...envData,
    } as EnvConfig;
  } catch (error) {
    console.error("读取环境变量失败:", error);
    return DEFAULT_CONFIG;
  }
}

const createDefineConfig = (config: EnvConfig) => {
  return Object.entries(config).reduce(
    (acc, [key, value]) => {
      acc[`import.meta.env.${key}`] =
        typeof value === "string" ? JSON.stringify(value) : value;
      return acc;
    },
    {} as Record<string, any>,
  );
};

export default defineConfig(async ({ mode }) => {
  // 确保每次都读取最新的环境变量
  const currentConfig = await getLatestEnv();
  const env = loadEnv(mode, process.cwd(), "VITE_");

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
        routes: async (defineRoutes) => {
          // 每次路由配置时重新读取环境变量
          const latestConfig = await getLatestEnv();

          return defineRoutes((route) => {
            if (Number(latestConfig.VITE_INIT_STATUS) < 3) {
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
    define: createDefineConfig(currentConfig),
    server: {
      host: true,
      address: currentConfig.VITE_ADDRESS,
      port: Number(env.VITE_SYSTEM_PORT ?? currentConfig.VITE_PORT),
      strictPort: true,
      hmr: true,
      watch: {
        usePolling: true,
      },
      proxy: {
        "/__/api": {
          target: currentConfig.VITE_API_BASE_URL,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/__\/api/, ""),
        },
        "/__/express": {
          target: `http://${currentConfig.VITE_ADDRESS}:${Number(currentConfig.VITE_PORT) + 1}`,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/__\/express/, ""),
        },
      },
    },
    publicDir: resolve(__dirname, "public"),
    envPrefix: "VITE_",
  };
});
