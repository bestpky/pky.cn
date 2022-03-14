import { useEffect, useState } from 'react'

import useBottom from './use-bottom'

export interface Query {
  page: number
  size: number
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(undefined)
    }, ms)
  })
}

async function fetchList({ size, page }: Query) {
  await wait(300)
  return Array.from(Array(size), (_, index) => index + (page - 1) * size + 1)
}

export const useScrollPagination = <W extends Element>(size = 10) => {
  const [query, setQuery] = useState({ page: 0, size })
  const [list, setList] = useState<number[]>([])

  useEffect(() => {
    fetchList(query).then((newList: number[]) => {
      setList((oldList) => [...oldList, ...newList])
    })
  }, [query])

  const containerRef = useBottom<W>(() => {
    const newQuery = {
      ...query,
      page: query.page + 1,
    }
    setQuery(newQuery)
  })

  return { containerRef, list }
}
