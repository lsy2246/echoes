
export interface PluginConfig {
  name: string;
  version: string;
  displayName: string;
  description?: string;
  author?: string;
  enabled: boolean;
  icon?: string;
  managePath?: string;
  configuration?: Configuration;
  routes: Set<{
    description?: string;
    path: string;
  }>;
}



export class PluginManager {
  private configurations: Map<string, PluginConfig> = new Map();

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
  ): Promise<PluginConfig | undefined> {
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
