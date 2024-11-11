// services/performance-monitor.ts
/**
 * 性能指标接口
 */
interface PerformanceMetrics {
    loadTime: number;    // 加载时间（毫秒）
    memoryUsage: number; // 内存使用量（bytes）
    errors: string[];    // 错误信息列表
  }
  
  /**
   * 性能监控服务
   */
  export class PerformanceMonitor {
    private static metrics: Map<string, PerformanceMetrics> = new Map();
    
    /**
     * 开始监控性能
     * @param id 监控对象的唯一标识符
     */
    static startMonitoring(id: string) {
      const startTime = performance.now();
      const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      return {
        // 结束监控并记录指标
        end: () => {
          const loadTime = performance.now() - startTime;
          const memoryUsage = ((performance as any).memory?.usedJSHeapSize || 0) - startMemory;
          
          this.metrics.set(id, {
            loadTime,
            memoryUsage,
            errors: []
          });
        },
        
        // 记录错误信息
        error: (err: string) => {
          const metrics = this.metrics.get(id) || { loadTime: 0, memoryUsage: 0, errors: [] };
          metrics.errors.push(err);
          this.metrics.set(id, metrics);
        }
      };
    }
    
    /**
     * 获取性能指标
     * @param id 监控对象的唯一标识符
     */
    static getMetrics(id: string): PerformanceMetrics | undefined {
      return this.metrics.get(id);
    }
  }