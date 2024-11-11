// File path: /d:/data/echoes/frontend/types/context.ts
/**
 * 应用程序上下文配置接口
 * 
 * 此接口定义了应用程序的上下文配置，包括API基础URL、主题、插件和资源目录的路径。
 */
export interface AppContext {
    apiBaseUrl: string; // 用于访问API的基础URL
    themesPath: string; // 存储主题文件的目录路径
    pluginsPath: string; // 存储插件文件的目录路径
    assetsPath: string; // 存储静态资源的目录路径
}