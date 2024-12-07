import ErrorPage from "hooks/Error";
import layout from "themes/echoes/layout";
import article from "themes/echoes/article";
import about from "themes/echoes/about";
import { useLocation } from "react-router-dom";
import post from "themes/echoes/post";
import { memo, useCallback } from "react";

const args = {
  title: "我的页面",
  theme: "dark",
  nav: '<a href="/">index</a><a href="/error">error</a><a href="/about">about</a><a href="/post">post</a>',
} as const;

const renderLayout = (children: React.ReactNode) => {
  return layout.render({
    children,
    args,
  });
};

const Routes = memo(() => {
  const location = useLocation();
  const path = location.pathname.split("/")[1];

  // 使用 useCallback 缓存渲染函数
  const renderContent = useCallback((Component: any) => {
    return renderLayout(Component.render(args));
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

  return renderContent(article);
});

export default Routes;
