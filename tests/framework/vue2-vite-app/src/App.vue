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
    this.map.on('load', () => {
      window.__READY = true
    })
    this.map.on('idle', () => {
      window.__IDLE = true
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
