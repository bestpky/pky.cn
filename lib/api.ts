import dayjs from 'dayjs'
import fs from 'fs'
import matter from 'gray-matter'
import { serialize } from 'next-mdx-remote/serialize'
import path from 'path'
import externalLinks from 'remark-external-links'
import prism from 'remark-prism'

const contentDirectory = path.join(process.cwd(), 'content')
const postDirectory = path.join(contentDirectory, 'post')

export function getPostSlugList() {
  return fs
    .readdirSync(postDirectory)
    .map((item) => {
      const itemPath = path.join(postDirectory, item)
      const isDirectory = fs.statSync(itemPath).isDirectory()

      if (isDirectory) {
        return item
      } else if (item.endsWith('.md')) {
        // 去掉 .md 后缀作为 slug
        return item.replace(/\.md$/, '')
      }
      return null
    })
    .filter(Boolean)
}

export function getPostSummaryBySlug(slug: string) {
  // 先尝试目录形式
  let postPath = path.join(postDirectory, slug, 'index.md')

  // 如果目录形式不存在，尝试直接的 .md 文件
  if (!fs.existsSync(postPath)) {
    postPath = path.join(postDirectory, `${slug}.md`)
  }

  const fileContent = fs.readFileSync(postPath, 'utf-8')
  const { data } = matter(fileContent)
  return {
    title: data.title,
    date: dayjs(data.date).format('YYYY-MM-DD'),
    slug,
  }
}

export function getPostList() {
  const slugs = getPostSlugList()
  return slugs
    .map((slug) => getPostSummaryBySlug(slug))
    .sort((a, b) => (dayjs(a.date).isBefore(dayjs(b.date)) ? 1 : -1))
}

export async function getPostBySlug(slug: string) {
  // 先尝试目录形式
  let postPath = path.join(postDirectory, slug, 'index.md')

  // 如果目录形式不存在，尝试直接的 .md 文件
  if (!fs.existsSync(postPath)) {
    postPath = path.join(postDirectory, `${slug}.md`)
  }

  const fileContent = fs.readFileSync(postPath, 'utf-8')
  const { data, content } = matter(fileContent)
  return {
    title: data.title,
    date: dayjs(data.date).format('YYYY-MM-DD'),
    description: data.description,
    tags: data.tags,
    content: await serialize(content, {
      mdxOptions: { remarkPlugins: [prism, externalLinks] },
    }),
  }
}
