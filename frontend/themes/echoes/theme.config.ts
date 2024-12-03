import { ThemeConfig } from "interface/theme";

const themeConfig: ThemeConfig = {
  name: "echoes",
  displayName: "默认主题",
  version: "1.0.0",
  description: "一个简约风格的博客主题",
  author: "lsy",
  configuration: {},
  globalSettings: {
    layout: "layout.tsx",
  },
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

  routes: {
    article: "",
    post: "",
    tag: "",
    category: "",
    error: "",
    page: new Map<string, string>([]),
  },
};

export default themeConfig;
