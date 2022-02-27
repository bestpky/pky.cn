import Image from 'next/image'
import React from 'react'

export default function AuthorHeader() {
  return (
    <header className="flex items-center author-header">
      <Image
        src="/avatar.jpg"
        alt="Avatar"
        className="rounded-full shadow"
        width={50}
        height={50}
      />
      <div className="ml-4">
        <p className="text-black dark:text-white text-2xl font-extrabold">
          羊羊子
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-sm"># 状态！</p>
      </div>
    </header>
  )
}
