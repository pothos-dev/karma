import { Draft } from 'immer'
import { Observable } from 'rxjs'

export interface CreateStoreResult<State, Accessor>
  extends Hooks<State, Accessor> {
  store: Store<State, Accessor>
  Container: Container<State>
}

export interface Store<State, Accessor>
  extends Observable<EnrichedState<State, Accessor>> {
  get(): EnrichedState<State, Accessor>
  update(updater: Updater<State>): void
}

export type Context<State, Accessor> = React.Context<{
  store: Store<State, Accessor>
}>

export type Container<State> = React.ComponentType<{
  initialState: State
  children?: any
}>

export interface Hooks<State, Accessor> {
  useStore(): Store<State, Accessor>
  useStoreState<R>(selector: Selector<State, Accessor, R>): R
  useStoreUpdate(updater: Updater<State>): () => void
  useStoreUpdate(): (updater: Updater<State>) => void
}

export type Updater<State> = (state: Draft<State>) => void | State
export type Selector<State, Accessor, Result> = (
  state: EnrichedState<State, Accessor>
) => Result

export type EnrichedState<State, Accessor> = State &
  StateAccessor<State, Accessor>

export type StateAccessor<State, Accessor> = {
  [key in keyof Accessor]: StateAccessorFunc<State, Accessor[key]>
}

export type StateAccessorFunc<State, Func> = Func extends (
  state: State,
  ...args: infer Args
) => infer Result
  ? (...args: Args) => Result
  : never
