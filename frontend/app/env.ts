export interface EnvConfig {
  VITE_PORT: string;
  VITE_ADDRESS: string;
  VITE_INIT_STATUS: string;
  VITE_API_BASE_URL: string;
  VITE_API_USERNAME: string;
  VITE_API_PASSWORD: string;
  VITE_PATTERN: string;
}

export const DEFAULT_CONFIG: EnvConfig = {
  VITE_PORT: "22100",
  VITE_ADDRESS: "localhost",
  VITE_INIT_STATUS: "0",
  VITE_API_BASE_URL: "http://127.0.0.1:22000",
  VITE_API_USERNAME: "",
  VITE_API_PASSWORD: "",
  VITE_PATTERN: "true",
} as const;

// 扩展 ImportMeta 接口
declare global {
  interface ImportMetaEnv extends EnvConfig {}
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
