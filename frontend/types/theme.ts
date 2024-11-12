// types/theme.ts
/**
 * 主题配置和模板接口定义文件
 * 该文件包含主题配置接口和主题模板接口的定义，用于主题管理和渲染。
 */

/**
 * 主题配置接口
 */
export interface ThemeConfig {
    name: string; // 主题的唯一标识符
    displayName: string; // 主题的显示名称
    version: string; // 主题的版本号
    description?: string; // 主题的描述信息
    author?: string; // 主题的作者信息 
    entry: string; // 主题的入口组件路径
    templates: Map<string, ThemeTemplate>; // 主题模板的映射表
    /** 主题全局配置 */
    globalSettings: {
        layout?: string; // 主题的布局配置
        css?: string; // 主题的CSS配置
    };
    /** 主题配置文件 */
    settingsSchema: Record<string, {
        type: string; // 属性的数据类型
        title: string; // 属性的标题
        description?: string; // 属性的描述信息
        data?: any; // 属性的默认数据
    }>;
    /** 依赖 */
    dependencies?: {
        plugins?: string[]; // 主题所依赖的插件列表
        assets?: string[]; // 主题所依赖的资源列表
    };
    /** 钩子 */
    hooks?: {
        beforeRender?: string; // 渲染前执行的钩子
        afterRender?: string; // 渲染后执行的钩子
        onActivate?: string; // 主题激活时执行的钩子
        onDeactivate?: string; // 主题停用时执行的钩子
    };
}

/**
 * 主题模板接口
 */
export interface ThemeTemplate {
    path: string; // 模板文件的路径
    name: string; // 模板的名称
    description?: string; // 模板的描述信息
}
