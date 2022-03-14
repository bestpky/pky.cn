import { useState } from 'react'

import Carousel1 from './demo1'

// import Carousel2 from './demo2'

const stockList = [
  {
    id: 1,
    title: '上证指数',
    info: '3500 | -1%',
  },
  {
    id: 2,
    title: '沪深300',
    info: '300 | -1%',
  },
  {
    id: 3,
    title: '创业50',
    info: '140000 | -2%',
  },
]
export type List = typeof stockList

export default function Wrapper() {
  const [isRun, setIsRun] = useState(false)
  const [list1, setList1] = useState(stockList)
  // const [list2, setList2] = useState(stockList)
  function updateList1(newList: typeof stockList) {
    setList1(newList)
  }
  // function updateList2(newList: typeof stockList) {
  //     setList2(newList)
  // }
  return (
    <div className="max-w-3xl container flex-center">
      <Carousel1 isRun={isRun} list={list1} updateList={updateList1} />
      {/* <Carousel2 isRun={isRun} list={list2} updateList={updateList2} /> */}
      <button onClick={() => setIsRun(!isRun)}>
        {isRun ? '暂停' : '启动'}
      </button>
    </div>
  )
}
