# Next.js

Validated by `tests/framework/next15-app` (Next 15, webpack build) and `tests/framework/next16-app` (Next 16 — both the Turbopack default and `next build --webpack`).

Map components need `"use client"` — the map requires a real DOM and a worker, so it cannot render on the server. No worker configuration is needed; the automatic worker URL registration works in both bundlers.

```tsx
// app/map-view.jsx
'use client'

import { useEffect, useRef } from 'react'
import { Map } from 'bkoi-gl'
import 'bkoi-gl/style.css'

export default function MapView() {
  const ref = useRef(null)

  useEffect(() => {
    const map = new Map({
      container: ref.current,
      accessToken: process.env.NEXT_PUBLIC_BARIKOI_API_KEY,
      center: [90.3938, 23.8216],
      zoom: 12,
    })
    return () => map.remove()
  }, [])

  return <div ref={ref} style={{ width: '100vw', height: '100vh' }} />
}
```

```jsx
// app/page.jsx
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
