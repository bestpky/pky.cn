/* eslint-disable @typescript-eslint/no-explicit-any */
import classNames from 'classnames'
import { GetStaticPaths, GetStaticProps } from 'next'
import { MDXRemote } from 'next-mdx-remote'
import Head from 'next/head'
import 'prism-themes/themes/prism-vsc-dark-plus.css'
import React from 'react'

import { getPostBySlug, getPostSlugList } from '@lib/api'

import { IPost } from '@interfaces/post'

import styles from './index.module.scss'

export default function PostItem({ post }: { post: IPost }) {
  return (
    <div className="mt-6 max-w-3xl mx-auto" style={{ flex: 'auto' }}>
      <Head>
        <title>{post.title}</title>
        <meta name="author" content="PKY" />
        <meta name="description" content={post.description} />
        <meta name="keywords" content={post.tags} />
      </Head>
      <header className="mb-8">
        <h1 className="text-3xl dark:text-white font-bold">{post.title}</h1>
        <span className="block text-sm text-gray-500 dark:text-gray-400 mt-1">
          {post.date}
        </span>
      </header>
      <article
        className={classNames(
          'prose dark:prose-light max-w-none',
          styles.article
        )}
      >
        <MDXRemote {...(post.content as any)} />
      </article>
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async function () {
  const posts = await getPostSlugList()

  return {
    paths: posts.map((post) => ({
      params: { slug: post },
    })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async function ({ params }) {
  const slug = params?.slug as string
  const post = await getPostBySlug(slug)
  return { props: { post } }
}
