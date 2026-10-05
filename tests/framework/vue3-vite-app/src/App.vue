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
  map.on('load', () => {
    window.__READY = true
  })
  map.on('idle', () => {
    window.__IDLE = true
  })
})

onBeforeUnmount(() => map?.remove())
</script>

<template>
  <div ref="el" style="width: 100vw; height: 100vh"></div>
</template>
