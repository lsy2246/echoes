// service/theme/themeService.ts
import type { ThemeConfig } from 'types/themeTypeRequirement';

export class ThemeService {
    private static themeInstance: ThemeService; // 单例实例
    private themeConfig: ThemeConfig | null = null; // 当前主题配置
    private themeComponents: Map<string, React.ComponentType> = new Map(); // 主题组件缓存

    private constructor() { } // 私有构造函数，防止外部实例化

    // 获取单例实例
    public static getInstance(): ThemeService {
        if (!ThemeService.themeInstance) {
            ThemeService.themeInstance = new ThemeService();
        }
        return ThemeService.themeInstance;
    }

    // 加载主题
    async loadTheme(themeConfig: ThemeConfig): Promise<void> {
        this.themeConfig = themeConfig; // 设置当前主题
        await this.loadThemeComponents(themeConfig); // 加载主题组件
    }

    // 加载主题组件
    private async loadThemeComponents(config:ThemeConfig): Promise<void> {
        // 清除现有组件缓存
        this.themeComponents.clear();

        // 动态导入主题入口组件
        const entryComponent = await import(config.entry);
        this.themeComponents.set('entry', entryComponent.default); // 缓存入口路径

        // 加载所有模板组件
        for (const [key, template] of config.templates.entries()) {
            const component = await import(template.path);
            this.themeComponents.set(key, component.default); // 缓存模板组件
        }
    }

    // 获取指定模板名称的组件
    getComponent(templateName: string): React.ComponentType | null {
        return this.themeComponents.get(templateName) || null; // 返回组件或null
    }

    // 获取当前主题配置
    getCurrentTheme(): ThemeConfig | null {
        return this.currentTheme; // 返回当前主题配置
    }
}


