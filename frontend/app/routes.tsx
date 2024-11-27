import { useState } from "react";

import ReactDOMServer from "react-dom/server";
import { useLocation } from "react-router-dom";

const MyComponent = () => {
  return <div>Hello, World!</div>;
};

export default function Routes() {
  const htmlString = ReactDOMServer.renderToString(<MyComponent />);

  return <div>安装重构</div>;
}
