import immer from 'immer'
import { BehaviorSubject } from 'rxjs'
import { attachDevTools } from './attachDevTools'
import { Store, Updater } from './types'

export class StoreInstance<S> extends BehaviorSubject<S> implements Store<S> {
  devTools = attachDevTools()

  constructor(initialState: S) {
    super(initialState)
    this.devTools.initState(initialState)
  }

  get() {
    return this.value
  }

  update(updater: Updater<S>): void
  update(actionName: string, updater: Updater<S>): void
  update(arg1: any, arg2?: any): void {
    const updater = arg2 || arg1
    const actionName = arg2 ? arg1 : 'Anonymous Action'
    const prevState = this.value
    const nextState = immer(prevState, updater) as S
    this.devTools.dispatchAction({ type: actionName }, nextState)
    this.next(nextState)
  }
}
