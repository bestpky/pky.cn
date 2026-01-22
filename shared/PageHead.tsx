import Head from 'next/head'
import React from 'react'

export default function PageHead({
  title = "Kevin' s Blog",
}: {
  title?: string
}) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="author" content="pky" />
      <meta
        name="description"
        content="A blog about front-end development, sharing knowledge and experience."
      />
      <meta name="keywords" content="HTML, CSS, JavaScript, Node.js, React" />
    </Head>
  )
}
