import {Configuration, PathDescription} from "interface/serializableType";

export interface ThemeConfig {
    name: string;
    displayName: string;
    icon?: string;
    version: string;
    description?: string;
    author?: string;
    templates: Map<string, PathDescription>;
    layout?: string;
    configuration: Configuration;
    loading?: string;
    error?: string;
    manage?: string;
    routes: Map<string, string>;
}
