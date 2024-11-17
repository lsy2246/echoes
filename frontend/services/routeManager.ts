// File path: services/routeManager.ts
import { useEffect } from 'react';
import { useRoutes, RouteObject } from 'react-router-dom';
import { ThemeService } from './themeService';
import ErrorBoundary from '../components/ErrorBoundary';

export class RouteManager {
  private static instance: RouteManager;
  private themeService: ThemeService;
  private routes: RouteObject[] = [];

  private constructor(themeService: ThemeService) {
    this.themeService = themeService;
  }

  public static getInstance(themeService?: ThemeService): RouteManager {
    if (!RouteManager.instance && themeService) {
      RouteManager.instance = new RouteManager(themeService);
    }
    return RouteManager.instance;
  }

  /**
   * 初始化路由
   */
  public async initialize(): Promise<void> {
    const themeConfig = this.themeService.getThemeConfig();
    if (!themeConfig) {
      throw new Error('Theme configuration not loaded');
    }

    this.routes = [
      {
        path: '/',
        element: this.createRouteElement(themeConfig.routes.index),
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/post/:id',
        element: this.createRouteElement(themeConfig.routes.post),
      },
      {
        path: '/tag/:tag',
        element: this.createRouteElement(themeConfig.routes.tag),
      },
      {
        path: '/category/:category',
        element: this.createRouteElement(themeConfig.routes.category),
      },
      {
        path: '*',
        element: this.createRouteElement(themeConfig.routes.error),
      },
    ];

    // 添加自定义页面路由
    themeConfig.routes.page.forEach((template, path) => {
      this.routes.push({
        path,
        element: this.createRouteElement(template),
      });
    });
  }

  /**
   * 创建路由元素
   */
  private createRouteElement(templateName: string) {
    return (props: any) => {
      const template = this.themeService.getTemplate(templateName);
      // 这里可以添加模板渲染逻辑
      return <div dangerouslySetInnerHTML={{ __html: template }} />;
    };
  }

  /**
   * 获取所有路由
   */
  public getRoutes(): RouteObject[] {
    return this.routes;
  }

  /**
   * 添加新路由
   */
  public addRoute(path: string, templateName: string): void {
    this.routes.push({
      path,
      element: this.createRouteElement(templateName),
    });
  }
}