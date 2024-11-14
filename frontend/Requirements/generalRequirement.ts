// File path: /d:/data/echoes/frontend/Requirements/generalRequirement.ts
/**
 * 表示可以序列化的类型。
 * 可以是以下类型之一：
 * - null
 * - number
 * - string
 * - boolean
 * - 对象，键为字符串，值为可序列化类型
 * - 数组，元素为可序列化类型
 */
export type SerializeType = null | number | string | boolean | { [key: string]: SerializeType } | Array<SerializeType>;
