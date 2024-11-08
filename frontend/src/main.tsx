import * as React from "react";
import "./main.css"
import DynamicPage from "./page/page.tsx"
import ReactDOM from 'react-dom/client'
import {createContext} from "react";

export const serverAddressContext=createContext("localhost:8080")
// 动态路由
const RouterListener: React.FC = () => {
    let pathname = location.pathname.split("/");
    console.log(pathname)
    return (
        <serverAddressContext.Provider value={"localhost:8080"}>
            <DynamicPage pageName="home"/>
        </serverAddressContext.Provider>
    )
}


ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <RouterListener/>
    </React.StrictMode>
);