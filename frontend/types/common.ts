// types/common.ts
/**
 * 版本信息接口
 */
export interface VersionInfo {
    major: number;  // 主版本号 - 不兼容的API修改
    minor: number;  // 次版本号 - 向下兼容的功能性新增
    patch: number;  // 修订号 - 向下兼容的问题修正
}

/**
 * 依赖项配置接口
 */
export interface Dependency {
    id: string;     // 依赖项的唯一标识符
    version: string; // 依赖项的版本要求
    type: 'plugin' | 'theme'; // 依赖项类型：插件或主题
}