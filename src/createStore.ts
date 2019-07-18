import React, { createContext } from 'react'
import { createStoreHooks } from './createStoreHooks'
import { StoreInstance } from './StoreInstance'
import { Container, CreateStoreResult, Store } from './types'

export function createStore<S>(initialState: S): CreateStoreResult<S, {}>
export function createStore<S, A>(
  initialState: S,
  accessor: A
): CreateStoreResult<S, A>
export function createStore<S, A>(
  initialState: S,
  accessor?: A
): CreateStoreResult<S, A> {
  function createStoreInstance() {
    return new StoreInstance(initialState, accessor || ({} as A)) as Store<S, A>
  }

  const store = createStoreInstance()
  const context = createContext({ store })
  const hooks = createStoreHooks(context)

  const Container: Container<S> = ({ children, initialState }) => {
    return React.createElement(
      context.Provider,
      { value: { store: createStoreInstance() } },
      children
    )
  }

  return {
    ...hooks,
    store,
    Container,
  }
}
