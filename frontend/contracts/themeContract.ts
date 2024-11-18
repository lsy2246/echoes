import { Configuration } from "contracts/generalContract";
export interface ThemeConfig {
    name: string;
    displayName: string;
    icon?: string;
    version: string;
    description?: string;
    author?: string;
    templates: Map<string, ThemeTemplate>;
    globalSettings?: {
        layout?: string;
        css?: string;
    };
    configuration: Configuration;
    routes: {
        index: string;
        post: string;
        tag: string;
        category: string;
        error: string;
        page: Map<string, string>;
    }
}

export interface ThemeTemplate {
    path: string;
    name: string;
    description?: string;
}
