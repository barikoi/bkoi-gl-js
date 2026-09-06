/* Browser test helpers — vanilla DOM, no React act() needed. */
import { Map } from 'bkoi-gl'
import type { BkoiMapOptions } from 'bkoi-gl'

export const emptyStyle = {
  version: 8 as const,
  name: 'bkoi-gl-test',
  sources: {},
  layers: [],
}

/** Geolocation-style with one GeoJSON point source. */
export const geojsonStyle = {
  ...emptyStyle,
  sources: {
    points: {
      type: 'geojson' as const,
      data: { type: 'FeatureCollection' as const, features: [] },
    },
  },
  layers: [
    { id: 'points', type: 'circle' as const, source: 'points', paint: { 'circle-radius': 5 } },
  ],
}

let containerSeq = 0

/** Create a fresh offscreen container and mount a Map with the empty style. */
export function mountMap(options: Partial<BkoiMapOptions> = {}) {
  const container = document.createElement('div')
  container.id = `bkoi-test-${++containerSeq}`
  Object.assign(container.style, {
    position: 'fixed',
    top: '0',
    left: '-10000px',
    width: '800px',
    height: '600px',
  })
  document.body.appendChild(container)
  const map = new Map({
    container,
    style: emptyStyle,
    center: [90.3938, 23.8216],
    zoom: 12,
    ...options,
  } as BkoiMapOptions)
  return { map, container }
}

/** Remove a container created by mountMap. */
export function unmount(container: HTMLElement) {
  container.remove()
}

/** Resolve on the next matching map event (one-shot registration). */
export function mapEvent(map: Map, event: string, timeoutMs = 20_000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`map event "${event}" not fired within ${timeoutMs}ms`)),
      timeoutMs
    )
    map.once(event as never, (e: unknown) => {
      clearTimeout(timer)
      resolve(e)
    })
  })
}

/** Wait for style load via the engine's own readiness API. */
export async function waitForMapLoad(map: Map) {
  while (!map.isStyleLoaded()) {
    await sleep(50)
  }
  await sleep(0)
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Poll `cond` until true. Only for conditions with no event to hook —
 * otherwise register a one-shot listener (mapEvent) instead.
 */
export async function waitFor(cond: () => boolean, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs
  while (!cond()) {
    if (Date.now() > deadline) throw new Error(`waitFor: condition not met within ${timeoutMs}ms`)
    await sleep(20)
  }
}
