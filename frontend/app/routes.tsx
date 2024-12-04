import ErrorPage from "hooks/error";
import layout from "themes/echoes/layout";
import article from "themes/echoes/article";
import about from "themes/echoes/about";

export default function Routes() {
  const args = {
    title: "我的页面",
    theme: "dark",
    nav: '<a href="h">a</a>'
  };

  return layout.render({
    children: article.render(args),
    args,
  });
}
