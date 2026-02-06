import { MDXRemoteSerializeResult } from 'next-mdx-remote'

/**
 * 文章摘要信息
 */
export interface PostSummary {
  title: string
  date: string
  slug: string
}

/**
 * 完整的文章信息
 */
export interface Post {
  title: string
  date: string
  description: string
  tags: string[]
  content: MDXRemoteSerializeResult
}

/**
 * 文章数据源接口
 * 定义了获取文章数据的标准方法
 */
export interface IPostDataSource {
  /**
   * 获取所有文章的 slug 列表
   */
  getPostSlugList(): Promise<string[]>

  /**
   * 根据 slug 获取文章摘要信息
   */
  getPostSummaryBySlug(slug: string): Promise<PostSummary>

  /**
   * 根据 slug 获取完整的文章信息
   */
  getPostBySlug(slug: string): Promise<Post>
}
