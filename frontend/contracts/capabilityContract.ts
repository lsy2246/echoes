// src/contracts/CapabilityContract.ts
/**
 * 能力契约接口
 */
export interface CapabilityProps<T> {
  // 能力名称
  name: string;
  // 能力描述
  description?: string;
  // 能力执行函数
  execute: (...args: any[]) => Promise<T>;
}
  