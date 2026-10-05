# React

Validated by `tests/framework/react18-vite-app` (React 18.3 + Vite 7), `react19-vite-app` (React 19 + Vite 7) and `cra5-app` (react-scripts 5). Full harness run 2026-10-05, Node 24 LTS, npm — all cells pass (receipts: `tests/framework/results.json`).

| React | Toolchain | Status | Notes |
|---|---|---|---|
| 18.3 | Vite 7 | ✅ verified | — |
| 19 | Vite 7 | ✅ verified | — |
| 18 | CRA 5 (`react-scripts`) | ✅ verified | CRA is deprecated upstream — legacy apps only |

## Prerequisites

- Node 24 LTS (the version the validation matrix runs on)
- A Barikoi API key

## Install

```sh
npm i bkoi-gl
```

## API key

Create a `.env` in the project root:

```
VITE_BARIKOI_API_KEY=your_key
```

Restart the dev server after adding it. CRA reads a different variable name — see [Version-specific notes](#cra-5-react-scripts).

## Quickstart (React 18/19 + Vite)

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

Expected result: a street map of Dhaka fills the viewport and the console stays clean. No worker configuration is needed anywhere — the library registers its self-contained worker automatically.

> **Container sizing:** keep the explicit inline height (or a dedicated CSS rule) on the map container. maplibre applies `.maplibregl-map { position: relative }` to it and can override positioning utility classes (e.g. Tailwind's `absolute inset-0`), collapsing the container to height 0 — blank map with zero console errors.

## Version-specific notes

### CRA 5 (`react-scripts`)

Scaffold with `npx create-react-app@5.1.0 my-app` — pinning `@5.0.1` prints a "behind the latest release" refusal and **exits 0**, so scripted setups silently dead-end.

- **API key:** `process.env.REACT_APP_BARIKOI_API_KEY` (create `.env` with `REACT_APP_BARIKOI_API_KEY=your_key`, restart the dev server). The component is otherwise identical to the quickstart — swap the `accessToken` line:
  ```jsx
  accessToken: process.env.REACT_APP_BARIKOI_API_KEY,
  ```
- **Builds:** no special flags — `npm run build` and `CI=true npm run build` both pass with bkoi-gl 4.0.0. webpack 5 resolves the engine's worker `new URL(..., import.meta.url)` silently, and react-scripts excludes source-map warnings from CI promotion.
- **Monorepos:** build with `DISABLE_ESLINT_PLUGIN=true` (react-scripts' lint crashes on conflicting parent `@typescript-eslint` installs).

#### Testing (Jest)

CRA's jest only scans `src/` (a root-level `__mocks__/` is silently ignored) and cannot resolve the package's `exports` subpaths, so a component importing bkoi-gl needs three pieces — the real failure is jsdom's missing `TextDecoder`, not babel syntax:

1. `src/__mocks__/bkoi-gl.js`: `export const Map = class {}`
2. `src/__mocks__/bkoi-gl-style.js`: `module.exports = {}`
3. in `package.json`:
   ```json
   "jest": {
     "moduleNameMapper": { "^bkoi-gl/style.css$": "<rootDir>/src/__mocks__/bkoi-gl-style.js" }
   }
   ```
   and at the top of the test file: `jest.mock('bkoi-gl')`

## Troubleshooting

- **Blank map, no console errors** — the map container has no height. Give the div an explicit height (see the container-sizing note above).
- **Page scrolls 16px on both axes** — the default body margin. Replacing `main.jsx` drops the Vite template's `index.css` import; reset it in `index.html` (`body { margin: 0 }`).
- **`Target container is not a DOM element`** — the Vite React scaffold mounts into `<div id="root">`, not `#app`. Mount to the id your `index.html` actually has.
