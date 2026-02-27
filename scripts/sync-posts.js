/**
 * 文章同步脚本
 * 支持全量同步和单个文章同步
 *
 * 使用方法：
 * 1. 全量同步：node scripts/sync-posts.js
 * 2. 同步单个文章：node scripts/sync-posts.js "文章slug"
 *
 * 示例：
 * node scripts/sync-posts.js
 * node scripts/sync-posts.js "【干货】滚动翻页通用方案（RxJS助力版）"
 */

require('dotenv').config()

const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const contentDirectory = path.join(process.cwd(), 'content')
const postDirectory = path.join(contentDirectory, 'post')

/**
 * 获取所有文章 slug 列表
 */
function getAllPostSlugs() {
  const items = fs.readdirSync(postDirectory)
  const slugs = []

  for (const item of items) {
    const itemPath = path.join(postDirectory, item)
    const stats = fs.statSync(itemPath)

    if (stats.isDirectory()) {
      // 目录形式：检查是否有 index.md
      const indexPath = path.join(itemPath, 'index.md')
      if (fs.existsSync(indexPath)) {
        slugs.push(item)
      }
    } else if (item.endsWith('.md')) {
      // 文件形式
      slugs.push(item.replace(/\.md$/, ''))
    }
  }

  return slugs
}

/**
 * 解析文章文件路径
 */
function resolvePostPath(slug) {
  // 先尝试目录形式
  let postPath = path.join(postDirectory, slug, 'index.md')
  if (fs.existsSync(postPath)) {
    return postPath
  }

  // 尝试文件形式
  postPath = path.join(postDirectory, `${slug}.md`)
  if (fs.existsSync(postPath)) {
    return postPath
  }

  return null
}

/**
 * 同步单个文章到数据库
 */
async function syncPost(slug) {
  try {
    const postPath = resolvePostPath(slug)

    if (!postPath) {
      throw new Error(`Post file not found: ${slug}`)
    }

    const fileContent = fs.readFileSync(postPath, 'utf-8')
    const { data, content } = matter(fileContent)

    // 验证必需字段
    if (!data.title) {
      throw new Error(`Missing required field "title" in ${slug}`)
    }
    if (!data.date) {
      throw new Error(`Missing required field "date" in ${slug}`)
    }

    // 优先使用 frontmatter 中的 slug，否则退回使用文件名
    const finalSlug = data.slug || slug

    // 插入或更新数据库
    const result = await prisma.post.upsert({
      where: { slug: finalSlug },
      update: {
        title: data.title,
        description: data.description || null,
        content,
        tags: data.tags || [],
        publishedAt: new Date(data.date),
        updatedAt: new Date(),
      },
      create: {
        slug: finalSlug,
        title: data.title,
        description: data.description || null,
        content,
        tags: data.tags || [],
        publishedAt: new Date(data.date),
      },
    })

    return { success: true, slug, action: result.id ? 'updated' : 'created' }
  } catch (error) {
    return { success: false, slug, error: error.message }
  }
}

/**
 * 全量同步所有文章
 */
async function syncAllPosts() {
  console.log('🚀 开始全量同步文章...\n')

  const slugs = getAllPostSlugs()
  console.log(`📝 发现 ${slugs.length} 篇文章\n`)

  const results = {
    success: 0,
    failed: 0,
    created: 0,
    updated: 0,
    details: [],
  }

  for (const slug of slugs) {
    process.stdout.write(`处理: ${slug}...`)

    const result = await syncPost(slug)
    results.details.push(result)

    if (result.success) {
      results.success++
      if (result.action === 'created') {
        results.created++
      } else {
        results.updated++
      }
      console.log(` ✓ ${result.action === 'created' ? '已创建' : '已更新'}`)
    } else {
      results.failed++
      console.log(` ✗ 失败`)
      console.log(`   错误: ${result.error}`)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ 同步完成！')
  console.log(
    `   成功: ${results.success} (创建: ${results.created}, 更新: ${results.updated})`
  )
  console.log(`   失败: ${results.failed}`)
  console.log('='.repeat(60))

  return results
}

/**
 * 同步单个指定的文章
 */
async function syncSinglePost(slug) {
  console.log(`🚀 开始同步文章: ${slug}\n`)

  const result = await syncPost(slug)

  console.log('\n' + '='.repeat(60))
  if (result.success) {
    console.log('✅ 同步成功！')
    console.log(`   文章: ${result.slug}`)
    console.log(`   操作: ${result.action === 'created' ? '已创建' : '已更新'}`)
  } else {
    console.log('❌ 同步失败！')
    console.log(`   文章: ${result.slug}`)
    console.log(`   错误: ${result.error}`)
  }
  console.log('='.repeat(60))

  return result
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2)

  try {
    if (args.length === 0) {
      // 无参数：全量同步
      await syncAllPosts()
    } else if (args[0] === '--help' || args[0] === '-h') {
      // 显示帮助
      console.log(`
文章同步脚本

用法：
  node scripts/sync-posts.js              全量同步所有文章
  node scripts/sync-posts.js <slug>       同步指定的单个文章
  node scripts/sync-posts.js --help       显示帮助信息

示例：
  node scripts/sync-posts.js
  node scripts/sync-posts.js "【干货】滚动翻页通用方案（RxJS助力版）"
  node scripts/sync-posts.js "Koa为什么是洋葱圈模型"

环境变量：
  DATABASE_URL                            数据库连接 URL
      `)
    } else {
      // 有参数：同步单个文章
      const slug = args[0]
      const result = await syncSinglePost(slug)

      if (!result.success) {
        process.exit(1)
      }
    }
  } catch (error) {
    console.error('\n❌ 同步过程出错:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// 执行主函数
main()
