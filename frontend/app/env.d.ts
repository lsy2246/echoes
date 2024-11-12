// File path: app/end.d.ts

/**
 * 配置
 */

/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_TYPE: boolean; //用于判断是动态博客还是静态博客
    readonly VITE_APP_API: string; // 用于访问API的基础URL
    readonly VITE_THEME_PATH: string; // 存储主题文件的目录路径
    readonly VITE_CONTENT_PATH: string; //mark文章存储的位置
    readonly VITE_PLUGINS_PATH: string; // 存储插件文件的目录路径
    readonly VITE_ASSETS_PATH: string; // 存储静态资源的目录路径
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}