import { ThemeConfig } from "interface/theme";

const themeConfig: ThemeConfig = {
  name: "echoes",
  displayName: "默认主题",
  version: "1.0.0",
  description: "一个简约风格的博客主题",
  author: "lsy",
  configuration: {
    "nav": {
      title: "导航配置",
      data: '<a href="h">你好</a> <a href="h">不好</a>'
    }
  },
  layout: "layout.tsx",
  templates: new Map([
    [
      "page",
      {
        path: "./templates/page",
        name: "文章列表模板",
        description: "博客首页展示模板",
      },
    ],
  ]),

  routes: new Map<string, string>([])
};

export default themeConfig;
