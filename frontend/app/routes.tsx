import ErrorPage from "hooks/error";
import layout from "themes/echoes/layout";

export default function Routes() {
  return layout.element({
    children: <></>,
    args: {
      title: "我的页面",
      theme: "dark",
    },
  });
}
