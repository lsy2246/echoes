import { Configuration, PathDescription } from "common/serializableType";
import { ApiService } from "./api";

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
    index: string;
    post: string;
    tag: string;
    category: string;
    error: string;
    loading: string;
    page: Map<string, string>;
  };
}

export interface Template {
  name: string;
  description?: string;
  config: {
    layout?: string;
    styles?: string[];
    scripts?: string[];
  };
  loader: () => Promise<void>;
  element: () => React.ReactNode;
}

export class ThemeService {
  private static instance: ThemeService;
  private currentTheme?: ThemeConfig;
  private api: ApiService;

  private constructor(api: ApiService) {
    this.api = api;
  }

  public static getInstance(api?: ApiService): ThemeService {
    if (!ThemeService.instance && api) {
      ThemeService.instance = new ThemeService(api);
    }
    return ThemeService.instance;
  }

  public async getCurrentTheme(): Promise<void> {
    try {
      const themeConfig = await this.api.request<ThemeConfig>(
        "/theme/current",
        { method: "GET" },
      );
      this.currentTheme = themeConfig;
    } catch (error) {
      console.error("Failed to initialize theme:", error);
      throw error;
    }
  }

  public getThemeConfig(): ThemeConfig | undefined {
    return this.currentTheme;
  }

  public async updateThemeConfig(config: Partial<ThemeConfig>): Promise<void> {
    try {
      const updatedConfig = await this.api.request<ThemeConfig>(
        "/theme/config",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(config),
        },
      );

      await this.loadTheme(updatedConfig);
    } catch (error) {
      console.error("Failed to update theme configuration:", error);
      throw error;
    }
  }
}
