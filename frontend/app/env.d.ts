// File path: app/end.d.ts

/**
 * 配置
 */

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERVER_API: string; // 用于访问API的基础URL
  readonly VITE_THEME_PATH: string; // 存储主题文件的目录路径
  readonly VITE_CONTENT_PATH: string; //mark文章存储的位置
  readonly VITE_CONTENT_STATIC_PATH: string; //导出文章静态存储的位置
  readonly VITE_PLUGINS_PATH: string; // 存储插件文件的目录路径
  readonly VITE_ASSETS_PATH: string; // 存储静态资源的目录路径
  VITE_SYSTEM_USERNAME: string; // 前端账号名称
  VITE_SYSTEM_PASSWORD: string; // 前端账号密码
  VITE_SYSTEM_STATUS: boolean; // 系统是否进行安装
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
