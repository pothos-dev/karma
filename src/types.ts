import { Draft } from 'immer'
import { DependencyList } from 'react'
import { Observable } from 'rxjs'

export interface CreateStoreResult<State> extends Hooks<State> {
  store: Store<State>
  Container: Container<State>
}

export interface Store<State> extends Observable<State> {
  get(): State
  update(updater: Updater<State>): State
  update(actionName: string, updater: Updater<State>): State
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

  useStoreUpdate(updater: Updater<State>, deps?: DependencyList): () => State
  useStoreUpdate(
    actionName: string,
    updater: Updater<State>,
    deps?: DependencyList
  ): () => State

  useStoreUpdate(): (updater: Updater<State>) => State
  useStoreUpdate(): (actionName: string, updater: Updater<State>) => State
}

export type Updater<State> = (state: Draft<State>) => void | State

export type Selector<State, Result> = (state: State) => Result
