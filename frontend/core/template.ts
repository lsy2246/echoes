export interface Template {
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
