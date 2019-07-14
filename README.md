# @bearbytes/karma

- [Getting started](#getting-started)
- [Reading from Store](#reading-from-store)
- [Writing to Store](#writing-to-store)
- [Writing to Store asynchronously](#writing-to-store-asynchronously)
- [Redux Devtools Integration](#redux-devtools-integration)

This is a library in the [Redux](https://github.com/reduxjs/redux) family of state management solutions, featuring a different set of tradeoffs. It is meant to be used with React (or React Native).

### It has these design goals:

- Support Typescript out of the box
- Have React Hooks integrated
- Require as little boilerplate code as possible
- Allow for more flexibility in how to structure code

### Differences to Redux:

- No actions (or action creators, or action type constants)
- No reducers
- No immutable state updates, instead we can mutate state directly (thanks to [immer](https://github.com/immerjs/immer))

### Pros & Cons

- **Pro:** It's dead simple. The API surface is minimal, it's just `get`, `subscribe`, `update`
- **Pro:** No need to think about how to apply updates to deeply nested state in an immutable way
- **Pro:** To implement a state update, you only need to write code in one place (with Redux, code for a new action is usually split up in 2 or 3 different places)
- **Con:** Since the library does not enforce a specific structure, code can get messy in larger projects, unless you are disciplined enough to create your own structure
- **Con:** No named actions make it hard to debug and monitor where state updates are coming from
- **Con:** Incompatible with Redux middlewares (but compatible with Redux DevTools)

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

const {
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

  // This hook can be used in a React component to create a callback to
  // update state. It has some advantages to calling store.update() directly.
  useStoreUpdate,
} = createStore(initialState)

// In most cases, only a single store is needed:
export { store, useStoreState, useStoreUpdate }
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

Instead of dispatching an action at one place and having code to update the state in another place, we simply inline this code:

```typescript
store.update((s) => {
  s.todos.push({ id: 123, title: 'Stop writing stupid Todo apps' })
})
```

You are only allowed to mutate state within the `update` method of the store. Subscribers to the store will only see the updated state after the function exits. Karma uses [immer](https://github.com/immerjs/immer) under the hood, so the same rules apply (state must consist of plain objects and arrays without circular references).

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
    // Updates done to the store when onPress is called
    (s) => {
      s.todos.push(props.todo)
    },
    // DependencyList passed to useCallback
    //all variables used in the update function should be put here
    [props.todo]
  )

  return <button onPress={onPress}>Add</button>
}
```

# Writing to Store asynchronously

Dealing with asynchronicity is often an issue with Redux-like solutions. Usually, you have to think about whether to use Thunks or Sagas or something completely different.

With Karma, there is just the `update` function, which may never be async. Don't overthink it, just update the state synchronously whenever something relevant happens:

```typescript
async function downloadMultipleFiles(urls: string[]) {
  // Set the loading state
  store.update((s) => {
    s.downloadInProgress = true
  })

  // Download files in parallel
  await Promise.all(urls.map(downloadSingleFile))

  // All downloading done
  store.update((s) => {
    s.downloadInProgress = false
  })
}

async function downloadSingleFile(url: string) {
  const data = await fetch(url)
  await storeFileOnDisk(url, data)

  // Update the state after each file done
  store.update((s) => {
    s.filesDownloaded.push(url)
  })
}
```

# Redux DevTools integration

Should work out of the box. Note that since our "actions" are just anonymous lambda functions, all of them will be called "Anonymous Action".
