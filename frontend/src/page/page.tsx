// page/page.tsx
import React from "react";
const THEMEPATH= "../../themes"
import {serverAddressContext} from "../main.tsx";
// 动态获取当前主题
const getCurrentTheme = async (): Promise<string> => {
    return new Promise<string>((resolve) => {
        resolve("default");
    })
}

// 获取页面
const loadPage = (theme: string, pageName: string) => {
    return import(/* @vite-ignore */`${THEMEPATH}/${theme}/${pageName}/page`).catch(() => import((/* @vite-ignore */`${THEMEPATH}/default/page/page`)))
}

// 动态加载页面
const DynamicPage: React.FC<{ pageName: string }> = ({pageName}) => {
    const serverAddress = React.useContext(serverAddressContext)
    console.log(serverAddress)
    const [Page, setPage] = React.useState<React.ComponentType | null>(null);
    const [theme, setTheme] = React.useState<string>("");
    React.useEffect(() => {
        getCurrentTheme().then((theme) => {
            setTheme(theme);
            loadPage(theme, pageName).then((module) => {
                setPage(() => module.default);
            });
        })
    })
    if(!Page){
        return <div>loading...</div>;
    }

    return <Page/>;
}
export default DynamicPage;