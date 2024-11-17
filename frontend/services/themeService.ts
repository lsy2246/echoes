// File path: services/themeService.ts
import { ThemeConfig, ThemeTemplate } from "contracts/themeContract";
import { ApiService } from "./apiService";

export class ThemeService {
  private static instance: ThemeService;
  private currentTheme?: ThemeConfig;
  private templates: Map<string, string> = new Map();
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

  /**
   * 初始化主题服务
   */
  public async initialize(): Promise<void> {
    try {
      // 从API获取当前主题配置
      const themeConfig = await this.api.request<ThemeConfig>(
        '/theme/current',
        { method: 'GET' }
      );
      
      // 加载主题配置
      await this.loadTheme(themeConfig);
    } catch (error) {
      console.error('Failed to initialize theme:', error);
      throw error;
    }
  }

  /**
   * 加载主题配置
   */
  private async loadTheme(config: ThemeConfig): Promise<void> {
    try {
      this.currentTheme = config;
      await this.loadTemplates();
    } catch (error) {
      console.error('Failed to load theme:', error);
      throw error;
    }
  }

  /**
   * 加载主题模板
   */
  private async loadTemplates(): Promise<void> {
    if (!this.currentTheme) {
      throw new Error('No theme configuration loaded');
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

    // 并行加载所有模板
    const loadPromises = Array.from(this.currentTheme.templates.values())
      .map(template => loadTemplate(template));
    
    await Promise.all(loadPromises);
  }

  /**
   * 获取主题配置
   */
  public getThemeConfig(): ThemeConfig | undefined {
    return this.currentTheme;
  }

  /**
   * 获取模板内容
   */
  public getTemplate(templateName: string): string {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }
    return template;
  }

  /**
   * 根据路由获取对应的模板
   */
  public getTemplateByRoute(route: string): string {
    if (!this.currentTheme) {
      throw new Error('No theme configuration loaded');
    }

    let templateName: string | undefined;

    // 检查是否是预定义路由
    if (route === '/') {
      templateName = this.currentTheme.routes.index;
    } else if (route.startsWith('/post/')) {
      templateName = this.currentTheme.routes.post;
    } else if (route.startsWith('/tag/')) {
      templateName = this.currentTheme.routes.tag;
    } else if (route.startsWith('/category/')) {
      templateName = this.currentTheme.routes.category;
    } else {
      // 检查自定义页面路由
      templateName = this.currentTheme.routes.page.get(route);
    }

    if (!templateName) {
      templateName = this.currentTheme.routes.error;
    }

    return this.getTemplate(templateName);
  }

  /**
   * 更新主题配置
   */
  public async updateThemeConfig(config: Partial<ThemeConfig>): Promise<void> {
    try {
      const updatedConfig = await this.api.request<ThemeConfig>(
        '/theme/config',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(config),
        }
      );

      await this.loadTheme(updatedConfig);
    } catch (error) {
      console.error('Failed to update theme configuration:', error);
      throw error;
    }
  }
}