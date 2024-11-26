// File path: app/end.d.ts

/**
 * 配置
 */

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERVER_API: string; // 用于访问API的基础URL
  readonly VITE_SYSTEM_PORT: number; // 系统端口
  VITE_SYSTEM_USERNAME: string; // 前端账号名称
  VITE_SYSTEM_PASSWORD: string; // 前端账号密码
  VITE_INIT_STATUS: boolean; // 系统是否进行安装
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
