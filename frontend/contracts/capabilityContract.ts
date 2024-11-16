// src/contracts/CapabilityContract.ts
/**
 * 能力契约接口
 */
export interface CapabilityProps {
    // 能力名称
    name: string;
    // 能力描述
    description?: string;
    // 能力版本
    version: string;
    // 能力参数定义
    parameters?: {
      type: 'object';
      properties: Record<string, {
        type: string;
        description?: string;
        required?: boolean;
      }>;
    };
    // 能力返回值定义
    returns?: {
      type: string;
      description?: string;
    };
    // 能力执行函数
    execute: (...args: any[]) => Promise<any>;
  }
  