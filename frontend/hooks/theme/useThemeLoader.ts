// hooks/theme/useThemeLoader.ts
import { useState, useEffect } from 'react';
import { ThemeConfig } from '../../types/theme';
import { DependencyChecker } from '../../services/dependency-checker';
import { PerformanceMonitor } from '../../services/performance-monitor';
import { CacheManager } from '../../services/cache-manager';

/**
 * 主题加载Hook
 */
export function useThemeLoader(themeName: string) {
  const [theme, setTheme] = useState<ThemeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTheme = async () => {
      const monitor = PerformanceMonitor.startMonitoring(`theme:${themeName}`);
      
      try {
        // 1. 检查缓存
        const cached = CacheManager.get(`theme:${themeName}`);
        if (cached) {
          setTheme(cached);
          setLoading(false);
          return;
        }

        // 2. 获取主题配置
        const response = await fetch(`/api/themes/${themeName}`);
        const themeConfig: ThemeConfig = await response.json();

        // 3. 检查依赖
        if (themeConfig.dependencies) {
          const dependenciesOk = await DependencyChecker.checkDependencies(
            themeConfig.dependencies
          );
          if (!dependenciesOk) {
            throw new Error('主题依赖检查失败');
          }
        }

        // 4. 加载主题样式
        if (themeConfig.globalStyles) {
          const styleElement = document.createElement('style');
          styleElement.innerHTML = themeConfig.globalStyles;
          document.head.appendChild(styleElement);
        }

        // 5. 缓存主题配置
        CacheManager.set(`theme:${themeName}`, themeConfig, 3600000); // 1小时缓存
        
        setTheme(themeConfig);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载主题失败');
      } finally {
        setLoading(false);
        monitor.end();
      }
    };

    loadTheme();
  }, [themeName]);

  return { theme, loading, error };
}