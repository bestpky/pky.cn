import { DiscussionEmbed } from 'disqus-react'
import PageHead from '../shared/PageHead'
import AuthorHeader from '../shared/AuthorHeader'
import React from 'react'

export default function About() {
  return (
    <>
      <PageHead />
      <AuthorHeader />
      <div className="prose dark:prose-light max-w-none mt-10 mb-8">
        <p>羊羊子 的个人站点。</p>
      </div>
      <DiscussionEmbed
        shortname="pky"
        config={{
          title: '关于',
          language: 'zh',
        }}
      />
    </>
  )
}
