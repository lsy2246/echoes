export interface Post {
  id: number; // 自增整数
  authorName: string; // 作者名称
  coverImage?: string; // 封面图片
  title?: string; // 标题
  metaKeywords: string; // 元关键词
  metaDescription: string; // 元描述
  content: string; // Markdown 格式的内容
  status: string; // 状态
  isEditor: boolean; // 是否为编辑器
  draftContent?: string; // 草稿内容
  createdAt: Date; // 创建时间
  updatedAt: Date; // 更新时间
  publishedAt?: Date; // 发布时间
}
