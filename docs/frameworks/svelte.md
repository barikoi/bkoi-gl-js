# Svelte

Validated by `tests/framework/svelte5-vite-app` (Svelte 5 + Vite 7) and `tests/framework/svelte4-vite-app` (Svelte 4 + `@vitejs/vite-plugin-svelte@3` + Vite 5).

Import the stylesheet once in the entry file — Svelte 5 uses `mount`, Svelte 4 uses `new App`:

```js
// src/main.js — Svelte 5
import { mount } from 'svelte'
import App from './App.svelte'
import 'bkoi-gl/style.css'

mount(App, { target: document.getElementById('app') })
```

```js
// src/main.js — Svelte 4
import App from './App.svelte'
import 'bkoi-gl/style.css'

new App({ target: document.getElementById('app') })
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

Note: Svelte 4 requires `@vitejs/vite-plugin-svelte@3` (the v4/v5 plugins target Svelte 5) and pairs with Vite 5.
