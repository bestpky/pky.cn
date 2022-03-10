import { AppProps } from 'next/app'
import Link from 'next/link'
import React from 'react'
import 'tailwindcss/tailwind.css'

import '@styles/globals.css'

const navList = [
  {
    title: 'Home',
    href: '/',
  },
  {
    title: 'Playground',
    href: '/playground',
  },
]

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <nav className="nav flex items-center justify-center py-8 space-x-6">
        {navList.map((nav) => (
          <Link key={nav.href} href={nav.href}>
            <a className={'nav-item px-0.5 py-0 dark:text-white'}>
              {nav.title}
            </a>
          </Link>
        ))}
      </nav>
      <Component {...pageProps} />
      <footer className="max-w-5xl mx-auto px-4 md:flex items-center justify-between mt-14 border-t dark:border-gray-700 py-8">
        <p className="text-sm text-gray-600 dark:text-gray-400 flex flex-col md:flex-row">
          <span>
            Copyright &copy; {new Date().getFullYear()}{' '}
            <Link href="/">
              <a>pky.cn</a>
            </Link>
          </span>
        </p>
      </footer>
    </>
  )
}
