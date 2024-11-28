// File path: app/end.d.ts

/**
 * 配置
 */

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_INIT_STATUS: string;
  readonly VITE_SERVER_API: string;
  readonly VITE_PORT: string;
  readonly VITE_ADDRESS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
