import { Configuration } from "contracts/generalContract";

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
  routs: Set<{
    description?: string;
    path: string;
  }>;
}
