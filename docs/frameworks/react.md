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

createRoot(document.getElementById('root')).render(<App />)
```

The template's `index.html` mounts into `<div id="root">` (the Vite React scaffold does not use `#app` — mounting to the wrong id throws `Target container is not a DOM element`). Replacing `main.jsx` also drops the template's `index.css` import, so reset the default body margin in `index.html` (`body { margin: 0 }`), or the 100vw/100vh map overflows by 16px on both axes.

Create `.env` with `VITE_BARIKOI_API_KEY=your_key` (restart the dev server after adding it).

## CRA 5 (react-scripts)

Scaffold with `npx create-react-app@5.1.0 my-app` — pinning `@5.0.1` prints a "behind the latest release" refusal and **exits 0**, so scripted setups silently dead-end.

Same component; the key comes from `process.env.REACT_APP_BARIKOI_API_KEY` (create `.env` with `REACT_APP_BARIKOI_API_KEY=your_key` and restart the dev server).

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

- No special build flags: `npm run build` and `CI=true npm run build` both pass with bkoi-gl 4.0.0 — webpack 5 resolves the engine's worker `new URL(..., import.meta.url)` silently, and react-scripts excludes source-map warnings from CI promotion.
- In monorepos, build with `DISABLE_ESLINT_PLUGIN=true` (react-scripts' lint crashes on conflicting parent `@typescript-eslint` installs).
- Jest/CRA tests: CRA's jest only scans `src/` (a root-level `__mocks__/` is silently ignored) and cannot resolve the package's `exports` subpaths, so a component importing bkoi-gl needs three pieces — the real failure is jsdom's missing `TextDecoder`, not babel syntax:
  1. `src/__mocks__/bkoi-gl.js`: `export const Map = class {}`
  2. `src/__mocks__/bkoi-gl-style.js`: `module.exports = {}`
  3. in `package.json`:
     ```json
     "jest": {
       "moduleNameMapper": { "^bkoi-gl/style.css$": "<rootDir>/src/__mocks__/bkoi-gl-style.js" }
     }
     ```
     and at the top of the test file: `jest.mock('bkoi-gl')`
