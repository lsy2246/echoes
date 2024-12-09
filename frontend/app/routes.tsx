import ErrorPage from "hooks/Error";
import layout from "themes/echoes/layout";
import article from "themes/echoes/posts";
import about from "themes/echoes/about";
import { useLocation } from "react-router-dom";
import post from "themes/echoes/post";
import { memo, useCallback } from "react";
import login from "~/dashboard/login";
import adminLayout from "~/dashboard/layout";
import dashboard from "~/dashboard/index";
import posts from "~/dashboard/posts";
import comments from "~/dashboard/comments";
import categories from "./dashboard/categories";
import settings from "./dashboard/settings";
import files from "./dashboard/files";
import themes from "./dashboard/themes";
import users from "~/dashboard/users";
import plugins from "./dashboard/plugins";

const args = {
  title: "我的页面",
  theme: "dark",
  nav: '<a href="/">index</a><a href="/error">error</a><a href="/about">about</a><a href="/post">post</a><a href="/login">login</a><a href="/dashboard">dashboard</a>',
} as const;

// 创建布局渲染器的工厂函数
const createLayoutRenderer = (layoutComponent: any) => {
  return (children: React.ReactNode) => {
    return layoutComponent.render({
      children,
      args,
    });
  };
};

// 使用工厂函数创建不同的布局渲染器
const renderLayout = createLayoutRenderer(layout);
const renderDashboardLayout = createLayoutRenderer(adminLayout);

const Routes = memo(() => {
  const location = useLocation();
  const [mainPath, subPath] = location.pathname.split("/").filter(Boolean);

  // 使用 useCallback 缓存渲染函数
  const renderContent = useCallback((Component: any) => {
    return renderLayout(Component.render(args));
  }, []);

  // 添加管理后台内容渲染函数
  const renderDashboardContent = useCallback((Component: any) => {
    return renderDashboardLayout(Component.render(args));
  }, []);

  // 前台路由
  switch (mainPath) {
    case "error":
      return renderContent(ErrorPage);
    case "about":
      return renderContent(about);
    case "post":
      return renderContent(post);
    case "login":
      return login.render(args);
    case "dashboard":
      // 管理后台路由
      if (!subPath) {
        return renderDashboardContent(dashboard);
      }
      
      // 根据子路径返回对应的管理页面
      switch (subPath) {
        case "posts":
          return renderDashboardContent(posts);
        case "comments":
          return renderDashboardContent(comments);
        case "categories":
          return renderDashboardContent(categories);
        case "files":
          return renderDashboardContent(files);
        case "settings":
          return renderDashboardContent(settings);
        case "themes":
          return renderDashboardContent(themes);
        case "users":
          return renderDashboardContent(users);
        case "plugins":
          return renderDashboardContent(plugins);
        default:
          return renderDashboardContent(<div>404 未找到页面</div>);
      }
    default:
      return renderContent(article);
  }
});

export default Routes;
