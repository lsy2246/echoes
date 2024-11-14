// File path: /d:/data/echoes/frontend/hooks/extensionService.tsx
/**
 * 扩展服务上下文提供者和自定义 Hook。
 * 
 * 该文件包含扩展服务的上下文提供者组件和用于访问该上下文的自定义 Hook。
 */

import { createContext, useContext, ReactNode } from 'react';
import { ExtensionService } from 'service/extensionService';

// 创建扩展服务上下文
const ExtensionContext = createContext<ExtensionService | undefined>(undefined);

/**
 * 扩展提供者组件，用于提供扩展服务的上下文。
 *
 * @param children - 要渲染的子组件。
 */
export function ExtensionProvider({ children }: { children: ReactNode }) {
    const extensionService = ExtensionService.getInstance(); // 获取扩展服务实例

    return (
        <ExtensionContext.Provider value={extensionService}>
            {children}
        </ExtensionContext.Provider>
    )
}

/**
 * 自定义 Hook，用于访问扩展服务上下文。
 * 
 * @returns {ExtensionService} - 返回扩展服务实例。
 * @throws {Error} - 如果在未被 ExtensionProvider 包裹的组件中调用，将抛出错误。
 */
export function useExtention(): ExtensionService {
    const context = useContext(ExtensionContext); // 获取扩展服务上下文
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider'); // 抛出错误
    }
    return context; // 返回扩展服务实例
}