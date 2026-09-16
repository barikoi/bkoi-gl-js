# React

Validated by `tests/framework/react18-vite-app`, `react19-vite-app` (React 18.3 / 19 + Vite 7) and `tests/framework/cra5-app` (react-scripts 5).

No worker configuration is needed — the library registers its self-contained worker automatically.

## React 18 / 19 + Vite

```jsx
// src/main.jsx
import { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { Map } from 'bkoi-gl'
import 'bkoi-gl/style.css'

function App() {
  const ref = useRef(null)

  useEffect(() => {
    const map = new Map({
      container: ref.current,
      accessToken: import.meta.env.VITE_BARIKOI_API_KEY,
      center: [90.3938, 23.8216],
      zoom: 12,
    })

    return () => map.remove()
  }, [])

  return <div ref={ref} style={{ width: '100vw', height: '100vh' }} />
}

createRoot(document.getElementById('app')).render(<App />)
```

## CRA 5 (react-scripts)

Same component; the key comes from `process.env.REACT_APP_BARIKOI_API_KEY`.

```jsx
import { useEffect, useRef } from 'react'
import { Map } from 'bkoi-gl'
import 'bkoi-gl/style.css'

export default function App() {
  const ref = useRef(null)

  useEffect(() => {
    const map = new Map({
      container: ref.current,
      accessToken: process.env.REACT_APP_BARIKOI_API_KEY,
      center: [90.3938, 23.8216],
      zoom: 12,
    })
    return () => map.remove()
  }, [])

  return <div ref={ref} style={{ width: '100vw', height: '100vh' }} />
}
```

CRA notes (validated by the cra5 cell):

- Build without `CI=true` — react-scripts promotes webpack's "Critical dependency" warning (from the engine's `new URL(..., import.meta.url)` worker resolution) to a build error when `CI` is set.
- In monorepos, build with `DISABLE_ESLINT_PLUGIN=true` (react-scripts' lint crashes on conflicting parent `@typescript-eslint` installs).
- Jest/CRA tests: mock `bkoi-gl` — CRA's 2022 babel preset cannot parse the engine's ES2022 syntax (static class blocks).
