# Svelte

Validated by `tests/framework/svelte5-vite-app` (Svelte 5 + Vite 7) and `svelte4-vite-app` (Svelte 4 + `@sveltejs/vite-plugin-svelte@3` + Vite 5). Full harness run 2026-10-05, Node 24 LTS, npm — all cells pass (receipts: `tests/framework/results.json`).

| Svelte | Toolchain | Status | Notes |
|---|---|---|---|
| 5 | Vite 7 (`@sveltejs/vite-plugin-svelte@6`) | ✅ verified | plugin@5 pairs Svelte 5 with Vite 6 |
| 4 | Vite 5 (`@sveltejs/vite-plugin-svelte@3`) | ✅ verified | the v4/v5 plugins target Svelte 5 only |

Not listed = untested.

## Prerequisites

- Node 24 LTS (the version the validation matrix runs on)
- A Barikoi API key

## Install

The Vite plugin is **`@sveltejs/vite-plugin-svelte`** (an `@sveltejs` package — `@vitejs/vite-plugin-svelte` does not exist and the install 404s). Pick the plugin major to match your stack:

```sh
# Svelte 5 + Vite 7
npm i -D @sveltejs/vite-plugin-svelte@6 vite@7
# Svelte 5 + Vite 6
npm i -D @sveltejs/vite-plugin-svelte@5 vite@6
# Svelte 4 + Vite 5 (downgrade from the scaffold's Svelte 5)
npm i -D svelte@4 @sveltejs/vite-plugin-svelte@3 vite@5
```

Then install the library:

```sh
npm i bkoi-gl
```

## API key

Create `.env` in the project root (restart the dev server after adding it):

```
VITE_BARIKOI_API_KEY=your_key
```

## Quickstart (Svelte 5)

Import the stylesheet once in the entry file. Svelte 5 uses `mount`, Svelte 4 uses `new App`:

```js
// src/main.js — Svelte 5
import { mount } from 'svelte'
import App from './App.svelte'
import 'bkoi-gl/style.css'

mount(App, { target: document.getElementById('app') })
```

The component is identical in both majors:

```svelte
<!-- src/App.svelte -->
<script>
  import { onMount } from 'svelte'
  import { Map } from 'bkoi-gl'

  let el

  onMount(() => {
    const map = new Map({
      container: el,
      accessToken: import.meta.env.VITE_BARIKOI_API_KEY,
      center: [90.3938, 23.8216],
      zoom: 12,
    })

    return () => map.remove()
  })
</script>

<div bind:this={el} style="width: 100vw; height: 100vh"></div>
```

Expected result: a street map of Dhaka fills the viewport and the console stays clean. No worker configuration is needed — the library registers its self-contained worker automatically.

> **Container sizing:** keep the explicit inline height (or a dedicated CSS rule) on the map container. maplibre applies `.maplibregl-map { position: relative }` to it and can override positioning utility classes (e.g. Tailwind's `absolute inset-0`), collapsing the container to height 0 — blank map with zero console errors.

## Version-specific notes

### Svelte 4

Requires `@sveltejs/vite-plugin-svelte@3` (the v4/v5 plugins target Svelte 5) and pairs with Vite 5. The entry file differs — Svelte 4 has no `mount` export:

```js
// src/main.js — Svelte 4
import App from './App.svelte'
import 'bkoi-gl/style.css'

new App({ target: document.getElementById('app') })
```

## Troubleshooting

- **`@vitejs/vite-plugin-svelte` install 404s** — the package does not exist; it is `@sveltejs/vite-plugin-svelte` (see Install).
- **Page scrolls 16px on both axes** — the Vite Svelte template does not reset the default body margin, and replacing `main.js` drops the template's `app.css` import. Reset it in `index.html` (`body { margin: 0 }`).
- **Blank map, no console errors** — the map container has no height (see the container-sizing note above).
