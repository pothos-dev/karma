import immer from 'immer'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { BehaviorSubject } from 'rxjs'
import {
  Container,
  Context,
  CreateStoreResult,
  EnrichedState,
  Hooks,
  Selector,
  Store,
  Updater,
} from './types'

export * from './types'

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

class StoreInstance<S, A> extends BehaviorSubject<EnrichedState<S, A>>
  implements Store<S, A> {
  accessor: A
  rawState: S

  constructor(initialState: S, accessor: A) {
    super(StoreInstance.enrich(initialState, accessor))
    this.rawState = initialState
    this.accessor = accessor
  }

  get() {
    return this.value
  }

  update(updater: Updater<S>) {
    this.rawState = immer(this.rawState, updater) as S
    this.next(StoreInstance.enrich(this.rawState, this.accessor))
  }

  static enrich<S, A>(state: S, accessor: A): EnrichedState<S, A> {
    const rawAccessor: any = {}
    for (const key of Object.keys(accessor)) {
      rawAccessor[key] = (...args: any[]) =>
        (accessor as any)[key](state, ...args)
    }
    return {
      ...state,
      ...rawAccessor,
    }
  }
}

function createStoreHooks<S, A>(context: Context<S, A>): Hooks<S, A> {
  function useStore() {
    const { store } = useContext(context)
    return store
  }

  function useStoreState<R>(selector: Selector<S, A, R>): R {
    const store = useStore()

    const [state, setState] = useState(selector(store.get()))

    useEffect(() => {
      const subscription = store.subscribe((storeState) => {
        const selectedState = selector(storeState)
        if (selectedState == state) return
        setState(selectedState)
      })
      return () => subscription.unsubscribe()
    }, [])

    return state
  }

  function useStoreUpdate1(updater: Updater<S>): () => void {
    const store = useStore()
    return () => {
      store.update(updater)
    }
  }
  function useStoreUpdate2(): (updater: Updater<S>) => void {
    const store = useStore()
    return (updater: Updater<S>) => {
      store.update(updater)
    }
  }
  function useStoreUpdate(arg1?: any): any {
    if (arg1) return useStoreUpdate1(arg1)
    else return useStoreUpdate2()
  }

  return {
    useStore,
    useStoreState,
    useStoreUpdate,
  }
}
