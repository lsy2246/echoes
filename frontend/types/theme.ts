// types/theme.ts
import {Dependency} from "./common.ts";

/**
 * 主题配置接口
 */
export interface ThemeConfig {
    name: string;        // 主题的唯一名称标识符
    version: string;     // 主题版本
    displayName: string; // 主题显示名称
    description?: string; // 主题描述
    author?: string;     // 主题作者
    preview?: string;    // 主题预览图URL
    globalStyles?: string; // 主题全局样式
    dependencies?: Dependency[]; // 主题依赖项
    performance?: {
        maxLoadTime?: number;     // 最大加载时间（毫秒）
        maxMemoryUsage?: number;  // 最大内存使用量（bytes）
    };
}