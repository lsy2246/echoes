import { ReactNode } from "react"; // Import React
import { LoaderFunction } from "react-router-dom";
import { Template } from "interface/template";

export class TemplateManager {
  private static instance: TemplateManager;
  private templates = new Map<string, Template>();

  private constructor() {}

  public static getInstance(): TemplateManager {
    if (!TemplateManager.instance) {
      TemplateManager.instance = new TemplateManager();
    }
    return TemplateManager.instance;
  }

// 读取主题和模板中的模板

}