// components/theme/themeManager.tsx
import React, { useEffect } from 'react';
import { useThemeLoader } from './useThemeLoader';

interface ThemeManagerProps {
  themeName: string;
  children: React.ReactNode;
}

export const ThemeManager: React.FC<ThemeManagerProps> = ({
  themeName,
  children
}) => {
  const { theme, loading, error } = useThemeLoader(themeName);

  if (loading) {
    return <div>加载主题中...</div>;
  }

  if (error) {
    return <div>主题加载失败: {error}</div>;
  }

  if (!theme) {
    return <div>主题未找到</div>;
  }

  return (
    <div className={`theme-${themeName}`}>
      {children}
    </div>
  );
};
