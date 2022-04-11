import { ActionTypes, Provider, useStore } from '@store/store'
import React from 'react'

import { LeftBtn } from './leftBtn'
import { RightBtn } from './rightBtn'

const Page = () => {
  const {
    state: { counter },
    dispatch,
  } = useStore()
  return (
    <div
      className="max-w-3xl container flex-center"
      style={{ flexDirection: 'column' }}
    >
      <div className="mb-10" style={{ fontSize: 30 }}>
        {counter}
      </div>
      <div className="flex">
        <LeftBtn />
        <RightBtn />
        <button
          onClick={() => dispatch({ type: ActionTypes.RESET })}
          className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          RESET
        </button>
      </div>
    </div>
  )
}

const App = () => (
  <Provider>
    <Page />
  </Provider>
)

export default App
