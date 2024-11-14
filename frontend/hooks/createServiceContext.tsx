// File path: /hooks/createServiceContext.tsx

import { createContext, useContext, ReactNode, FC } from 'react';

/**
 * 创建服务上下文的返回类型
 */
type ServiceContextReturn<N extends string,T> = {
  [K in `${N}Provider`]: FC<{ children: ReactNode }>;
} & {
  [K in `use${N}`]: () => T;
};

/**
 * 创建服务上下文和相关钩子的工厂函数
 * 
 * @param serviceName - 服务名称，用于错误信息
 * @param ServiceClass - 服务类（包含静态 getInstance 方法）
 */
export function createServiceContext<T, N extends string>(
  serviceName: N,
  getServiceInstance: () => T
): ServiceContextReturn<N,T> {
  const ServiceContext = createContext<T | undefined>(undefined);

  /**
   * 服务提供者组件
   */
  const Provider: FC<{ children: ReactNode }> = ({ children }) => (
    <ServiceContext.Provider value={getServiceInstance()}>
      {children}
    </ServiceContext.Provider>
  );

  /**
   * 自定义钩子，用于获取服务实例
   */
  const useService = (): T => {
    const context = useContext(ServiceContext);
    if (context === undefined) {
      throw new Error(`use${serviceName} must be used within a ${serviceName}Provider`);
    }
    return context;
  };

  return {
    [`${serviceName}Provider`]: Provider,
    [`use${serviceName}`]: useService,
  } as ServiceContextReturn<N,T>;
}