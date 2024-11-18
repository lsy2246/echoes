export type SerializeType = null | number | string | boolean | { [key: string]: SerializeType } | Array<SerializeType>;
export interface Configuration {
    [key: string]: {
        title: string;
        description?: string;
        data: SerializeType;
    };
}

