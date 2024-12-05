import ErrorPage from "hooks/error";
import layout from "themes/echoes/layout";
import article from "themes/echoes/article";
import about from "themes/echoes/about";
import { useLocation } from "react-router-dom";
import post from "themes/echoes/post";

export default function Routes() {
  const location = useLocation();
  let path = location.pathname;

  const args = {
    title: "我的页面",
    theme: "dark",
    nav: '<a href="/">index</a><a href="/error">error</a><a href="/about">about</a><a href="/post">post</a>',
  };

  console.log(path);
  path = path.split("/")[1];

  if (path === "error") {
    return layout.render({
      children: ErrorPage.render(args),
      args,
    });
  }

  if (path === "about") {
    return layout.render({
      children: about.render(args),
      args,
    });
  }

  if (path === "post") {
    return layout.render({
      children: post.render(args),
      args,
    });
  }

  return layout.render({
    children: article.render(args),
    args,
  });
}
