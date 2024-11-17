import { CapabilityProps } from "contracts/capabilityContract";

export interface TemplateContract {
    // 模板名称
    name: string;
    // 模板描述
    description?: string;
    // 模板配置
    config: {
      // 模板布局
      layout?: string;
      // 模板样式
      styles?: string[];
      // 模板脚本
      scripts?: string[];
    };
    /** 声明需要使用的能力，没有实际作用 */
    capabilities?: Set<CapabilityProps<void>>;
    
    // 渲染函数
    render: (props: any) => React.ReactNode;
  }