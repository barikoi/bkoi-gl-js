# Next.js

Validated by `tests/framework/next13-app`, `next14-app`, `next15-app` (webpack builds) and `next16-app` (Turbopack default + `next build --webpack`). Full harness run 2026-10-05, Node 24 LTS, npm — all cells pass (receipts: `tests/framework/results.json`).

| Next.js | Bundler | Status | Notes |
|---|---|---|---|
| 13 | webpack | ✅ verified | **requires the minification workaround**; React 18 only |
| 14 | webpack | ✅ verified | React 18 only |
| 15 | webpack | ✅ verified | — |
| 16 | Turbopack + `--webpack` | ✅ verified (both bundlers) | — |

Not listed = untested.

## Prerequisites

- Node 24 LTS (the version the validation matrix runs on)
- A Barikoi API key
- TypeScript is the supported path (`.tsx`); the snippets below compile verbatim with `tsc --noEmit` and pass `next build` on Next 13.5 / 14.2 / 15.5 / 16.3

## Install

```sh
npm i bkoi-gl
```

## API key

Create `.env.local`:

```
NEXT_PUBLIC_BARIKOI_API_KEY=your_key
```

## Quickstart

Map components need `"use client"` — the map requires a real DOM and a worker, so it cannot render on the server. Scope the map to a route (e.g. `/guide`) rather than writing over your root `app/page.*`:

```tsx
// app/guide/map-view.tsx
'use client'

import { useEffect, useRef } from 'react'
import { Map } from 'bkoi-gl'
import 'bkoi-gl/style.css'

export default function MapView() {
  const ref = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<Map | null>(null)

  useEffect(() => {
    if (!ref.current) return   // null-container guard
    if (mapRef.current) return // re-entry guard: React StrictMode double-invokes
                               // effects in dev (2 mounts per render on Next 13/14/16
                               // defaults; Next 15 defaults differ — keep the guard
                               // unconditionally)
    mapRef.current = new Map({
      container: ref.current,
      accessToken: process.env.NEXT_PUBLIC_BARIKOI_API_KEY,
      center: [90.3938, 23.8216],
      zoom: 12,
    })
    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  return <div ref={ref} style={{ width: '100%', height: '100vh' }} />
}
```

```tsx
// app/guide/page.tsx
import MapView from './map-view'

export default function Page() {
  return <MapView />
}
```

Expected result: a street map of Dhaka fills the viewport and the console stays clean. No worker configuration is needed — the automatic worker URL registration works in all bundlers above.

> **Container sizing:** keep an explicit height (inline style or a dedicated CSS rule) on the map container. maplibre applies `.maplibregl-map { position: relative }` to it and can override positioning utility classes (e.g. Tailwind's `absolute inset-0`), collapsing the container to height 0 — blank map with zero console errors.

## Version-specific notes

### Next.js 13: disable production minification

Next 13.5 ships an older SWC minifier that **corrupts maplibre's symbol-placement code** in production builds. The map compiles fine but never paints — every frame throws:

```
Error: symbolInstance.crossTileID can't be 0
```

Development mode (`next dev`) is unaffected, which makes this easy to miss until the first production deploy. The SWC version bundled with Next 14+ is fixed; only Next 13 needs the workaround. Add to `next.config.mjs`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    if (!dev) config.optimization.minimizer = [];
    return config;
  },
};

export default nextConfig;
```

This ships an unminified production bundle — the trade-off for Next 13. Replacing the minifier with Terser is not an option: Terser cannot parse the JavaScript that Next 13's transform pipeline emits.

The published `bkoi-gl` bundle itself is lowered to ES2020 (no static class blocks or private fields) so older toolchains like Next 13 and Create React App 5 can process it, but the minifier bug is in Next's own pipeline and cannot be worked around from the library side.

### Next.js 13–14: React 18 required

Next 13 and 14 pair with React 18 (`"react": "^18.3.1"`). React 19 is only supported from Next 15 onward.

## Troubleshooting

- **Server-side rendering error** — the map needs a real DOM and a worker; add `'use client'` as the first line of the map component.
- **`Error: symbolInstance.crossTileID can't be 0` in production (Next 13 only)** — the SWC minifier corruption above; apply the minification workaround.
- **Blank map, no console errors** — the map container has no height (see the container-sizing note above).
