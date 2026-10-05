import { expect, test } from 'vitest'
import { mapEvent, mountMap, unmount, waitFor } from './utils'

async function mountDrawMap() {
  const { map, container } = mountMap({
    polygon: true,
    drawOptions: { defaultMode: 'simple_select', controls: { polygon: true, trash: true } },
  })
  await mapEvent(map, 'load')
  // Draw initializes on parent load; wait for its toolbar buttons
  // (maplibre-gl-draw keeps the mapbox-gl-draw_* class prefix).
  await waitFor(() => !!container.querySelector('.mapbox-gl-draw_ctrl-draw-btn'))
  return { map, container }
}

test('polygon option mounts the draw toolbar with enabled tools', async () => {
  const { map, container } = await mountDrawMap()
  expect(container.querySelector('.mapbox-gl-draw_polygon')).toBeTruthy()
  const trash = container.querySelector('.mapbox-gl-draw_trash')
  expect(trash).toBeTruthy()
  expect(map.draw).toBeDefined()
  map.remove()
  unmount(container)
})

test('changeMode switches to draw_polygon', async () => {
  const { map, container } = await mountDrawMap()
  expect(map.draw.getMode()).toBe('simple_select')
  map.draw.changeMode('draw_polygon')
  expect(map.draw.getMode()).toBe('draw_polygon')
  map.remove()
  unmount(container)
})

test('draw.getAll returns programmatically added features', async () => {
  const { map, container } = await mountDrawMap()
  const ids = map.draw.add({
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [-1, -1],
          [1, -1],
          [1, 1],
          [-1, 1],
          [-1, -1],
        ],
      ],
    },
  })
  expect(ids).toHaveLength(1)
  expect(map.draw.getAll().features).toHaveLength(1)
  map.remove()
  unmount(container)
})
