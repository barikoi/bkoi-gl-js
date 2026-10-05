# Vue

Validated by `tests/framework/vue3-vite-app` (Vue 3 + Vite 7) and `vue2-vite-app` (Vue 2.7 + `@vitejs/plugin-vue2` + Vite 5). Full harness run 2026-10-05, Node 24 LTS, npm — all cells pass (receipts: `tests/framework/results.json`).

| Vue | Toolchain | Status | Notes |
|---|---|---|---|
| 3 | Vite 7 | ✅ verified | — |
| 2.7 | Vite 5 + `@vitejs/plugin-vue2` | ✅ verified | Vue 2 is EOL — legacy apps only |

Not listed = untested.

## Prerequisites

- Node 24 LTS (the version the validation matrix runs on)
- A Barikoi API key

## Install

```sh
npm i bkoi-gl
```

**The stylesheet import is required in both versions** — without `import 'bkoi-gl/style.css'` the map still renders but controls (logo, attribution) are unstyled and the attribution can overflow the viewport.

## API key

Create `.env` in the project root (restart the dev server after adding it):

```
VITE_BARIKOI_API_KEY=your_key
```

## Quickstart (Vue 3)

```js
// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import 'bkoi-gl/style.css'

createApp(App).mount('#app')
```

```vue
<!-- src/App.vue -->
<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Map } from 'bkoi-gl'

const el = ref(null)
let map

onMounted(() => {
  map = new Map({
    container: el.value,
    accessToken: import.meta.env.VITE_BARIKOI_API_KEY,
    center: [90.3938, 23.8216],
    zoom: 12,
  })
})

onBeforeUnmount(() => map?.remove())
</script>

<template>
  <div ref="el" style="width: 100vw; height: 100vh"></div>
</template>
```

Expected result: a street map of Dhaka fills the viewport and the console stays clean. No worker configuration is needed — the library registers its self-contained worker automatically.

> **Container sizing:** keep the explicit inline height (or a dedicated CSS rule) on the map container. maplibre applies `.maplibregl-map { position: relative }` to it and can override positioning utility classes (e.g. Tailwind's `absolute inset-0`), collapsing the container to height 0 — blank map with zero console errors.

## Version-specific notes

### Vue 2.7

Vue 2 pairs with `@vitejs/plugin-vue2` and Vite 5 (the plugin-vue major that targets Vue 2). Vue 2.7 supports the composition API, but the validated app uses the options API with `$refs`:

```js
// src/main.js
import Vue from 'vue'
import App from './App.vue'
import 'bkoi-gl/style.css'

new Vue({ render: h => h(App) }).$mount('#app')
```

```vue
<!-- src/App.vue -->
<script>
import { Map } from 'bkoi-gl'

export default {
  name: 'App',
  data() {
    return { map: null }
  },
  mounted() {
    this.map = new Map({
      container: this.$refs.el,
      accessToken: import.meta.env.VITE_BARIKOI_API_KEY,
      center: [90.3938, 23.8216],
      zoom: 12,
    })
  },
  beforeDestroy() {
    this.map && this.map.remove()
  },
}
</script>

<template>
  <div ref="el" style="width: 100vw; height: 100vh"></div>
</template>
```

## Troubleshooting

- **Map renders but the logo/attribution look wrong or the page scrolls ~40px** — the stylesheet import is missing; `import 'bkoi-gl/style.css'` in your entry file.
- **Page scrolls 16px on both axes** — the default body margin; reset it in `index.html` (`body { margin: 0 }`).
- **Blank map, no console errors** — the map container has no height (see the container-sizing note above).
