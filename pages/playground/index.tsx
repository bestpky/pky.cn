import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'

import AuthorHeader from '@shared/AuthorHeader'
import PageHead from '@shared/PageHead'

const menus = [
  {
    pathname: 'drawer',
    title: 'Drawer with transition',
  },
  {
    pathname: 'like',
    title: 'Twitter Like animation',
  },
  {
    pathname: 'like-pro',
    title: 'Like animation',
  },
  {
    pathname: 'pub-sub',
    title: 'Publish/subscription Demo',
  },
  {
    pathname: 'test-set-state',
    title: 'Test setState sync or async',
  },
  {
    pathname: 'responsive-layout-js',
    title: 'Responsive layout by JS',
  },
  {
    pathname: 'responsive-layout-grid',
    title: 'Responsive layout by grid layout',
  },
  {
    pathname: 'scroll-to-bottom',
    title: 'Scroll pagination',
  },
  {
    pathname: 'carousel',
    title: 'Carousel',
  },
]

export default function Playground() {
  const { route } = useRouter()
  return (
    <>
      <PageHead title={'playground'} />
      <div className="max-w-3xl container">
        <AuthorHeader />
        <h5
          className="text-m dark:text-gray-100 font-semibold "
          style={{ margin: '20px 0' }}
        >
          这里收录了一些之前的Demo，看似没什么营养。
        </h5>
        <nav>
          {menus.map(({ pathname, title }) => {
            return (
              <article key={pathname} className="mb-8 last:mb-0">
                <h2 className="text-2xl dark:text-gray-100 font-semibold ">
                  <Link href={`${route}/${pathname}`}>
                    <a className="post-link">{title}</a>
                  </Link>
                </h2>
              </article>
            )
          })}
        </nav>
      </div>
    </>
  )
}
