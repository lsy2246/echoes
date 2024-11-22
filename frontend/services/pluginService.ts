import { PluginConfiguration } from "types/pluginRequirement";
import { Contracts } from "contracts/capabilityContract";

export class PluginManager {
  private plugins: Map<string, PluginProps> = new Map();
  private configurations: Map<string, PluginConfiguration> = new Map();
  private extensions: Map<string, ExtensionProps> = new Map();

  async loadPlugins() {
    const pluginDirs = await this.scanPluginDirectory();

    for (const dir of pluginDirs) {
      try {
        const config = await import(`@/plugins/${dir}/plugin.config.ts`);
        const plugin: PluginProps = config.default;

        this.plugins.set(plugin.name, plugin);

        if (plugin.settingsSchema) {
          this.configurations.set(plugin.name, plugin.settingsSchema);
        }

        if (plugin.extensions) {
          Object.entries(plugin.extensions).forEach(([key, value]) => {
            this.extensions.set(`${plugin.name}.${key}`, value.extension);
          });
        }

        if (plugin.hooks?.onInstall) {
          await plugin.hooks.onInstall({});
        }
      } catch (error) {
        console.error(`Failed to load plugin from directory ${dir}:`, error);
      }
    }
  }

  async getPluginConfig(
    pluginName: string,
  ): Promise<PluginConfiguration | undefined> {
    const dbConfig = await this.fetchConfigFromDB(pluginName);
    if (dbConfig) {
      return dbConfig;
    }
    return this.configurations.get(pluginName);
  }

  private async fetchConfigFromDB(pluginName: string) {
    return null;
  }

  private async scanPluginDirectory(): Promise<string[]> {
    return [];
  }
}
