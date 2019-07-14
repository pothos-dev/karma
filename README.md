# @bearbytes/karma

This is a library in the Redux family of state management solutions, to be used with React (or React Native).

### It has these design goals:

- Support Typescript out of the box
- Require as little boilerplate code as possible
- Allow for more flexibility in how to structure code
- React Hooks integrated

### Differences to Redux:

- No actions (or action creators, or action type constants)
- No reducers
- No immutable state updates, instead we can mutate state directly (thanks to [immer](https://github.com/immerjs/immer))

### Should you use it?

Probably not. For anything serious, stick to one of the more established solutions.  
I'm dogfooding it for my own projects, but there are probably still bugs to be fixed.

# Getting started

Install the dependency:  
`npm i @bearbytes/karma`

Create some type definitions for your state:

```typescript
interface ITodo {
  id: string
  title: string
  isDone?: boolean
}

interface IAppState {
  todos: ITodo[]
}
```

Create an initial state object:

```typescript
const initialAppState: IAppState = { todos: [] }
```

Call `createStore`, which also creates typesafe hooks and a Context container. You often don't need everything that function returns, just take out what you need.

```typescript
import { createStore } from '@bearbytes/karma'

export const {
  // Global store instance. Most apps only need this one.
  store,

  // If you want to have multiple store instances in the app,
  // this Container can be put into the React component hierarchy
  // to create a new store context below it.
  Container,

  // Get access to the store from the nearest Container,
  // or the global instance if no Container is used.
  useStore,

  // This is the most important hook, which extracts data from the
  // store and updates the component whenever that data changes.
  useStoreState,

  // This hook can be used to update state in the component.
  // We could also call store.update() instead, but this can save a
  // few keystrokes.
  useStoreUpdate,
} = createStore(initialState)

// In most cases, only a single store is needed:
export { store, useStoreState }
```

# Reading from Store

Get the current value saved in the store:

```typescript
const appState = store.get()
```

Subscribe to the current and all future values, using [rxjs](https://github.com/ReactiveX/rxjs):

```typescript
store.subscribe((s) => {
  console.log('AppState is now:', s)
})
```

Register a listener to a specific piece of data in a React component:

```tsx
function TodoListComponent() {
  // this component will be re-rendered when `todos` are updated,
  // but not when a different part of the store is updated
  const todos = useStoreState((s) => s.todos)

  return (
    <>
      {todos.map((todo) => (
        <TodoListItem key={todo.id} todo={todo} />
      ))}
    </>
  )
}
```

# Writing to Store

Instead of dispatching an action at one place and having code to update the state in another place, we can simply inline this code:

```typescript
store.update((s) => {
  s.todos.push({ id: 123, title: 'Stop writing stupid Todo apps' })
})
```

You are only allowed to mutate state within the `update` method of the store. Subscribers to the store will only see the changes done after the function exits. Karma uses [immer](https://github.com/immerjs/immer) under the hood, so the same rules apply (state must consist of plain objects and arrays without circular references).

If you use multiple stores in your application, make sure to get the correct one from a React component:

```tsx
function AddTodoButton(props: { todo: ITodo }) {
  const store = useStore()

  function onPress() {
    store.update((s) => {
      s.todos.push(props.todo)
    })
  }

  return <button onPress={onPress}>Add</button>
}
```

A better way might be to use the `useStoreUpdate` hook, which will automatically wrap the update function in `useCallback`, which can avoid re-renders when passed down to child components:

```tsx
function AddTodoButton(props: { todo: ITodo }) {
  const onPress = useStoreUpdate(
    (s) => {
      s.todos.push(props.todo)
    },
    [props.todo] // DependencyList passed to useCallback
  )

  return <button onPress={onPress}>Add</button>
}
```

# Redux DevTools

Should work out of the box. Note that since our "actions" are just anonymous lambda functions, all of them will be called "Anonymous Action".
