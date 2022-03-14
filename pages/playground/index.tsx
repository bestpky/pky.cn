import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'

import AuthorHeader from '@shared/AuthorHeader'
import PageHead from '@shared/PageHead'

import { menus } from './menu-config'

export default function Playground() {
  const { route } = useRouter()
  return (
    <>
      <PageHead />
      <div className="max-w-3xl container">
        <AuthorHeader />
        <div className="mt-10"></div>
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
