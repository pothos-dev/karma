import { Draft } from 'immer'
import { DependencyList } from 'react'
import { Observable } from 'rxjs'

export interface CreateStoreResult<State> extends Hooks<State> {
  store: Store<State>
  Container: Container<State>
}

export interface Store<State> extends Observable<State> {
  get(): State
  update(updater: Updater<State>): void
  update(actionName: string, updater: Updater<State>): void
}

export type Context<State> = React.Context<{
  store: Store<State>
}>

export type Container<State> = React.ComponentType<{
  initialState: State
  children?: any
}>

export interface Hooks<State> {
  useStore(): Store<State>
  useStoreState<R>(selector: Selector<State, R>): R

  useStoreUpdate(updater: Updater<State>, deps?: DependencyList): () => void
  useStoreUpdate(
    actionName: string,
    updater: Updater<State>,
    deps?: DependencyList
  ): () => void

  useStoreUpdate(): (updater: Updater<State>) => void
  useStoreUpdate(): (actionName: string, updater: Updater<State>) => void
}

export type Updater<State> = (state: Draft<State>) => void | State

export type Selector<State, Result> = (state: State) => Result
