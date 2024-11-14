// File path: service/extensionService.ts

/**
 * ExtensionManage 是一个单例类，用于管理扩展的实例。
 * 提供注册、触发和移除插件扩展的功能。
 */
import { ExtensionProps } from "types/extensionRequirement";
import React from "react";
import { PluginConfiguration } from "types/pluginRequirement";

export class ExtensionService {
    /** 存储扩展的映射，键为扩展名称，值为插件名称和扩展的集合 */
    private extensions: Map<string, Set<{ pluginName: string; extension: ExtensionProps }>> = new Map();
    private configuration: Map<string, PluginConfiguration> = new Map();
    /** ExtensionManage 的唯一实例 */
    private static instance: ExtensionService;

    /** 私有构造函数，防止外部实例化 */
    private constructor() { }

    /**
     * 获取 ExtensionManage 的唯一实例。
     * @returns {ExtensionManage} 返回 ExtensionManage 的唯一实例。
     */
    public static getInstance(): ExtensionService {
        if (!this.instance) {
            this.instance = new ExtensionService();
        }
        return this.instance;
    }

    /** 注册扩展 */
    private register(extensionName: string, pluginName: string, extension: ExtensionProps, pluginConfiguration: PluginConfiguration) {
        const handlers = this.extensions.get(extensionName) || new Set();
        this.configuration.has(extensionName) || this.configuration.set(pluginName, pluginConfiguration);

        handlers.add({ pluginName, extension });
        this.extensions.set(extensionName, handlers);
    }

    /** 执行扩展方法 */
    private executeExtensionMethod<T>(extensionName: string, method: keyof ExtensionProps, ...args: any[]): Set<T> {
        const result = new Set<T>();
        const handlers = this.extensions.get(extensionName);

        if (handlers) {
            handlers.forEach(({ extension }) => {
                const methodFunction = extension[method];
                if (methodFunction) {
                    try {
                        const value = methodFunction(...args);
                        if (value && (typeof value === 'string' || React.isValidElement(value))) {
                            result.add(value as T);
                        }
                    } catch (error) {
                        console.error(`Error executing hook ${extensionName}:`, error);
                    }
                }
            });
        }
        return result;
    }

    /** 触发扩展的动作 */
    private triggerAction(extensionName: string, ...args: any[]): void {
        this.executeExtensionMethod<void>(extensionName, 'action', ...args);
    }

    /** 触发扩展的组件 */
    private triggerComponent(extensionName: string, ...args: any[]): Set<React.FC> {
        return this.executeExtensionMethod<React.FC>(extensionName, 'component', ...args);
    }

    /** 触发扩展的文本 */
    private triggerText(extensionName: string, ...args: any[]): Set<string> {
        return this.executeExtensionMethod<string>(extensionName, 'text', ...args);
    }

    /** 移除指定插件的扩展 */
    private removePluginExtensions(pluginName: string) {
        this.extensions.forEach((handlers, extensionName) => {
            const newHandlers = new Set(
                Array.from(handlers).filter(handler => handler.pluginName !== pluginName)
            );
            this.extensions.set(extensionName, newHandlers);
        });
        this.configuration.delete(pluginName);
    }

    //获取指定配置文件
    getConfiguration(pluginName: string): PluginConfiguration | undefined {
        return this.configuration.get(pluginName);
    }
}
