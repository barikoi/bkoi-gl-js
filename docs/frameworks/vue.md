# Vue

Validated by `tests/framework/vue3-vite-app` (Vue 3 + Vite 7) and `tests/framework/vue2-vite-app` (Vue 2.7 + `@vitejs/plugin-vue2` + Vite 5).

**The stylesheet import is required in both versions** — without `import 'bkoi-gl/style.css'` the map still renders but controls (logo, attribution) are unstyled and the attribution can overflow the viewport.

## Vue 3

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

## Vue 2.7

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

Reset the default body margin in `index.html` (`body { margin: 0 }`), or the 100vw/100vh map overflows by 16px on both axes.
