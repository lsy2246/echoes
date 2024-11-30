import { useState } from "react";
import { ErrorResponse } from "core/http";

import ReactDOMServer from "react-dom/server";
import { useHttp } from "hooks/servicesProvider";

const MyComponent = () => {
  return <div>Hello, World!</div>;
};

export default function Routes() {
  let http=useHttp();


  return (<div>

  </div>);
}
