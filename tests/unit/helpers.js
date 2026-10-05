/** Shared unit-test helpers. */

/**
 * Wait for a mocked map's asynchronous 'load' lifecycle.
 * The maplibre mock fires 'style.load' + 'load' on a macrotask after
 * construction — this awaits that flag without polling executors.
 */
export function load(map, timeoutMs = 2000) {
  const start = Date.now()
  return (function check() {
    if (map._loadFired) return Promise.resolve()
    if (Date.now() - start > timeoutMs) return Promise.reject(new Error('mock map never loaded'))
    return new Promise(r => setTimeout(r, 10)).then(check)
  })()
}
