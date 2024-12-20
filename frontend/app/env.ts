export interface EnvConfig {
  VITE_PORT: string;
  VITE_ADDRESS: string;
  VITE_API_BASE_URL: string;
  VITE_API_USERNAME: string;
  VITE_API_PASSWORD: string;
}

export const DEFAULT_CONFIG: EnvConfig = {
  VITE_PORT: "22100",
  VITE_ADDRESS: "localhost",
  VITE_API_BASE_URL: "http://127.0.0.1:22000",
  VITE_API_USERNAME: "",
  VITE_API_PASSWORD: "",
};

// 扩展 ImportMeta 接口
declare global {
  interface ImportMetaEnv extends EnvConfig {}
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
