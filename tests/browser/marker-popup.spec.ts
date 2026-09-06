import { expect, test } from 'vitest'
import { Marker, Popup } from 'bkoi-gl'
import { mapEvent, mountMap, unmount } from './utils'

test('Marker renders at the given LngLat', async () => {
  const { map, container } = mountMap()
  await mapEvent(map, 'load')
  new Marker().setLngLat([90.3938, 23.8216]).addTo(map)
  const marker = container.querySelector('.maplibregl-marker')
  expect(marker).toBeTruthy()
  map.remove()
  unmount(container)
})

test('Popup renders HTML content on addTo', async () => {
  const { map, container } = mountMap()
  await mapEvent(map, 'load')
  new Popup().setLngLat([90.3938, 23.8216]).setHTML('<p>bkoi-popup</p>').addTo(map)
  const popup = container.querySelector('.maplibregl-popup')
  expect(popup?.textContent).toContain('bkoi-popup')
  map.remove()
  unmount(container)
})

test('Popup opens and closes via API', async () => {
  const { map, container } = mountMap()
  await mapEvent(map, 'load')
  const popup = new Popup().setLngLat([90.3938, 23.8216]).setText('openable').addTo(map)
  expect(popup.isOpen()).toBe(true)
  popup.remove()
  expect(popup.isOpen()).toBe(false)
  map.remove()
  unmount(container)
})
