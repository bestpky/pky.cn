import { Dispatch } from 'react'

export interface IContextType<S, R> {
  state: S
  dispatch: Dispatch<R>
}

export type DispatchAction<T> = {
  type: T
  payload?: Record<string, unknown>
}

export interface IStore {
  counter: number
}
