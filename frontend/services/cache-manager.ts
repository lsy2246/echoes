// services/cache-manager.ts
/**
 * 缓存管理服务
 */
export class CacheManager {
    private static cache = new Map<string, any>();
    private static ttl = new Map<string, number>();
    
    /**
     * 设置缓存
     * @param key 缓存键
     * @param value 缓存值
     * @param expiresIn 过期时间（毫秒）
     */
    static set(key: string, value: any, expiresIn: number = 3600000) {
      this.cache.set(key, value);
      this.ttl.set(key, Date.now() + expiresIn);
    }
    
    /**
     * 获取缓存
     * @param key 缓存键
     * @returns 缓存值或null（如果已过期或不存在）
     */
    static get(key: string): any {
      if (this.ttl.has(key) && Date.now() > (this.ttl.get(key) || 0)) {
        this.cache.delete(key);
        this.ttl.delete(key);
        return null;
      }
      return this.cache.get(key);
    }
    
    /**
     * 清除所有缓存
     */
    static clear() {
      this.cache.clear();
      this.ttl.clear();
    }
  }