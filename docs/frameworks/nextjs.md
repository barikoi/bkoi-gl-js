# Next.js

Validated by `tests/framework/next13-app` (Next 13), `next14-app` (Next 14), `next15-app` (Next 15 — all webpack builds) and `next16-app` (Next 16 — both the Turbopack default and `next build --webpack`).

| Next.js | Bundler | Status |
|---|---|---|
| 13 | webpack | ✅ verified — **requires the minification workaround below** |
| 14 | webpack | ✅ verified, no config needed |
| 15 | webpack | ✅ verified, no config needed |
| 16 | Turbopack + `--webpack` | ✅ verified, no config needed (both bundlers) |

Map components need `"use client"` — the map requires a real DOM and a worker, so it cannot render on the server. No worker configuration is needed; the automatic worker URL registration works in all bundlers.

TypeScript is the supported path (`.tsx`); the snippets below compile verbatim with `tsc --noEmit` and pass `next build` on Next 13.5 / 14.2 / 15.5 / 16.3. Scope the map to a route (e.g. `/guide`) rather than writing over your root `app/page.*`:

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

  return (
    // Container sizing: give the div an explicit height (inline style or a
    // dedicated CSS rule). maplibre applies `.maplibregl-map { position:
    // relative }` to the container and can override positioning utility
    // classes like Tailwind's `absolute inset-0` — which collapses the
    // container to height 0 (blank map, zero console errors).
    <div ref={ref} style={{ width: '100%', height: '100vh' }} />
  )
}
```

```tsx
// app/guide/page.tsx
import MapView from './map-view'

export default function Page() {
  return <MapView />
}
```

Set the key via `.env.local`:

```
NEXT_PUBLIC_BARIKOI_API_KEY=your_key
```

Next 16 works with the default Turbopack build and with `next build --webpack` — both verified.

## ⚠️ Next.js 13: disable production minification

Next 13.5 ships an older SWC minifier that **corrupts maplibre's symbol-placement code** in production builds. The map compiles fine but never paints — every frame throws:

```
Error: symbolInstance.crossTileID can't be 0
```

Development mode (`next dev`) is unaffected, which makes this easy to miss until the first production deploy. The SWC version bundled with Next 14+ is fixed; only Next 13 needs the workaround. Add this to `next.config.mjs`:

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

## Next.js 13–14: React 18 required

Next 13 and 14 pair with React 18 (`"react": "^18.3.1"`). React 19 is only supported from Next 15 onward.
