import React from "react";
import { Configuration } from "interface/serializableType";
import { ThemeConfig } from "interface/theme";
import { HttpClient } from "core/http"
import { hashString } from "hooks/colorScheme"
import ErrorPage from "hooks/Error";

import { Field, FieldType, FindField, deserializeFields } from "interface/fields";

import { Template } from "interface/template";



// 创建布局渲染器的工厂函数
export const createLayoutRenderer = (layoutComponent: any, args: Configuration) => {
  const LayoutComponent = React.memo((props: { children: React.ReactNode }) => {
    console.log('LayoutComponent props:', props);
    console.log('layoutComponent:', layoutComponent);
    console.log('args:', args);

    if (typeof layoutComponent.render === 'function') {
      const rendered = layoutComponent.render({
        children: props.children,
        args: args || {},
      });
      console.log('Rendered result:', rendered);
      return rendered;
    }
    return React.createElement(layoutComponent, {
      children: props.children,
      args: args || {},
    });
  });
  LayoutComponent.displayName = 'LayoutRenderer';
  return (children: React.ReactNode) => React.createElement(LayoutComponent, { children });
};

// 创建组件的工厂函数
export const createComponentRenderer = (path: string) => {
  return React.lazy(async () => {
    try {
      const normalizedPath = path.startsWith('../') ? path : `../${path}`;
      const module = await import(/* @vite-ignore */ normalizedPath);
      if (module.default instanceof Template) {
        const Component = React.memo((props: any) => {
          const renderProps = {
            ...props,
            args: props.args || {},
            http: props.http || HttpClient.getInstance()
          };
          return module.default.render(renderProps);
        });
        Component.displayName = `LazyComponent(${path})`;
        return { default: Component };
      }
      throw new Error(`模块 ${path} 不是一个有效的模板组件`);
    } catch (error) {
      console.error(`加载组件失败: ${path}`, error);
      throw error;
    }
  });
};

export class ModuleManager {
  private static instance: ModuleManager;
  private layout: ((children: React.ReactNode) => any) | undefined;
  private error: React.FC | undefined;
  private loading: React.FC | undefined;
  private field: Array<Field> | undefined;
  private theme: ThemeConfig | undefined;
  private step!: number;
  private initialized: boolean = false;

  private constructor() {
    this.step = 0;
  }

  public getStep(): number {
    return this.step;
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  public async setStep(step: number): Promise<void> {
    this.step = step;
    
    // 如果是最后一步，重新初始化以加载完整配置
    if (step >= 3) {
      await this.init();
    }
  }

  private async init() {
    try {
      const http = HttpClient.getInstance();
      const step = await http.get("/step");
      this.step = Number(step) || 0;

      if (this.step >= 3) {
        const token = await http.systemToken<string>();
        const headers = {
          Authorization: `Bearer ${token}`
        };
        
        const field = await http.get("/field/system/0", { headers }) as Array<Field> | undefined;
        
        if (!field) {
          throw new Error("获取系统自定义字段失败");
        }
        
        this.field = deserializeFields(field);
        
        if (!this.field[0].field_type) {
          console.error('field_type is undefined in field:', this.field);
          this.step = 0;
          this.initialized = true;
          return;
        }

        const themeName = FindField(this.field, "current_theme", FieldType.data)?.field_value as string;
        const themeId = hashString(themeName)
        let rawThemeFields = await http.get(`/field/theme/${themeId}`, { headers }) as Array<Field>;
        let themeFields = deserializeFields(rawThemeFields);
        let themeConfig = FindField(themeFields, "config", FieldType.data)?.field_value as ThemeConfig;
        if (!themeConfig) {
          const themeModule = await import(/* @vite-ignore */ `../themes/${themeName}/theme.config.ts`);
          themeConfig = themeModule.default;
          await http.post(`/field/theme/${themeId}/data/config`, JSON.stringify(themeConfig), { headers });
        }
        
        this.theme = themeConfig;
        
        try {
          if (this.theme.error) {
            const normalizedPath = `../themes/${this.theme}/${this.theme.error}`;
            const ErrorModule = createComponentRenderer(normalizedPath);
            this.error = () => React.createElement(React.Suspense, { fallback: null }, React.createElement(ErrorModule));
          }
        } finally {
          if (!this.theme.error) {
            this.error = () => ErrorPage.render({});
          }
        }
        try{
          if (this.theme.layout) {
            const normalizedPath = `../themes/${themeName}/${this.theme.layout}`;
            const layoutModule = await import(/* @vite-ignore */ normalizedPath);
            this.layout = createLayoutRenderer(layoutModule.default, this.theme.configuration);
          }
        } catch (error) {
          console.error('Failed to load layout:', error);
          this.layout = undefined;
        }
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('Init error:', error);
      this.step = 0;  // 出错时重置步骤
      this.initialized = true;
    }
  }

  public static async getInstance(): Promise<ModuleManager> {
    if (!ModuleManager.instance) {
      ModuleManager.instance = new ModuleManager();
      await ModuleManager.instance.init();
    }
    return ModuleManager.instance;
  }

  public getPage(path: string): React.ReactNode {
    if (!this.theme?.routes) {
      console.error('Theme or routes not initialized');
      return this.error ? React.createElement(this.error) : null;
    }
    const temple_path = this.theme.routes[path];
    console.log('temple_path:', temple_path);
    console.log('theme configuration:', this.theme.configuration);
    
    try {
      if (temple_path) {
        const TemplateComponent = createComponentRenderer(/* @vite-ignore */ `../themes/${this.theme.name}/${temple_path}`);
        console.log('TemplateComponent:', TemplateComponent);
        
        const Component = React.createElement(
          React.Suspense, 
          { fallback: null }, 
          React.createElement(TemplateComponent, { 
            args: this.theme?.configuration || {},
            http: HttpClient.getInstance()
          })
        );
        console.log('Created Component:', Component);
        
        if (this.layout) {
          const layoutResult = this.layout(Component);
          console.log('Layout result:', layoutResult);
          return layoutResult;
        }
        return Component;
      }
    } catch (error) {
      console.error('Failed to render page:', error);
    }
    
    const error = this.error ? React.createElement(this.error) : null;
    if (this.layout) {
      return this.layout(error);
    }
    return error;
  }

}
