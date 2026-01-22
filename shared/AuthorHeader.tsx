import Image from 'next/image'
import React from 'react'

export default function AuthorHeader() {
  return (
    <header className="flex items-center author-header">
      <Image
        src="/avatar.jpeg"
        alt="Avatar"
        className="rounded-full shadow"
        width={50}
        height={50}
      />
      <div className="ml-4">
        <p className="text-black dark:text-white text-2xl font-extrabold">
          Kevin
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          # Keep Learning
        </p>
      </div>
    </header>
  )
}
