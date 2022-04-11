import { useStore } from '@store/store'
import React from 'react'

export const LeftBtn = () => {
  const {
    state: { counter },
    dispatch,
  } = useStore()

  return (
    <button
      className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      onClick={() => dispatch({ counter: counter - 1 })}
    >
      -
    </button>
  )
}

export default LeftBtn
