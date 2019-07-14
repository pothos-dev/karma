export function attachDevTools() {
  const ext = window && (window as any).__REDUX_DEVTOOLS_EXTENSION__
  const conn =
    ext &&
    ext.connect({
      // options: http://extension.remotedev.io/docs/API/Arguments.html
    })

  function initState(state: any) {
    if (!conn) return
    conn.init(state)
  }

  function dispatchAction(action: any, nextState: any) {
    if (!conn) return
    conn.send(action, nextState)
  }

  return { initState, dispatchAction }
}
