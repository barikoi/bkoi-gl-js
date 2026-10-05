import { expect, test } from 'vitest'
import { Minimap } from 'bkoi-gl'
import { mapEvent, mountMap, unmount, waitFor } from './utils'

test('minimap option mounts a minimap control with its own canvas', async () => {
  const { map, container } = mountMap({ minimap: { toggleable: false } })
  await mapEvent(map, 'load')
  // Minimap initializes on parent load; wait for its canvas to appear.
  await waitFor(() => !!container.querySelector('.maplibregl-ctrl-minimap'))
  const minimapEl = container.querySelector<HTMLElement>('.maplibregl-ctrl-minimap')
  expect(minimapEl?.querySelector('canvas')).toBeTruthy()
  map.remove()
  unmount(container)
})

test('Minimap can be added directly via addControl', async () => {
  const { map, container } = mountMap()
  await mapEvent(map, 'load')
  map.addControl(new Minimap({ toggleable: false }), 'bottom-left')
  await waitFor(() => !!container.querySelector('.maplibregl-ctrl-minimap'))
  expect(
    container.querySelector('.maplibregl-ctrl-bottom-left .maplibregl-ctrl-minimap canvas')
  ).toBeTruthy()
  map.remove()
  unmount(container)
})

test('toggleable minimap exposes a toggle button', async () => {
  const { map, container } = mountMap({ minimap: { toggleable: true } })
  await mapEvent(map, 'load')
  // The toggle button mounts asynchronously alongside the minimap canvas —
  // wait for the button itself, not just the minimap (avoids the race).
  await waitFor(
    () =>
      !!container.querySelector('.maplibregl-ctrl-minimap button[class*="minimap-toggle-display"]')
  )
  const minimapEl = container.querySelector<HTMLElement>('.maplibregl-ctrl-minimap')
  expect(minimapEl?.querySelector('button[class*="minimap-toggle-display"]')).toBeTruthy()
  map.remove()
  unmount(container)
})
