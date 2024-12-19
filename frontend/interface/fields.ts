export enum FieldType {
  meta = "meta",
  data = "data",
}

export interface Field {
  field_key: string;
  field_type: FieldType;
  field_value: any;
}

export function FindField(fields: Array<Field>, field_key: string, field_type: FieldType) {
  return fields.find(field => field.field_key === field_key && field.field_type === field_type);
}

export function deserializeFields(rawFields: any[]): Field[] {
  return rawFields.map(field => {
    let parsedValue = field.field_value;
    
    // 如果是字符串，尝试解析
    if (typeof field.field_value === 'string') {
      try {
        // 先尝试解析为 JSON
        parsedValue = JSON.parse(field.field_value);
      } catch {
        // 如果解析失败，保持原始字符串
        parsedValue = field.field_value;
      }
    }
    
    return {
      field_key: field.field_key,
      field_type: field.field_type as FieldType,
      field_value: parsedValue
    };
  });
}


