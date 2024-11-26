export function createServiceHook<T>(name: string, getInstance: () => T) {
  const Context = createContext<T | null>(null);
  
  const Provider: FC<PropsWithChildren> = ({ children }) => (
    <Context.Provider value={getInstance()}>
      {children}
    </Context.Provider>
  );

  const useService = () => {
    const service = useContext(Context);
    if (!service) {
      throw new Error(`use${name} must be used within ${name}Provider`);
    }
    return service;
  };

  return [Provider, useService] as const;
} 