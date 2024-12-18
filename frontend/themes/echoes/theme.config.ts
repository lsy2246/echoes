import { ThemeConfig } from "interface/theme";

const themeConfig: ThemeConfig = {
  name: "echoes",
  displayName: "默认主题",
  version: "1.0.0",
  description: "一个简约风格的博客主题",
  author: "lsy",
  configuration: {
    nav: {
      title: "导航配置",
      data: '<a href="/">index</a><a href="/error">error</a><a href="/about">about</a><a href="/post">post</a><a href="/login">login</a><a href="/dashboard">dashboard</a>',
    },
  },
  layout: "layout.tsx",
  templates: new Map([
    [
      "posts",
      {
        path: "posts",
        name: "文章列表模板",
        description: "博客首页展示模板",
      },
    ],
    [
      "post",
      {
        path: "post",
        name: "文章详情模板",
        description: "文章详情展示模板",
      },
    ],
    [
      "about",
      {
        path: "about",
        name: "关于页面模板",
        description: "关于页面展示模板",
      },
    ],
  ]),

  routes: new Map<string, string>([]),
};

export default themeConfig;
