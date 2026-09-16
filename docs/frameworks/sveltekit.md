# SvelteKit

Validated by `tests/framework/sveltekit-app` (SvelteKit 2 + `adapter-static`).

## Layout — SPA mode

The map needs a real DOM and a worker, so disable SSR and prerender the shell:

```js
// src/routes/+layout.js
// SPA-only: maplibre needs a real DOM and a worker, so skip SSR.
export const ssr = false
export const prerender = true
```

## Page

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

Set the key via `.env` (`PUBLIC_BARIKOI_API_KEY=your_key`).

Reset the default `body` margin in `src/app.html` (`<body style="margin: 0" ...>`) so the 100vw/100vh map does not overflow the viewport.
