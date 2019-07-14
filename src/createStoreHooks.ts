import { useContext, useEffect, useState } from 'react'
import { Context, Hooks, Selector, Updater } from './types'

export function createStoreHooks<S, A>(context: Context<S, A>): Hooks<S, A> {
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
