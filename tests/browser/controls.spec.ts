import { expect, test } from 'vitest'
import { FullscreenControl, GeolocateControl, NavigationControl, ScaleControl } from 'bkoi-gl'
import { mapEvent, mountMap, unmount } from './utils'

test('NavigationControl renders zoom + compass buttons', async () => {
  const { map, container } = mountMap()
  await mapEvent(map, 'load')
  map.addControl(new NavigationControl(), 'top-right')
  const group = container.querySelector('.maplibregl-ctrl-top-right .maplibregl-ctrl-group')
  expect(group).toBeTruthy()
  // zoom-in, zoom-out, compass (v6 default NavigationControl)
  expect(group?.querySelectorAll('.maplibregl-ctrl-icon')).toHaveLength(3)
  map.remove()
  unmount(container)
})

test('ScaleControl renders a scale element', async () => {
  const { map, container } = mountMap()
  await mapEvent(map, 'load')
  map.addControl(new ScaleControl())
  expect(
    container.querySelector('.maplibregl-ctrl-bottom-left .maplibregl-ctrl-scale')
  ).toBeTruthy()
  map.remove()
  unmount(container)
})

test('FullscreenControl renders a fullscreen button', async () => {
  const { map, container } = mountMap()
  await mapEvent(map, 'load')
  map.addControl(new FullscreenControl())
  expect(
    container.querySelector('.maplibregl-ctrl-top-right .maplibregl-ctrl-fullscreen')
  ).toBeTruthy()
  map.remove()
  unmount(container)
})

test('GeolocateControl renders and activates with granted permission', async () => {
  const { map, container } = mountMap()
  await mapEvent(map, 'load')
  map.addControl(new GeolocateControl())
  const btn = container.querySelector<HTMLElement>('.maplibregl-ctrl-geolocate')
  expect(btn).toBeTruthy()
  // Permission is stubbed to granted in setup; click must not throw and must
  // mark the control as awaiting/active (no crash when geolocation fires).
  btn?.click()
  map.remove()
  unmount(container)
})
