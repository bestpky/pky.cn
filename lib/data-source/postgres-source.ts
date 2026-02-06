import { PrismaClient } from '@prisma/client'
import dayjs from 'dayjs'
import { serialize } from 'next-mdx-remote/serialize'
import externalLinks from 'remark-external-links'
import prism from 'remark-prism'

import { IPostDataSource, Post, PostSummary } from './interface'

/**
 * 基于 PostgreSQL 的文章数据源
 * 使用 Prisma ORM 访问数据库
 */
export class PostgresPostDataSource implements IPostDataSource {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async getPostSlugList(): Promise<string[]> {
    const posts = await this.prisma.post.findMany({
      select: { slug: true },
      orderBy: { publishedAt: 'desc' },
    })
    return posts.map((p) => p.slug)
  }

  async getPostSummaryBySlug(slug: string): Promise<PostSummary> {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      select: {
        slug: true,
        title: true,
        publishedAt: true,
      },
    })

    if (!post) {
      throw new Error(`Post not found: ${slug}`)
    }

    return {
      slug: post.slug,
      title: post.title,
      date: dayjs(post.publishedAt).format('YYYY-MM-DD'),
    }
  }

  async getPostBySlug(slug: string): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { slug },
    })

    if (!post) {
      throw new Error(`Post not found: ${slug}`)
    }

    return {
      title: post.title,
      date: dayjs(post.publishedAt).format('YYYY-MM-DD'),
      description: post.description || '',
      tags: post.tags || [],
      content: await serialize(post.content, {
        mdxOptions: { remarkPlugins: [prism, externalLinks] },
      }),
    }
  }
}
