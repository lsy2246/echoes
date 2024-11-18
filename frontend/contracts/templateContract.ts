export interface TemplateContract {
    name: string;
    description?: string;
    config: {
      layout?: string;
      styles?: string[];
      scripts?: string[];
    };  
    loader: () => Promise<void>;
    element: () => React.ReactNode;
}