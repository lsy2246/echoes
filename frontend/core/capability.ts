export interface CapabilityProps<T> {
  name: string;
  description?: string;
  execute: (...args: any[]) => Promise<T>;
}


export class CapabilityService {
  private capabilities: Map<
    string,
    Set<{
      source: string;
      capability: CapabilityProps<any>;
    }>
  > = new Map();

  private static instance: CapabilityService;

  private constructor() {}

  public static getInstance(): CapabilityService {
    if (!this.instance) {
      this.instance = new CapabilityService();
    }
    return this.instance;
  }

  private register(
    capabilityName: string,
    source: string,
    capability: CapabilityProps<any>,
  ) {
    const handlers = this.capabilities.get(capabilityName) || new Set();
    handlers.add({ source, capability });
  }

  private executeCapabilityMethod<T>(
    capabilityName: string,
    ...args: any[]
  ): Set<T> {
    const results = new Set<T>();
    const handlers = this.capabilities.get(capabilityName);

    if (handlers) {
      handlers.forEach(({ capability }) => {
        const methodFunction = capability["execute"];
        if (methodFunction) {
          methodFunction(...args)
            .then((data) => results.add(data as T))
            .catch((error) =>
              console.error(`Error executing method ${capabilityName}:`, error),
            );
        }
      });
    }
    return results;
  }

  private removeCapability(source: string) {
    this.capabilities.forEach((capability_s, capabilityName) => {
      const newHandlers = new Set(
        Array.from(capability_s).filter(
          (capability) => capability.source !== source,
        ),
      );
      this.capabilities.set(capabilityName, newHandlers);
    });
  }

  private removeCapabilitys(capability: string) {
    this.capabilities.delete(capability);
  }

  public validateCapability(capability: CapabilityProps<any>): boolean {
    if (!capability.name || !capability.execute) {
      return false;
    }

    const namePattern = /^[a-z][a-zA-Z0-9_]*$/;
    if (!namePattern.test(capability.name)) {
      return false;
    }

    return true;
  }
}
