import { Configuration, PathDescription } from "commons/serializableType";
import { HttpClient } from "core/http";

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

export class ThemeService {
  private static instance: ThemeService;
  private currentTheme?: ThemeConfig;
  private http: HttpClient;

  private constructor(api: HttpClient) {
    this.http = api;
  }

  public static getInstance(api?: HttpClient): ThemeService {
    if (!ThemeService.instance && api) {
      ThemeService.instance = new ThemeService(api);
    }
    return ThemeService.instance;
  }

  public async getCurrentTheme(): Promise<void> {
    try {
      const themeConfig = await this.http.api<ThemeConfig>("/theme", {
        method: "GET",
      });
      this.currentTheme = themeConfig;
    } catch (error) {
      console.error("Failed to initialize theme:", error);
      throw error;
    }
  }

  public getThemeConfig(): ThemeConfig | undefined {
    return this.currentTheme;
  }

  public async updateThemeConfig(
    config: Partial<ThemeConfig>,
    name: string,
  ): Promise<void> {
    try {
      const updatedConfig = await this.http.api<ThemeConfig>(`/theme/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      await this.loadTheme(updatedConfig);
    } catch (error) {
      console.error("Failed to update theme configuration:", error);
      throw error;
    }
  }
}
