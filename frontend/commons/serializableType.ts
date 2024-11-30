export type Serializable =
  | null
  | number
  | string
  | boolean
  | { [key: string]: Serializable }
  | Array<Serializable>;
export interface Configuration {
  [key: string]: {
    title: string;
    description?: string;
    data: Serializable;
  };
}

export interface PathDescription {
  path: string;
  name: string;
  description?: string;
}
