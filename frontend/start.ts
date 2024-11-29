import { spawn } from "child_process";
import path from "path";
import { EventEmitter } from 'events'

// 设置全局最大监听器数量
EventEmitter.defaultMaxListeners = 20

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const startServers = async () => {
  // 先启动内部服务器
  const internalServer = spawn("tsx", ["backend/internalServer.ts"], {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV || "development",
    },
  });

  internalServer.on("error", (err) => {
    console.error("内部服务器启动错误:", err);
  });

  // 等待内部服务器启动
  console.log("等待内部服务器启动...");
  await delay(2000);

  // 然后启动 Vite
  const viteProcess = spawn("npm", ["run", "dev"], {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV || "development",
    },
  });

  viteProcess.on("error", (err) => {
    console.error("Vite 进程启动错误:", err);
  });

  const cleanup = () => {
    console.log("正在关闭服务器...");
    viteProcess.kill();
    internalServer.kill();
    process.exit();
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
};

startServers().catch((err) => {
  console.error("启动服务器时发生错误:", err);
  process.exit(1);
});
