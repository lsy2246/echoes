import ErrorPage from "hooks/error";
import layout from "themes/echoes/layout";
import article from "themes/echoes/article";
import about from "themes/echoes/about";
import { useLocation } from "react-router-dom";

export default function Routes() {
  const location = useLocation();
  let path = location.pathname;

  const args = {
    title: "我的页面",
    theme: "dark",
    nav: '<a href="/">index</a><a href="error">error</a><a href="about">about</a>',
  };

  console.log(path);
  path =path.split("/")[1];

  if (path[1] === "error") {
    return layout.render({
      children: ErrorPage.render(args),
      args,
    });
  }

  if (path[1] === "about") {
    return layout.render({
      children: about.render(args),
      args,
    });
  }

  return layout.render({
    children: article.render(args),
    args,
  });
}
