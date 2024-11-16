// File path: contracts\themeTypeContract.ts
/**
 * 主题配置和模板接口定义文件
 * 该文件包含主题配置接口和主题模板接口的定义，用于主题管理和渲染。
 */

/**
 * 主题配置接口
 * 定义主题的基本信息、模板、全局配置、依赖、钩子和路由。
 */
import { CapabilityProps } from "contracts/capabilityContract";
import { SerializeType } from "contracts/generalContract";
export interface ThemeConfig {
    name: string; // 主题的名称
    displayName: string; // 主题的显示名称
    version: string; // 主题的版本号
    description?: string; // 主题的描述信息
    author?: string; // 主题的作者信息 
    entry?: string; // 主题的入口路径
    templates: Map<string, ThemeTemplate>; // 主题模板的映射表
    /** 主题全局配置 */
    globalSettings?: {
        layout?: string; // 主题的布局配置
        css?: string; // 主题的CSS配置
    };
    /** 主题配置文件 */
    settingsSchema: Record<string, {
        name: string; // 属性的名称
        description?: string; // 属性的描述信息
        data: SerializeType; // 属性的默认数据
    }>;
    /** 依赖 */
    dependencies?: {
        plugins?: string[]; // 主题所依赖的插件列表
        assets?: string[]; // 主题所依赖的资源列表
    };
    /** 能力 */
    capabilities?: Set<CapabilityProps>;
    
    /** 路由 */
    routes: {
        index: string; // 首页使用的模板
        post: string; // 文章使用的模板
        tag: string; // 标签使用的模板
        category: string; // 分类使用的模板
        error: string; // 错误页面用的模板
        page: Map<string, string>; // 独立页面模板
    }
}

/**
 * 主题模板接口
 * 定义主题模板的基本信息，包括路径、名称和描述。
 */
export interface ThemeTemplate {
    path: string; // 模板文件的路径
    name: string; // 模板的名称
    description?: string; // 模板的描述信息
}
