import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, loadEnv, ConfigEnv, UserConfig } from "vite";
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

export default defineConfig(
  async ({ mode }: ConfigEnv): Promise<UserConfig> => {
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
        host: currentConfig.VITE_ADDRESS,
        port: Number(env.VITE_SYSTEM_PORT ?? currentConfig.VITE_PORT),
        strictPort: true,
        hmr: true,
        watch: {
          usePolling: true,
        },
      },
      publicDir: resolve(__dirname, "public"),
      envPrefix: "VITE_",
      build: {
        rollupOptions: {
          output: {
            manualChunks(id) {
              // 根据模块路径进行代码分割
              if (id.includes("node_modules")) {
                return "vendor";
              }
            },
          },
        },
        chunkSizeWarningLimit: 1500,
        minify: "terser",
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        },
        cssMinify: true,
        cssCodeSplit: true,
        sourcemap: mode !== "production",
        assetsInlineLimit: 4096,
        reportCompressedSize: false,
      },
      ssr: {
        noExternal: [
          "three",
          "@react-three/fiber",
          "@react-three/drei",
          "gsap",
        ],
      },
    };
  },
);
