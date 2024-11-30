import express from "express";
import cors from "cors";
import { DEFAULT_CONFIG } from "../app/env";
import { readEnvFile, writeEnvFile } from "./env";

const app = express();
const address = process.env.VITE_ADDRESS ?? DEFAULT_CONFIG.VITE_ADDRESS;
const port = Number(process.env.VITE_PORT ?? DEFAULT_CONFIG.VITE_PORT);

const ALLOWED_ORIGIN = `http://${address}:${port}`;
// 配置 CORS，只允许来自 Vite 服务器的请求
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === ALLOWED_ORIGIN) {
        callback(null, true);
      } else {
        callback(new Error("不允许的来源"));
      }
    },
    credentials: true,
  }),
);

// 添加 IP 和端口检查中间件
const checkAccessMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const clientIp = req.ip === "::1" ? "localhost" : req.ip;
  const clientPort = Number(req.get("origin")?.split(":").pop() ?? 0);

  const isLocalIp = clientIp === "localhost" || clientIp === "127.0.0.1";
  const isAllowedPort = clientPort === port;

  if (isLocalIp && isAllowedPort) {
    next();
  } else {
    res.status(403).json({
      error: "禁止访问",
      detail: `仅允许 ${address}:${port} 访问`,
    });
  }
};

app.use(checkAccessMiddleware);
app.use(express.json());

app.get("/env", async (req, res) => {
  try {
    const envData = await readEnvFile();
    res.json(envData);
  } catch (error) {
    res.status(500).json({ error: "读取环境变量失败" });
  }
});

app.post("/env", async (req, res) => {
  try {
    const newEnv = req.body;
    await writeEnvFile(newEnv);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "更新环境变量失败" });
  }
});

app.listen(port + 1, address, () => {
  console.log(`内部服务器运行在 http://${address}:${port + 1}`);
});
