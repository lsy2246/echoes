// src/core/PluginManager.ts
import { PluginConfiguration } from 'types/pluginRequirement';
import { Contracts } from 'contracts/capabilityContract';

export class PluginManager {
    private plugins: Map<string, PluginProps> = new Map();
    private configurations: Map<string, PluginConfiguration> = new Map();
    private extensions: Map<string, ExtensionProps> = new Map();

    async loadPlugins() {
        // 扫描插件目录
        const pluginDirs = await this.scanPluginDirectory();
        
        for (const dir of pluginDirs) {
            try {
                const config = await import(`@/plugins/${dir}/plugin.config.ts`);
                const plugin: PluginProps = config.default;
                
                // 注册插件
                this.plugins.set(plugin.name, plugin);
                
                // 加载默认配置
                if (plugin.settingsSchema) {
                    this.configurations.set(plugin.name, plugin.settingsSchema);
                }
                
                // 注册扩展
                if (plugin.extensions) {
                    Object.entries(plugin.extensions).forEach(([key, value]) => {
                        this.extensions.set(`${plugin.name}.${key}`, value.extension);
                    });
                }
                
                // 执行安装钩子
                if (plugin.hooks?.onInstall) {
                    await plugin.hooks.onInstall({});
                }
            } catch (error) {
                console.error(`Failed to load plugin from directory ${dir}:`, error);
            }
        }
    }

    // 获取插件配置
    async getPluginConfig(pluginName: string): Promise<PluginConfiguration | undefined> {
        // 先尝试从数据库获取
        const dbConfig = await this.fetchConfigFromDB(pluginName);
        if (dbConfig) {
            return dbConfig;
        }
        // 返回默认配置
        return this.configurations.get(pluginName);
    }

    private async fetchConfigFromDB(pluginName: string) {
        // 实现数据库查询逻辑
        return null;
    }

    private async scanPluginDirectory(): Promise<string[]> {
        // 实现插件目录扫描逻辑
        return [];
    }
}