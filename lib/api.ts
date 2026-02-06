import dayjs from 'dayjs'

import { getPostDataSource } from './data-source'

// 获取数据源实例
const dataSource = getPostDataSource()

/**
 * 获取所有文章的 slug 列表
 */
export async function getPostSlugList() {
  return dataSource.getPostSlugList()
}

/**
 * 根据 slug 获取文章摘要信息
 */
export async function getPostSummaryBySlug(slug: string) {
  return dataSource.getPostSummaryBySlug(slug)
}

/**
 * 获取文章列表（包含摘要信息），按日期降序排列
 */
export async function getPostList() {
  const slugs = await getPostSlugList()
  const posts = await Promise.all(
    slugs.map((slug) => getPostSummaryBySlug(slug))
  )
  return posts.sort((a, b) => (dayjs(a.date).isBefore(dayjs(b.date)) ? 1 : -1))
}

/**
 * 根据 slug 获取完整的文章信息
 */
export async function getPostBySlug(slug: string) {
  return dataSource.getPostBySlug(slug)
}
