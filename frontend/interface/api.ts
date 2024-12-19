// 定义数据库表的字段接口

export interface User {
  username: string;
  avatarUrl?: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Page {
  id: number;
  title: string;
  content: string;
  isEditor: boolean;
  draftContent?: string;
  template?: string;
  status: string;
}

export interface Post {
  id: number;
  authorName: string;
  coverImage?: string;
  title?: string;
  content: string;
  status: string;
  isEditor: boolean;
  draftContent?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Resource {
  id: number;
  authorId: string;
  name: string;
  sizeBytes: number;
  storagePath: string;
  mimeType: string;
  category?: string;
  description?: string;
  createdAt: Date;
}

export interface CustomField {
  targetType: "post" | "page";
  targetId: number;
  fieldType: string;
  fieldKey: string;
  fieldValue?: string;
}

export interface Taxonomy {
  name: string;
  slug: string;
  type: "tag" | "category";
  parentName?: string;
}

export interface PostTaxonomy {
  postId: number;
  taxonomyName: string;
}

// 用于前端展示的扩展接口
export interface PostDisplay extends Post {
  taxonomies?: {
    categories: Taxonomy[];
    tags: Taxonomy[];
  };
  customFields?: CustomField[];
}

export interface PageDisplay extends Page {
  customFields?: CustomField[];
}
