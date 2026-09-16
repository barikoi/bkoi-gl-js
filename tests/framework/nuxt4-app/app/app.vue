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
  map.on('load', () => {
    ;(window as unknown as { __READY: boolean }).__READY = true
  })
  map.on('idle', () => {
    ;(window as unknown as { __IDLE: boolean }).__IDLE = true
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
