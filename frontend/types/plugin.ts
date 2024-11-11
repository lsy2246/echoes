// types/plugin.ts
import {Dependency} from "./common";

/**
 * 插件配置接口
 */
export interface PluginConfig {
    id: string;         // 插件唯一标识符
    name: string;       // 插件名称
    version: string;    // 插件版本
    displayName: string; // 插件显示名称
    description?: string; // 插件描述
    author?: string;    // 插件作者
    enabled: boolean;   // 插件是否启用
    icon?: string;      // 插件图标URL
    adminPath?: string; // 插件管理页面路径
    entry: string;      // 插件入口组件路径
    dependencies?: Dependency[]; // 插件依赖项
    performance?: {
        maxLoadTime?: number;     // 最大加载时间（毫秒）
        maxMemoryUsage?: number;  // 最大内存使用量（bytes）
    };
}