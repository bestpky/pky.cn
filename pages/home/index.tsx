import classNames from 'classnames'
import { IPost } from 'interfaces/post'
import { GetStaticProps } from 'next'
import Link from 'next/link'
import React from 'react'

import AuthorHeader from '@shared/AuthorHeader'
import PageHead from '@shared/PageHead'

import { getPostList } from '@lib/api'

import styles from './index.module.scss'

interface IProps {
  posts: IPost[]
}

export default function Home({ posts }: IProps) {
  return (
    <>
      <PageHead />
      <div className={classNames('max-w-3xl', styles.home)}>
        <AuthorHeader />
        <div className="mt-10">
          {posts?.map((post) => (
            <article key={post.slug} className="mb-8 last:mb-0">
              <h2 className="text-2xl dark:text-gray-100 font-semibold ">
                <Link href={`/post/${post.slug}`}>
                  <a className="post-link">{post.title}</a>
                </Link>
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {post.date}
              </p>
            </article>
          ))}
        </div>
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async function () {
  const posts = getPostList()
  return {
    props: { posts },
  }
}
