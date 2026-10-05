# Nuxt

Validated by `tests/framework/nuxt3-app` (Nuxt 3) and `nuxt4-app` (Nuxt 4). Full harness run 2026-10-05, Node 24 LTS, npm — all cells pass, `nuxi generate` SPA output (receipts: `tests/framework/results.json`).

| Nuxt | Output | Status | Notes |
|---|---|---|---|
| 3 | `nuxi generate` (SPA) | ✅ verified | — |
| 4 | `nuxi generate` (SPA) | ✅ verified | `app/` directory layout |

Not listed = untested. Nuxt 4 requires Node 24 (even LTS) in the matrix.

## Prerequisites

- Node 24 LTS (required to run the Nuxt 4 cell; the whole matrix validates on it)
- A Barikoi API key

## Install

```sh
npm i bkoi-gl
```

## Configuration

The map needs a real DOM + worker, so disable SSR. Load the stylesheet through Nuxt's `css` option and expose the key through `runtimeConfig.public`:

```ts
// nuxt.config.ts
// SPA-only: maplibre needs a real DOM and a worker, so no SSR/prerender.
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: false },
  css: ['bkoi-gl/style.css'],
  runtimeConfig: {
    public: {
      // Populated from NUXT_PUBLIC_BARIKOI_API_KEY at build time.
      barikoiApiKey: '',
    },
  },
})
```

## API key

Set it via `.env` — `runtimeConfig.public.barikoiApiKey` is populated from it at build time:

```
NUXT_PUBLIC_BARIKOI_API_KEY=your_key
```

## Quickstart

```vue
<!-- app.vue (Nuxt 3) / app/app.vue (Nuxt 4) -->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Map } from 'bkoi-gl'

const config = useRuntimeConfig()
const el = ref<HTMLElement | null>(null)
let map: InstanceType<typeof Map> | undefined

onMounted(() => {
  if (!el.value) return
  map = new Map({
    container: el.value,
    accessToken: config.public.barikoiApiKey,
    center: [90.3938, 23.8216],
    zoom: 12,
  })
})

onBeforeUnmount(() => map?.remove())
</script>

<template>
  <div ref="el" style="width: 100vw; height: 100vh" />
</template>

<!-- Nuxt owns the document HTML (no index.html to reset browser defaults
     in) — without this, body's 8px margin overflows the 100vw/100vh map. -->
<style>
html,
body {
  margin: 0;
  padding: 0;
}
</style>
```

Expected result: a street map of Dhaka fills the viewport and the console stays clean. No worker configuration is needed — the library registers its self-contained worker automatically.

> **Container sizing:** keep the explicit inline height (or a dedicated CSS rule) on the map container. maplibre applies `.maplibregl-map { position: relative }` to it and can override positioning utility classes (e.g. Tailwind's `absolute inset-0`), collapsing the container to height 0 — blank map with zero console errors.

## Version-specific notes

- **Nuxt 4** uses the `app/` directory layout — the component above lives at `app/app.vue` instead of the project root. Everything else is identical between majors.
- The validated cells are **SPA output** (`ssr: false` + `nuxi generate`). Server-rendering a map component is not a tested path.

## Troubleshooting

- **Server-side rendering error / hydration mismatch** — the map needs a real DOM and a worker; keep `ssr: false` in `nuxt.config.ts`.
- **Page scrolls 16px on both axes** — Nuxt owns the document HTML; the `html, body { margin: 0 }` reset in the component's `<style>` block above is required.
- **Blank map, no console errors** — the map container has no height (see the container-sizing note above).
