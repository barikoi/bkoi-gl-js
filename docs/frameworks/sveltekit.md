# SvelteKit

Validated by `tests/framework/sveltekit-app` (SvelteKit 2 + `adapter-static`, prerendered SPA shell). Full harness run 2026-10-05, Node 24 LTS, npm — all cells pass (receipts: `tests/framework/results.json`).

| SvelteKit | Adapter | Status | Notes |
|---|---|---|---|
| 2 | `adapter-static` (SPA) | ✅ verified | — |

Not listed = untested.

## Prerequisites

- Node 24 LTS (the version the validation matrix runs on)
- A Barikoi API key

## Install

```sh
npm i bkoi-gl
```

## API key

Set the key via `.env`:

```
PUBLIC_BARIKOI_API_KEY=your_key
```

## Quickstart

The map needs a real DOM and a worker, so disable SSR and prerender the shell:

```js
// src/routes/+layout.js
// SPA-only: maplibre needs a real DOM and a worker, so skip SSR.
export const ssr = false
export const prerender = true
```

**The stylesheet import in `+page.svelte` is required** — SvelteKit emits no stylesheet at all without it, and the map renders with unstyled (overflowing) logo and attribution controls:

```svelte
<!-- src/routes/+page.svelte -->
<script>
  import { onMount } from 'svelte'
  import { Map } from 'bkoi-gl'
  import 'bkoi-gl/style.css'
  import { PUBLIC_BARIKOI_API_KEY } from '$env/static/public'

  let el

  onMount(() => {
    const map = new Map({
      container: el,
      accessToken: PUBLIC_BARIKOI_API_KEY,
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

## Troubleshooting

- **Logo/attribution render unstyled or overflow the viewport** — the `import 'bkoi-gl/style.css'` line is missing from `+page.svelte`; SvelteKit emits no stylesheet without it.
- **Server-side rendering error** — the map needs a real DOM and a worker; keep `ssr = false` in `+layout.js`.
- **Page scrolls 16px on both axes** — reset the default `body` margin in `src/app.html` (`<body style="margin: 0" ...>`).
- **Blank map, no console errors** — the map container has no height (see the container-sizing note above).
