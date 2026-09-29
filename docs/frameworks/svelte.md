# Svelte

Validated by `tests/framework/svelte5-vite-app` (Svelte 5 + Vite 7) and `tests/framework/svelte4-vite-app` (Svelte 4 + `@sveltejs/vite-plugin-svelte@3` + Vite 5).

The Vite plugin is **`@sveltejs/vite-plugin-svelte`** (an `@sveltejs` package — `@vitejs/vite-plugin-svelte` does not exist and the install 404s). Pick the plugin major to match your stack:

```sh
# Svelte 5 + Vite 7
npm i -D @sveltejs/vite-plugin-svelte@6 vite@7
# Svelte 5 + Vite 6
npm i -D @sveltejs/vite-plugin-svelte@5 vite@6
# Svelte 4 + Vite 5 (downgrade from the scaffold's Svelte 5)
npm i -D svelte@4 @sveltejs/vite-plugin-svelte@3 vite@5
```

Create `.env` with `VITE_BARIKOI_API_KEY=your_key` (restart the dev server after adding it).

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

Note: Svelte 4 requires `@sveltejs/vite-plugin-svelte@3` (the v4/v5 plugins target Svelte 5) and pairs with Vite 5.

Reset the default body margin in `index.html` (`body { margin: 0 }`), or the 100vw/100vh map overflows by 16px on both axes — the Vite Svelte template does not reset it, and the `main.js` above replaces the template's (which was the only thing importing `app.css`).
