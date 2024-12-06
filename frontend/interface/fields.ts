// 定义数据库表的字段接口

export interface User {
  username: string; // 用户名
  avatarUrl?: string; // 头像URL
  email: string; // 邮箱
  profileIcon?: string; // 个人图标
  passwordHash: string; // 密码哈希
  role: string; // 角色
  createdAt: Date; // 创建时间
  updatedAt: Date; // 更新时间
  lastLoginAt?: Date; // 上次登录时间
}

export interface Page {
  id: number; // 自增整数
  title: string; // 标题
  metaKeywords: string; // 元关键词
  metaDescription: string; // 元描述
  content: string; // 内容
  template?: string; // 模板
  customFields?: string; // 自定义字段
  status: string; // 状态
}

export interface Post {
  id: number; // 自增整数
  authorName: string; // 作者名称
  coverImage?: string; // 封面图片
  title?: string; // 标题
  metaKeywords: string; // 元关键词
  metaDescription: string; // 元描述
  content: string; // 内容
  status: string; // 状态
  isEditor: boolean; // 是否为编辑器
  draftContent?: string; // 草稿内容
  createdAt: Date; // 创建时间
  updatedAt: Date; // 更新时间
  publishedAt?: Date; // 发布时间
}

export interface Tag {
  name: string; // 标签名
  icon?: string; // 图标
}

export interface PostTag {
  postId: number; // 文章ID
  tagId: string; // 标签ID
}

export interface Category {
  name: string; // 分类名
  parentId?: string; // 父分类ID
}

export interface PostCategory {
  postId: number; // 文章ID
  categoryId: string; // 分类ID
}

export interface Resource {
  id: number; // 自增整数
  authorId: string; // 作者ID
  name: string; // 名称
  sizeBytes: number; // 大小（字节）
  storagePath: string; // 存储路径
  fileType: string; // 文件类型
  category?: string; // 分类
  description?: string; // 描述
  createdAt: Date; // 创建时间
}

export interface Setting {
  name: string; // 设置名
  data?: string; // 数据
}

// 添加一个新的接口用于前端展示
export interface PostDisplay extends Post {
  categories?: Category[];
  tags?: Tag[];
}