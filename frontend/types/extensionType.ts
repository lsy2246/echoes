/**
 * File path: types/extensionType.ts
 * 
 * 该文件定义了扩展类型接口 ExtensionType，包含可选的操作、组件和文本生成函数。
 * 
 * 接口属性说明：
 * - action: 可选的操作函数，接受任意参数并返回 void。
 * - component: 可选的组件函数，接受任意参数并返回一个 React 组件。
 * - text: 可选的文本生成函数，接受任意参数并返回一个字符串。
 */
export interface ExtensionType {
    /** 可选的操作函数，接受任意参数并返回 void */
    action?: (...args: any[]) => void;
    
    /** 可选的组件函数，接受任意参数并返回一个 React 组件 */
    component?: (...args: any[]) => React.FC;
    
    /** 可选的文本生成函数，接受任意参数并返回一个字符串 */
    text?: (...args: any[]) => string;
}
