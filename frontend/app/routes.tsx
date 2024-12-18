import ErrorPage from "hooks/Error";
import { useLocation } from "react-router-dom";
import post from "themes/echoes/post";
import React, { memo, useCallback } from "react";
import adminLayout from "~/dashboard/layout";
import dashboard from "~/dashboard/index";
import comments from "~/dashboard/comments";
import categories from "~/dashboard/categories";
import settings from "~/dashboard/settings";
import files from "~/dashboard/files";
import themes from "~/dashboard/themes";
import users from "~/dashboard/users";
import layout from "~/dashboard/layout";


// 创建布局渲染器的工厂函数
const createLayoutRenderer = (layoutComponent: any) => {
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

// 使用工厂函数创建不同的布局渲染器
const renderLayout = createLayoutRenderer(layout);
const renderDashboardLayout = createLayoutRenderer(adminLayout);

const Login = createComponentRenderer("./dashboard/login");
const posts = createComponentRenderer("themes/echoes/posts");

const Routes = memo(() => {
  const location = useLocation();
  const [mainPath, subPath] = location.pathname.split("/").filter(Boolean);

  // 使用 useCallback 缓存渲染函数
  const renderContent = useCallback((Component: any) => {
    if (React.isValidElement(Component)) {
      return renderLayout(Component);
    }
    return renderLayout(
      <React.Suspense fallback={<div>Loading...</div>}>
        {Component.render ? Component.render(args) : <Component args={args} />}
      </React.Suspense>,
    );
  }, []);

  // 添加管理后台内容渲染函数
  const renderDashboardContent = useCallback((Component: any) => {
    if (React.isValidElement(Component)) {
      return renderDashboardLayout(Component);
    }
    return renderDashboardLayout(
      <React.Suspense fallback={<div>Loading...</div>}>
        {Component.render ? Component.render(args) : <Component args={args} />}
      </React.Suspense>,
    );
  }, []);

  // 前台路由
  switch (mainPath) {
    case "error":
      return renderContent(ErrorPage);
    case "about":
      return renderContent(about);
    case "post":
      return renderContent(post);
    case "posts":
      return renderContent(posts);
    case "login":
      return <Login args={args} />;
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
        default:
          return renderDashboardContent(<div>404 未找到页面</div>);
      }
    default:
      return renderContent(article);
  }
});

export default Routes;
