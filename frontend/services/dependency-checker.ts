// services/dependency-checker.ts

import { Dependency } from "../types/common";

/**
 * 依赖检查器服务
 */
export class DependencyChecker {
    /**
     * 检查依赖项是否满足要求
     * @param dependencies 需要检查的依赖项列表
     * @returns 是否所有依赖都满足要求
     */
    static async checkDependencies(dependencies: Dependency[]): Promise<boolean> {
      for (const dep of dependencies) {
        const response = await fetch(`/api/dependencies/check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dep)
        });
        
        if (!response.ok) {
          console.error(`依赖检查失败: ${dep.id}`);
          return false;
        }
      }
      return true;
    }
  }