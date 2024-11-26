export interface PluginDefinition {
  meta: {
    name: string;
    version: string;
    displayName: string;
    description?: string;
    author?: string;
    icon?: string;
  };
  config?: Config;
  routes: {
    path: string;
    description?: string;
  }[];
  enabled: boolean;
  managePath?: string;
} 