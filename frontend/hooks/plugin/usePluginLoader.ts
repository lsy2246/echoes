// hooks/usePluginLoader.ts
import { useState, useEffect } from 'react';
import { DependencyChecker } from '../../services/dependency-checker';
import { PerformanceMonitor } from '../../services/performance-monitor';
import { CacheManager } from '../../services/cache-manager';

/**
 * 插件加载Hook
 * @param pluginId 插件ID
 * @returns 加载状态和错误信息
 */
export function usePluginLoader(pluginId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadPlugin = async () => {
      try {
        // 检查缓存
        const cached = CacheManager.get(`plugin:${pluginId}`);
        if (cached) {
          return cached;
        }
        
        // 开始性能监控
        const monitor = PerformanceMonitor.startMonitoring(pluginId);
        
        // 获取插件配置
        const plugin = await fetch(`/api/admin/plugins/${pluginId}`).then(r => r.json());
        
        // 检查依赖
        if (plugin.dependencies) {
          const dependenciesOk = await DependencyChecker.checkDependencies(plugin.dependencies);
          if (!dependenciesOk) {
            throw new Error('依赖检查失败');
          }
        }
        
        // 加载插件
        const component = await import(/* @vite-ignore */plugin.entry);
        
        // 缓存结果
        CacheManager.set(`plugin:${pluginId}`, component);
        
        // 结束监控
        monitor.end();
        
        return component;
      } catch (err) {
        setError(err instanceof Error ? err.message : '插件加载失败');
        throw err;
      } finally {
        setLoading(false);
      }
    };
    
    loadPlugin();
  }, [pluginId]);
  
  return { loading, error };
}