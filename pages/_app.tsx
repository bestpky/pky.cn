import 'tailwindcss/tailwind.css'
import '../styles/globals.css'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { AppProps } from 'next/app'

const navList = [
  {
    title: '首页',
    href: '/',
  },
  {
    title: '关于',
    href: '/about',
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
      <footer className="md:flex items-center justify-between mt-14 border-t dark:border-gray-700 py-8">
        <p className="text-sm text-gray-600 dark:text-gray-400 flex flex-col md:flex-row">
          <span>
            Copyright &copy; {new Date().getFullYear()}{' '}
            <Link href="/">
              <a>pky</a>
            </Link>
          </span>
          <span className="hidden md:block mx-1">·</span>
        </p>
        <a
          className="inline-block text-black dark:text-white mt-2 md:mt-0"
          href="https://vercel.com"
          target="_blank"
          rel="noreferrer noopener"
          title="Powered by Vercel"
        >
          <Image
            src="/powered-by-vercel.svg"
            alt="Powered by Vercel"
            className="h-8"
            width={167}
            height={32}
          />
        </a>
      </footer>
    </>
  )
}
