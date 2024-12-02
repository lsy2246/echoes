import ErrorPage from 'hooks/error';
import Layout from 'themes/echoes/layout';

export default function Routes() {
  return Layout.render({
    children: <></>,
    args: {
      title: "我的页面",
      theme: "dark"
    }
  });
}
