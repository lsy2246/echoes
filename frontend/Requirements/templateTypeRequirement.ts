// File path: types/templateType.ts
/**
 * 插件配置接口
 * 
 * 该接口定义了模板的基本配置，包括依赖项、钩子和页面渲染函数。
 */
import React from "react"; 
import { ExtensionProps } from "types/extensionRequirement";

export interface TemplateConfig {
    /** 
     * 依赖项配置
     * 
     * 记录每个依赖字段的名称、描述和是否必填。
     */
    dependencies: Record<string, {
        name: string; // 依赖字段的名称
        description?: string; // 依赖字段的描述信息
        required?: boolean; // 依赖字段是否必填
    }>;


    extensions?: Record<string, {
        description?: string; 
        extension: ExtensionProps; 
    }>;

    /** 
     * 页面渲染函数
     * 
     * 接受参数并返回一个 React 组件。
     */
    page(params: Map<string, string>): React.FC;
}
