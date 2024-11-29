export interface AppConfig {
  port: string;
  host: string;
  initStatus: string;
  apiUrl: string;
  credentials: {
    username: string;
    password: string;
  };
}

export const DEFAULT_CONFIG: AppConfig = {
  port: "22100",
  host: "localhost",
  initStatus: "0",
  apiUrl: "http://127.0.0.1:22000",
  credentials: {
    username: "",
    password: "",
  },
} as const;

declare global {
  interface ImportMetaEnv extends Record<string, string> {
    VITE_PORT: string;
    VITE_HOST: string;
    VITE_INIT_STATUS: string;
    VITE_API_URL: string;
    VITE_USERNAME: string;
    VITE_PASSWORD: string;
  }
}
