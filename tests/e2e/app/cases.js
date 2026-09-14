// E2E case registry — every README-claimed feature, one URL per case.
// Each case mounts exactly one full-viewport map on window.__MAP__.
import {
  Map,
  Minimap,
  NavigationControl,
  ScaleControl,
  FullscreenControl,
  GeolocateControl,
  Marker,
  Popup,
} from 'bkoi-gl'
import 'bkoi-gl/style.css'

const DHAKA = [90.3938, 23.8216]
const apiKey = import.meta.env.BARIKOI_API_KEY

export const CASES = {
  // Default Barikoi style via accessToken — the README quick-start path.
  'map/basic': root => {
    const map = new Map({
      container: root,
      accessToken: apiKey,
      center: DHAKA,
      zoom: 12,
    })
    window.__MAP__ = map
    map.on('load', () => window.__log({ type: 'load' }))
    map.on('move', e => window.__log({ type: 'move', keys: Object.keys(e) }))
    map.on('moveend', () =>
      window.__log({ type: 'moveend', center: map.getCenter(), zoom: map.getZoom() })
    )
    map.on('zoomend', () => window.__log({ type: 'zoomend', zoom: map.getZoom() }))
  },

  // Navigation/scale/fullscreen/geolocate on one map. No minimap here: its
  // bidirectional sync fights the parent's zoom animation (see controls/minimap).
  'controls/navigation': root => {
    const map = new Map({
      container: root,
      accessToken: apiKey,
      center: DHAKA,
      zoom: 12,
    })
    window.__MAP__ = map
    map.on('load', () => {
      window.__log({ type: 'load' })
      map.addControl(new NavigationControl(), 'top-left')
      map.addControl(new ScaleControl(), 'bottom-left')
      map.addControl(new FullscreenControl(), 'top-right')
      map.addControl(new GeolocateControl({ trackUserLocation: true }), 'top-right')
    })
  },

  // Minimap alone — README minimap option/control path.
  'controls/minimap': root => {
    const map = new Map({
      container: root,
      accessToken: apiKey,
      center: DHAKA,
      zoom: 12,
    })
    window.__MAP__ = map
    map.on('load', () => {
      window.__log({ type: 'load' })
      // Added after load: Minimap inherits parentMap.getStyle(), undefined
      // until the parent style has loaded.
      const minimap = new Minimap({ zoomAdjust: -2 })
      map.addControl(minimap, 'top-right')
      window.__MINIMAP__ = minimap
      minimap.map.once('load', () => window.__log({ type: 'minimap-load' }))
    })
  },

  // Draw tools enabled — toolbar renders, draw.* events fire.
  'draw/all': root => {
    const map = new Map({
      container: root,
      accessToken: apiKey,
      center: DHAKA,
      zoom: 12,
      // Draw only initializes when `polygon` is truthy (see src/index.ts).
      polygon: true,
      drawOptions: { controls: { polygon: true, point: true, trash: true } },
    })
    window.__MAP__ = map
    map.on('load', () => window.__log({ type: 'load' }))
    map.on('draw.create', e => window.__log({ type: 'draw.create', features: e.features?.length }))
    map.on('draw.modechange', e => window.__log({ type: 'draw.modechange', mode: e.mode }))
  },

  // Markers & Popups — README "Markers & Popups" section.
  'marker-popup': root => {
    const map = new Map({
      container: root,
      accessToken: apiKey,
      center: DHAKA,
      zoom: 12,
    })
    window.__MAP__ = map
    map.on('load', () => {
      window.__log({ type: 'load' })
      const popup = new Popup({ offset: 25 }).setHTML('<h3>Location</h3><p>marker</p>')
      const marker = new Marker().setLngLat(DHAKA).setPopup(popup).addTo(map)
      window.__MARKER__ = marker
      marker.togglePopup()
    })
  },
}
