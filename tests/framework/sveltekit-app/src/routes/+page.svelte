<script>
  import { onMount } from 'svelte'
  import { Map } from 'bkoi-gl'
  import { PUBLIC_BARIKOI_API_KEY } from '$env/static/public'

  let el

  onMount(() => {
    const map = new Map({
      container: el,
      accessToken: PUBLIC_BARIKOI_API_KEY,
      center: [90.3938, 23.8216],
      zoom: 12,
    })
    map.on('load', () => {
      window.__READY = true
    })
    map.on('idle', () => {
      window.__IDLE = true
    })
    return () => map.remove()
  })
</script>

<div bind:this={el} style="width: 100vw; height: 100vh"></div>
