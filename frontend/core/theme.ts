import React from "react";
import { Configuration } from "interface/serializableType";
import {ThemeConfig} from "interface/theme";
import {HttpClient} from "core/http"
// 创建布局渲染器的工厂函数

const createLayoutRenderer = (layoutComponent: any, args: Configuration) => {
  return (children: React.ReactNode) => {
    return layoutComponent.render({
      children,
      args,
    });
  };
};

// 创建组件的工厂函数
const createComponentRenderer = (path: string) => {
  return React.lazy(async () => {
    const module = await import(/* @vite-ignore */ path);
    return {
      default: (props: any) => {
        if (typeof module.default.render === "function") {
          return module.default.render(props);
        }
      },
    };
  });
};

export class TemplateManager {
  private static instance: TemplateManager;
  private routes = new Map<string, string>();
  private layout: React.FC | undefined;
  private error: React.FC | undefined;
  private loading: React.FC | undefined;
  private field : ThemeConfig;

  private constructor() {
    const http=HttpClient.getInstance();
    http.systemToken()
  }

  public static getInstance(): TemplateManager {
    if (!TemplateManager.instance) {
      TemplateManager.instance = new TemplateManager();
    }
    return TemplateManager.instance;
  }



  // 读取主题和模板中的模板
}
