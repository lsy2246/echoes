// File path: /hooks/themeContext.tsx

import { createContext, useContext, ReactNode } from 'react';
import { ThemeService } from 'service/themeService';

const ThemeContext = createContext<ThemeService | undefined>(undefined);

/**
 * ThemeProvider 组件用于提供主题上下文给其子组件。
 * 它使用 ThemeService 的单例实例来管理主题相关的状态和功能。
 *
 * @param children - 要渲染的子组件。
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const themeService = ThemeService.getInstance();
  
  return (
    <ThemeContext.Provider value={themeService}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useTheme 钩子用于访问主题上下文。
 * 
 * @returns ThemeService - 返回主题服务的实例。
 * @throws Error - 如果在 ThemeProvider 之外使用，将抛出错误。
 */
export function useTheme(): ThemeService {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}