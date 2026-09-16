# Nuxt

Validated by `tests/framework/nuxt3-app` (Nuxt 3) and `tests/framework/nuxt4-app` (Nuxt 4, `app/` dir layout).

## Config

The map needs a real DOM + worker, so disable SSR. Load the stylesheet through Nuxt's `css` option and expose the key through `runtimeConfig.public`:

```ts
// nuxt.config.ts
// SPA-only: maplibre needs a real DOM + worker, so no SSR/prerender.
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

## App component

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

The `html, body` reset is required in Nuxt — there is no `index.html` of your own to put it in, and without it the map overflows the viewport by 16px on both axes (page scrolls).
