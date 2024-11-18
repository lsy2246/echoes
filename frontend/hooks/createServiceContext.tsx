import { createContext, useContext, ReactNode, FC } from 'react';

type ServiceContextReturn<N extends string,T> = {
  [K in `${N}Provider`]: FC<{ children: ReactNode }>;
} & {
  [K in `use${N}`]: () => T;
};

export function createServiceContext<T, N extends string>(
  serviceName: N,
  getServiceInstance: () => T
): ServiceContextReturn<N,T> {
  const ServiceContext = createContext<T | undefined>(undefined);

  const Provider: FC<{ children: ReactNode }> = ({ children }) => (
    <ServiceContext.Provider value={getServiceInstance()}>
      {children}
    </ServiceContext.Provider>
  );

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