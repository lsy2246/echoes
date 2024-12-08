import ErrorPage from "hooks/Error";
import layout from "themes/echoes/layout";
import article from "themes/echoes/article";
import about from "themes/echoes/about";
import { useLocation } from "react-router-dom";
import post from "themes/echoes/post";
import { memo, useCallback } from "react";
import login from "~/dashboard/login";
import adminLayout from "~/dashboard/layout";

const args = {
  title: "我的页面",
  theme: "dark",
  nav: '<a href="/">index</a><a href="/error">error</a><a href="/about">about</a><a href="/post">post</a>',
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
const renderAdminLayout = createLayoutRenderer(adminLayout);

const Routes = memo(() => {
  const location = useLocation();
  const path = location.pathname.split("/")[1];

  // 使用 useCallback 缓存渲染函数
  const renderContent = useCallback((Component: any) => {
    return renderLayout(Component.render(args));
  }, []);

  // 添加管理后台内容渲染函数
  const renderAdminContent = useCallback((Component: any) => {
    return renderAdminLayout(Component.render(args));
  }, []);

  // 根据路径返回对应组件
  if (path === "error") {
    return renderContent(ErrorPage);
  }

  if (path === "about") {
    return renderContent(about);
  }

  if (path === "post") {
    return renderContent(post);
  }

  if (path === "login") {
    return login.render(args);
  }

  // 添加管理后台路由判断
  if (path === "admin") {
    // 这里可以根据实际需要添加不同的管理页面组件
    const subPath = location.pathname.split("/")[2];
    
    // 如果没有子路径，显示仪表盘
    if (!subPath) {
      return renderAdminLayout(<div>仪表盘内容</div>);
    }

    // 根据子路径返回对应的管理页面
    switch (subPath) {
      case "posts":
        return renderAdminLayout(<div>文章管理</div>);
      case "media":
        return renderAdminLayout(<div>媒体管理</div>);
      case "comments":
        return renderAdminLayout(<div>评论管理</div>);
      case "categories":
        return renderAdminLayout(<div>分类管理</div>);
      case "settings":
        return renderAdminLayout(<div>系统设置</div>);
      default:
        return renderAdminLayout(<div>404 未找到页面</div>);
    }
  }

  return renderContent(article);
});

export default Routes;
