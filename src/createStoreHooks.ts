import {
  DependencyList,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { Context, Hooks, Selector, Updater } from './types'

export function createStoreHooks<S>(context: Context<S>): Hooks<S> {
  function useStore() {
    const { store } = useContext(context)
    return store
  }

  function useStoreState<R>(selector: Selector<S, R>): R {
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

  function useStoreUpdate1(
    arg1: Updater<S> | string,
    arg2?: DependencyList | Updater<S>,
    arg3?: DependencyList
  ): () => void {
    const actionName = typeof arg1 == 'string' ? arg1 : undefined
    const updater: any = actionName ? arg2 : arg1
    const deps: any = actionName ? arg3 : arg2

    const store = useStore()
    return useCallback(() => {
      if (actionName) {
        store.update(actionName, updater)
      } else {
        store.update(updater)
      }
    }, deps)
  }

  function useStoreUpdate2(): any {
    const store = useStore()
    return (arg1: string | Updater<S>, arg2?: Updater<S>) => {
      const actionName = typeof arg1 == 'string' ? arg1 : undefined
      const updater: any = actionName ? arg2 : arg1
      if (actionName) {
        store.update(actionName, updater)
      } else {
        store.update(updater)
      }
    }
  }

  function useStoreUpdate(
    arg1?: Updater<S> | string,
    arg2?: DependencyList | Updater<S>,
    arg3?: DependencyList
  ): any {
    if (arg1) return useStoreUpdate1(arg1, arg2, arg3)
    else return useStoreUpdate2()
  }

  return {
    useStore,
    useStoreState,
    useStoreUpdate,
  }
}
