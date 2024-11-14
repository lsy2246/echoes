// File path: /hooks/createServiceContext.tsx

import { createContext, ReactNode, useContext } from "react";

/**
 * 创建一个服务上下文，用于提供和使用服务实例。
 * 
 * @param name - 服务的名称，用于错误提示。
 * @param getInstance - 一个函数，用于获取服务实例。
 * @returns 返回一个包含 Provider 组件和 useService 钩子的对象。
 */
interface ServiceContextResult<T> {
  Provider: React.FC<{ children: ReactNode }>; // 提供服务实例的组件
  useService: () => T; // 获取服务实例的钩子
}

/**
 * 创建服务上下文的函数。
 * 
 * @param name - 服务的名称，用于错误提示。
 * @param getInstance - 获取服务实例的函数。
 * @returns 包含 Provider 组件和 useService 钩子的对象。
 */
export function createServiceContext<T>(
  name: string,
  getInstance: () => T
): ServiceContextResult<T> {
  // 创建一个上下文，初始值为 undefined。
  const ServiceContext = createContext<T | undefined>(undefined);

  // Provider 组件，用于提供服务实例给子组件
  const Provider = ({ children }: { children: ReactNode }) => {
    const service = getInstance();

    return (
      <ServiceContext.Provider value={service}>
        {children}
      </ServiceContext.Provider>
    );
  };

  // 获取服务实例的钩子
  const useService = (): T => {
    const context = useContext(ServiceContext);
    if (context === undefined) {
      throw new Error(`use${name} must be used within a ${name}Provider`);
    }
    return context;
  };

  return {
    Provider,
    useService,
  };
}
