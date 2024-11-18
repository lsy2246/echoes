export interface CapabilityProps<T> {
  name: string;
  description?: string;
  execute: (...args: any[]) => Promise<T>;
}
