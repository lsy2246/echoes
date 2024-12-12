import { spawn } from "child_process";
import path from "path";
import { EventEmitter } from "events";
import { DEFAULT_CONFIG } from "~/env";

const isDev = process.env.NODE_ENV !== "production";

const startServers = async () => {
  // 启动 Express 服务器（无论是开发还是生产环境都需要）
  const expressServer = spawn(
    "tsx",
    ["--trace-warnings", "server/express.ts"],
    {
      stdio: "inherit",
      shell: true,
      env: {
        ...process.env,
        PORT: DEFAULT_CONFIG.VITE_PORT + 1,
        IS_API_SERVER: "true",
      },
    },
  );

  expressServer.on("error", (err) => {
    console.error("Express 服务器启动错误:", err);
  });

  if (isDev) {
    // 开发环境启动
    console.log("正在以开发模式启动服务器...");

    // 启动 Vite
    const viteProcess = spawn(
      "node",
      ["--trace-warnings", "./node_modules/vite/bin/vite.js"],
      {
        stdio: "inherit",
        shell: true,
        env: {
          ...process.env,
          NODE_ENV: "development",
          VITE_PORT: DEFAULT_CONFIG.VITE_PORT,
        },
        cwd: process.cwd(),
      },
    );

    viteProcess.on("error", (err) => {
      console.error("Vite 进程启动错误:", err);
    });

    const cleanup = () => {
      console.log("正在关闭服务器...");
      viteProcess.kill();
      expressServer.kill();
      process.exit();
    };

    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
  } else {
    // 生产环境启动
    console.log("正在以生产模式启动服务器...");

    // 先执行构建
    const buildProcess = spawn("npm", ["run", "build"], {
      stdio: "inherit",
      shell: true,
    });

    buildProcess.on("error", (err) => {
      console.error("构建错误:", err);
      process.exit(1);
    });

    buildProcess.on("close", (code) => {
      if (code !== 0) {
        console.error("构建失败");
        process.exit(1);
      }

      console.log("构建完成，正在启动生产服务器...");

      // 使用 remix-serve 启动生产服务器
      const prodServer = spawn("remix-serve", ["./build/server/index.js"], {
        stdio: "inherit",
        shell: true,
        env: {
          ...process.env,
          NODE_ENV: "production",
          PORT: DEFAULT_CONFIG.VITE_PORT,
        },
        cwd: process.cwd(),
      });

      prodServer.on("error", (err) => {
        console.error("生产服务器启动错误:", err);
      });

      const cleanup = () => {
        console.log("正在关闭生产服务器...");
        prodServer.kill();
        expressServer.kill();
        process.exit();
      };

      process.on("SIGINT", cleanup);
      process.on("SIGTERM", cleanup);
    });
  }
};

startServers().catch((err) => {
  console.error("启动服务器时发生错误:", err);
  process.exit(1);
});
