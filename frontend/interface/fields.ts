// 定义数据库表的字段接口

export interface User {
  username: string;
  avatarUrl?: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
}

export interface Page {
  id: number;
  title: string;
  content: string;
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
  publishedAt?: Date;
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

export interface Setting {
  name: string;
  data?: string;
}

export interface Metadata {
  id: number;
  targetType: 'post' | 'page';
  targetId: number;
  metaKey: string;
  metaValue?: string;
}

export interface CustomField {
  id: number;
  targetType: 'post' | 'page';
  targetId: number;
  fieldKey: string;
  fieldValue?: string;
  fieldType: string;
}

export interface Taxonomy {
  name: string;
  slug: string;
  type: 'tag' | 'category';
  parentId?: string;
}

export interface PostTaxonomy {
  postId: number;
  taxonomyId: string;
}

// 用于前端展示的扩展接口
export interface PostDisplay extends Post {
  taxonomies?: {
    categories: Taxonomy[];
    tags: Taxonomy[];
  };
  metadata?: Metadata[];
  customFields?: CustomField[];
}

export interface PageDisplay extends Page {
  metadata?: Metadata[];
  customFields?: CustomField[];
}