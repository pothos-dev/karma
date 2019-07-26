import React, { createContext } from 'react'
import { createStoreHooks } from './createStoreHooks'
import { StoreInstance } from './StoreInstance'
import { Container, CreateStoreResult, Store } from './types'

export function createStore<S>(initialState: S): CreateStoreResult<S> {
  const store = new StoreInstance<S>(initialState) as Store<S>
  const context = createContext({ store })
  const hooks = createStoreHooks(context)

  const Container: Container<S> = ({ children, initialState }) => {
    return React.createElement(
      context.Provider,
      {
        value: {
          store: new StoreInstance<S>(initialState),
        },
      },
      children
    )
  }

  return {
    ...hooks,
    store,
    Container,
  }
}
