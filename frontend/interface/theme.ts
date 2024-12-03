import { Configuration, PathDescription } from "interface/serializableType";

export interface ThemeConfig {
  name: string;
  displayName: string;
  icon?: string;
  version: string;
  description?: string;
  author?: string;
  templates: Map<string, PathDescription>;
  globalSettings?: {
    layout?: string;
    css?: string;
  };
  configuration: Configuration;
  routes: {
    article: string;
    post: string;
    tag: string;
    category: string;
    error: string;
    page: Map<string, string>;
  };
}
