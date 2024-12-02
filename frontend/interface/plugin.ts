import { Configuration, PathDescription } from "interface/serializableType";

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
  routes: Set<PathDescription>;
}
