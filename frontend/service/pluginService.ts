// File path: /service/pluginService.ts

/**
 * 插件服务类，采用单例模式管理插件组件。
 * 提供获取插件实例的方法，并缓存插件组件信息。
 */

import { PluginConfiguration } from "types/pluginRequirement";
export class PluginService {
    /** 单例实例 */
    private static pluginInstance: PluginService | null = null;   
    /** 插件组件缓存 */
    private pluginComponents: Map<string, Set<{
        name: string, // 插件名称
        configuration?: PluginConfiguration, // 插件配置
        managePath?: string, // 管理路径
    }>> = new Map(); 
    
    /** 
     * 私有构造函数，防止外部实例化。
     */
    private constructor() {};

    /** 
     * 获取插件服务的单例实例。
     * @returns {PluginService} 插件服务实例
     */
    public static getInstance(): PluginService {
        if (!this.pluginInstance) {
            this.pluginInstance = new PluginService();
        }
        return this.pluginInstance;
    }
}
