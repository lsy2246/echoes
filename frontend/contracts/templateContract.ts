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
      // 模板区域定义
      zones?: Record<string, {
        name: string;
        description?: string;
        allowedComponents?: string[];
      }>;
    };
    // 模板数据契约
    dataContract?: {
      // 必需的数据字段
      required: string[];
      // 可选的数据字段
      optional?: string[];
      // 数据验证规则
      validation?: Record<string, {
        type: string;
        rules: any[];
      }>;
    };
    // 渲染函数
    render: (props: any) => React.ReactNode;
  }