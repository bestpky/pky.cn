import { prisma } from '../db'
import { PostgresPostDataSource } from './postgres-source'

/**
 * 获取文章数据源实例
 * 使用 PostgreSQL 数据库存储和查询文章数据
 */
export function getPostDataSource() {
  return new PostgresPostDataSource(prisma)
}

// 导出接口和类型
export * from './interface'
export { PostgresPostDataSource } from './postgres-source'
