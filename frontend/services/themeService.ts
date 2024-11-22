import { ThemeConfig, ThemeTemplate } from "contracts/themeContract";
import { ApiService } from "./apiService";

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

  public async initialize(): Promise<void> {
    try {
      const themeConfig = await this.api.request<ThemeConfig>(
        "/theme/current",
        { method: "GET" },
      );
      await this.loadTheme(themeConfig);
    } catch (error) {
      console.error("Failed to initialize theme:", error);
      throw error;
    }
  }

  private async loadTheme(config: ThemeConfig): Promise<void> {
    try {
      this.currentTheme = config;
      await this.loadTemplates();
    } catch (error) {
      console.error("Failed to load theme:", error);
      throw error;
    }
  }

  private async loadTemplates(): Promise<void> {
    if (!this.currentTheme) {
      throw new Error("No theme configuration loaded");
    }

    const loadTemplate = async (template: ThemeTemplate) => {
      try {
        const response = await fetch(template.path);
        const templateContent = await response.text();
        this.templates.set(template.name, templateContent);
      } catch (error) {
        console.error(`Failed to load template ${template.name}:`, error);
        throw error;
      }
    };

    const loadPromises = Array.from(this.currentTheme.templates.values()).map(
      (template) => loadTemplate(template),
    );

    await Promise.all(loadPromises);
  }

  public getThemeConfig(): ThemeConfig | undefined {
    return this.currentTheme;
  }

  public getTemplate(templateName: string): string {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }
    return template;
  }

  public getTemplateByRoute(route: string): string {
    if (!this.currentTheme) {
      throw new Error("No theme configuration loaded");
    }

    let templateName: string | undefined;

    if (route === "/") {
      templateName = this.currentTheme.routes.index;
    } else if (route.startsWith("/post/")) {
      templateName = this.currentTheme.routes.post;
    } else if (route.startsWith("/tag/")) {
      templateName = this.currentTheme.routes.tag;
    } else if (route.startsWith("/category/")) {
      templateName = this.currentTheme.routes.category;
    } else {
      templateName = this.currentTheme.routes.page.get(route);
    }

    if (!templateName) {
      templateName = this.currentTheme.routes.error;
    }

    return this.getTemplate(templateName);
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
