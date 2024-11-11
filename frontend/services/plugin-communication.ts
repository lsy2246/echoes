// services/plugin-communication.ts
/**
 * 消息处理器类型定义
 */
type MessageHandler = (data: any) => void;

/**
 * 插件通信服务
 */
export class PluginMessenger {
  // 存储所有消息处理器
  private static handlers: Map<string, Set<MessageHandler>> = new Map();
  
  /**
   * 订阅消息通道
   * @param channel 通道名称
   * @param handler 消息处理函数
   * @returns 取消订阅函数
   */
  static subscribe(channel: string, handler: MessageHandler) {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set());
    }
    this.handlers.get(channel)?.add(handler);
    
    return () => {
      this.handlers.get(channel)?.delete(handler);
    };
  }
  
  /**
   * 发布消息到指定通道
   * @param channel 通道名称
   * @param data 消息数据
   */
  static publish(channel: string, data: any) {
    this.handlers.get(channel)?.forEach(handler => handler(data));
  }
}
