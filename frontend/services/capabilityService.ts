// File path: services/capabilityService.ts

/**
 * CapabilityService 是一个单例类，用于管理能力的实例。
 * 提供注册、执行和移除能力的功能。
 */
import { CapabilityProps } from "contracts/capabilityContract";

export class CapabilityService {
    // 存储能力的映射，键为能力名称，值为能力源和能力属性的集合
    private capabilities: Map<string, Set<{ 
        source: string;
        capability: CapabilityProps<any>}>> = new Map();
    
    // CapabilityService 的唯一实例
    private static instance: CapabilityService;

    /** 
     * 私有构造函数，防止外部实例化 
     */
    private constructor() { }

    /**
     * 获取 CapabilityService 的唯一实例。
     * @returns {CapabilityService} 返回 CapabilityService 的唯一实例。
     */
    public static getInstance(): CapabilityService {
        if (!this.instance) {
            this.instance = new CapabilityService();
        }
        return this.instance;
    }

    /**
     * 注册能力
     * @param capabilityName 能力名称
     * @param source 能力来源
     * @param capability 能力属性
     */
    private register(capabilityName: string, source: string, capability: CapabilityProps<any>) {
        const handlers = this.capabilities.get(capabilityName) || new Set();
        handlers.add({ source, capability });
    }

    /**
     * 执行指定能力的方法
     * @param capabilityName 能力名称
     * @param args 方法参数
     * @returns {Set<T>} 执行结果的集合
     */
    private executeCapabilityMethod<T>(capabilityName: string, ...args: any[]): Set<T> {
        const results = new Set<T>();
        const handlers = this.capabilities.get(capabilityName);

        if (handlers) {
            handlers.forEach(({ capability }) => {
                const methodFunction = capability['execute'];
                if (methodFunction) {
                    methodFunction(...args)
                            .then((data) => results.add(data as T))
                            .catch((error) => console.error(`Error executing method ${capabilityName}:`, error));
                }
            });
        }
        return results;
    }

    /** 
     * 移除指定来源的能力 
     * @param source 能力来源
     */
    private removeCapability(source: string) {
        this.capabilities.forEach((capability_s, capabilityName) => {
            const newHandlers = new Set(
                Array.from(capability_s).filter(capability => capability.source !== source)
            );
            this.capabilities.set(capabilityName, newHandlers);
        });
    }

    /** 
     * 移除指定能力 
     * @param capability 能力名称
     */
    private removeCapabilitys(capability: string) {
        this.capabilities.delete(capability);
    }

    public validateCapability(capability: CapabilityProps<any>): boolean {
        // 验证能力是否符合基本要求
        if (!capability.name || !capability.execute) {
          return false;
        }
    
        // 验证能力名称格式
        const namePattern = /^[a-z][a-zA-Z0-9_]*$/;
        if (!namePattern.test(capability.name)) {
          return false;
        }
    
        return true;
      }


}
