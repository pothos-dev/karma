import React, { createContext } from 'react'
import { createStoreHooks } from './createStoreHooks'
import { StoreInstance } from './StoreInstance'
import { Container, CreateStoreResult, Store } from './types'

export function createStore<S, A>(
  initialState: S,
  accessor: A
): CreateStoreResult<S, A> {
  const store = new StoreInstance(initialState, accessor) as Store<S, A>
  const context = createContext({ store })
  const hooks = createStoreHooks(context)

  const Container: Container<S> = ({ children, initialState }) => {
    return React.createElement(
      context.Provider,
      { value: { store: new StoreInstance(initialState, accessor) } },
      children
    )
  }

  return {
    ...hooks,
    store,
    Container,
  }
}
