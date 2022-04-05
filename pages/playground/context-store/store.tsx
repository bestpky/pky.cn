import React, {
  FC,
  ReducerAction,
  createContext,
  useContext,
  useReducer,
} from 'react'

import { DispatchAction, IContextType, IStore } from './types'

const store: IStore = {
  counter: 1,
}

export const Context = createContext<IContextType<IStore, ReducerAction<R>>>({
  state: store,
  dispatch: () => 1,
})

export enum ActionTypes {
  RESET = 'RESET',
}

type R = (
  state: IStore,
  partialState: Partial<IStore> | DispatchAction<ActionTypes>
) => IStore

const reducer: R = (state = store, action) => {
  if ('type' in action) {
    switch (action.type) {
      case ActionTypes.RESET:
        return { ...state, counter: 0 }
      default:
        return state
    }
  } else {
    return { ...state, ...action }
  }
}

export const Provider: FC = ({ children }) => {
  const [state, dispatch] = useReducer<R>(reducer, store)
  return (
    <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>
  )
}

export const useStore = () => useContext(Context)
