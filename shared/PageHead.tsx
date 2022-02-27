import Head from 'next/head'
import React from 'react'

export default function PageHead() {
  return (
    <Head>
      <title>羊羊子的博客</title>
      <meta name="author" content="pky" />
      <meta
        name="description"
        content="羊羊子的个人站点，关于前端、JavaScript 等"
      />
      <meta name="keywords" content="HTML, CSS, JavaScript, Node.js, React" />
    </Head>
  )
}
