// File path: types/plugin.ts

/**
 * 插件配置接口
 * 
 * 该接口定义了插件的基本配置，包括插件的名称、版本、描述、作者等信息。
 * 还包括插件的生命周期钩子和依赖项的配置。
 */
export interface PluginConfig {
    name: string;       // 插件名称
    version: string;    // 插件版本
    displayName: string; // 插件显示名称
    description?: string; // 插件描述（可选）
    author?: string;    // 插件作者（可选）
    enabled: boolean;   // 插件是否启用
    icon?: string;      // 插件图标URL（可选）
    managePath?: string; // 插件管理页面路径（可选）
    entry: string;      // 插件入口组件路径
    // 主题配置
    settingsSchema?: {
        type: string; // 配置类型
        properties: Record<string, {
            type: string; // 属性类型
            title: string; // 属性标题
            description?: string; // 属性描述（可选）
            data?: any; // 额外数据（可选）
        }>;
    };
    // 依赖
    dependencies?: {
        plugins?: string[]; // 依赖的插件列表（可选）
        themes?: string[];  // 依赖的主题列表（可选）
    };
    // 插件生命周期钩子
    hooks?: {
        onInstall?: string; // 安装时调用的钩子（可选）
        onUninstall?: string; // 卸载时调用的钩子（可选）
        onEnable?: string; // 启用时调用的钩子（可选）
        onDisable?: string; // 禁用时调用的钩子（可选）
    };
}