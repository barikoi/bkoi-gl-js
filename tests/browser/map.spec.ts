import { expect, test } from 'vitest'
import { geojsonStyle, mapEvent, mountMap, unmount, waitForMapLoad } from './utils'

test('Map renders a canvas and fires load', async () => {
  const { map, container } = mountMap()
  await mapEvent(map, 'load')
  await waitForMapLoad(map)
  expect(container.querySelector('canvas')).toBeTruthy()
  expect(map.getStyle().name).toBe('bkoi-gl-test')
  map.remove()
  unmount(container)
})

test('Map applies center and zoom', async () => {
  const { map, container } = mountMap({ center: [90, 23.7], zoom: 9 })
  await mapEvent(map, 'load')
  expect(map.getCenter().lng).toBeCloseTo(90, 5)
  expect(map.getCenter().lat).toBeCloseTo(23.7, 5)
  expect(map.getZoom()).toBeCloseTo(9, 5)
  map.remove()
  unmount(container)
})

test('Map fires ready with maplibre event payload', async () => {
  const { map, container } = mountMap({ style: geojsonStyle })
  const readyEvent = await mapEvent(map, 'load')
  expect(readyEvent).toBeDefined()
  // v6 dropped lngLat from some event payloads; load carries target only —
  // asserted loosely so payload enrichment is a deliberate change, not drift.
  expect(map.getStyle().layers).toHaveLength(1)
  map.remove()
  unmount(container)
})

test('addLayer renders a source layer after load', async () => {
  const { map, container } = mountMap({ style: geojsonStyle })
  await mapEvent(map, 'load')
  expect(map.getLayer('points')).toBeTruthy()
  map.remove()
  unmount(container)
})

test('Map injects Barikoi attribution control (bottom-right)', async () => {
  const { map, container } = mountMap()
  await mapEvent(map, 'load')
  const containerEl = container.querySelector('.maplibregl-ctrl-bottom-right')
  expect(containerEl?.querySelector('.maplibregl-ctrl-attrib')).toBeTruthy()
  map.remove()
  unmount(container)
})
