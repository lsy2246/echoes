import { ThemeConfig } from "types/themeType";

export const themeConfig: ThemeConfig = {
    name: 'default',
    displayName: '默认主题',
    version: '1.0.0',
    description: '一个简约风格的博客主题',
    author: 'lsy',
    entry: './index.tsx',
    templates: new Map([
        ['page', {
            path: './templates/page',
            name: '文章列表模板',
            description: '博客首页展示模板'
          }],
    ]),
    
    settingsSchema: undefined,
    routes: {
        post: "",
        tag: "",
        category: "",
        page: ""
    }
}