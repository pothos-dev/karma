import immer from 'immer'
import { BehaviorSubject } from 'rxjs'
import { attachDevTools } from './attachDevTools'
import { EnrichedState, Store, Updater } from './types'

export class StoreInstance<S, A> extends BehaviorSubject<EnrichedState<S, A>>
  implements Store<S, A> {
  accessor?: A
  rawState: S
  devTools = attachDevTools()

  constructor(initialState: S, accessor?: A) {
    super(StoreInstance.enrich(initialState, accessor))
    this.rawState = initialState
    this.accessor = accessor
    this.devTools.initState(initialState)
  }

  get() {
    return this.value
  }

  update(updater: Updater<S>) {
    this.rawState = immer(this.rawState, updater) as S
    this.devTools.dispatchAction({ type: 'Anonymous Action' }, this.rawState)
    this.next(StoreInstance.enrich(this.rawState, this.accessor))
  }

  static enrich<S, A>(state: S, accessor?: A): EnrichedState<S, A> {
    if (!accessor) return state as EnrichedState<S, A>

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
