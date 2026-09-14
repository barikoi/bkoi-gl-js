/**
 * Minimal maplibre-gl mock for unit (jsdom) tests.
 * Mirrors react-bkoi-gl's tests/unit/mocks/maplibre-gl.js.
 * Real rendering is covered by the browser project — this mock exists to
 * drive every branch of bkoi-gl's wrapper code (constructor options,
 * style URL building, event handlers, Minimap sync logic) deterministically.
 */

export class LngLat {
  constructor(lng, lat) {
    this.lng = lng
    this.lat = lat
  }
  toArray() {
    return [this.lng, this.lat]
  }
  *[Symbol.iterator]() {
    yield this.lng
    yield this.lat
  }
}

export class Evented {
  _listeners = new globalThis.Map()
  _loadFired = false

  on(event, fn) {
    if (!this._listeners.has(event)) this._listeners.set(event, new globalThis.Set())
    this._listeners.get(event).add(fn)
    return this
  }

  once(event, fn) {
    const wrapped = data => {
      this.off(event, wrapped)
      fn(data)
    }
    wrapped._orig = fn
    return this.on(event, wrapped)
  }

  off(event, fn) {
    const set = this._listeners.get(event)
    if (!set) return this
    for (const entry of set) {
      if (entry === fn || entry._orig === fn || fn._orig === entry) set.delete(entry)
    }
    return this
  }

  fire(event, data) {
    const set = this._listeners.get(event)
    if (set) for (const fn of [...set]) fn(data)
    return this
  }
}

class Control {
  _el = null
  onAdd() {
    this._el = document.createElement('div')
    this._el.className = 'maplibregl-ctrl maplibregl-ctrl-group'
    return this._el
  }
  onRemove() {}
}
export class AttributionControl extends Control {
  onAdd() {
    this._el = document.createElement('div')
    this._el.className = 'maplibregl-ctrl maplibregl-ctrl-attrib'
    const inner = document.createElement('div')
    inner.className = 'maplibregl-ctrl-attrib-inner'
    this._el.appendChild(inner)
    return this._el
  }
}

export class Map extends Evented {
  constructor(options = {}) {
    super()
    this.options = options
    this._zoom = options.zoom ?? 0
    this._center = options.center
      ? new LngLat(options.center[0], options.center[1])
      : new LngLat(0, 0)
    this._style = options.style ?? null
    this._controls = []
    this._sources = {}
    this._layers = []
    this._canvas = { width: 800, height: 600, style: {} }
    this._container = document.createElement('div')
    this.disabledInteractions = []
    const trackInteraction = name => ({ disable: () => this.disabledInteractions.push(name) })
    this.scrollZoom = trackInteraction('scrollZoom')
    this.boxZoom = trackInteraction('boxZoom')
    this.dragRotate = trackInteraction('dragRotate')
    this.dragPan = trackInteraction('dragPan')
    this.keyboard = trackInteraction('keyboard')
    this.doubleClickZoom = trackInteraction('doubleClickZoom')
    this.touchZoomRotate = trackInteraction('touchZoomRotate')
    this.jumpToCalls = []
    this.paintCalls = []
    this.layoutCalls = []
    // Fire lifecycle asynchronously so `once('load')` registrations that
    // happen synchronously after construction still receive them.
    setTimeout(() => {
      this.fire('style.load')
      this._loadFired = true
      this.fire('load')
    }, 0)
  }

  addControl(control, position) {
    this._controls.push({ control, position })
    const el = control.onAdd?.(this)
    // Mirror real maplibre: the control's element lands in a position bucket
    // inside the map container.
    if (el) {
      let bucket = this._container.querySelector(`.maplibregl-ctrl-${position}`)
      if (!bucket) {
        bucket = document.createElement('div')
        bucket.className = `maplibregl-ctrl-${position}`
        this._container.appendChild(bucket)
      }
      bucket.appendChild(el)
    }
    return this
  }
  remove() {
    return this
  }
  removeControl(control) {
    this._controls = this._controls.filter(c => c.control !== control)
    control.onRemove?.()
    return this
  }
  getCanvas() {
    return this._canvas
  }
  getContainer() {
    return this._container
  }
  getZoom() {
    return this._zoom
  }
  getCenter() {
    return this._center
  }
  getBearing() {
    return this.options.bearing ?? 0
  }
  getPitch() {
    return this.options.pitch ?? 0
  }
  getStyle() {
    return this._style
  }
  setStyle(style) {
    this._style = style
    return this
  }
  jumpTo(view) {
    this.jumpToCalls.push(view)
    if (view.zoom !== undefined) this._zoom = view.zoom
    if (view.center) this._center = new LngLat(view.center.lng, view.center.lat)
    return this
  }
  unproject(point) {
    return new LngLat(point[0] / 100, point[1] / 100)
  }
  resize() {
    this.resizeCalls = (this.resizeCalls ?? 0) + 1
    return this
  }
  addSource(id, source) {
    this._sources[id] = {
      ...source,
      setData(data) {
        this.data = data
      },
    }
    return this
  }
  getSource(id) {
    return this._sources[id]
  }
  addLayer(layer, beforeId) {
    this._layers.push({ layer, beforeId })
    return this
  }
  removeLayer(id) {
    this._layers = this._layers.filter(l => l.layer.id !== id)
    return this
  }
  moveLayer(id, beforeId) {
    this._layers = this._layers.map(l => (l.layer.id === id ? { layer: l.layer, beforeId } : l))
    return this
  }
  setLayerZoomRange() {
    return this
  }
  setFilter() {
    return this
  }
  setPaintProperty(layerId, name, value, options) {
    this.paintCalls.push([layerId, name, value, options])
    return this
  }
  setLayoutProperty(layerId, name, value, options) {
    this.layoutCalls.push([layerId, name, value, options])
    return this
  }
  setGlyphs() {
    return this
  }
}

export class NavigationControl extends Control {}
export class GeolocateControl extends Control {}
export class ScaleControl extends Control {}
export class FullscreenControl extends Control {}
export class Popup extends Control {
  setLngLat() {
    return this
  }
  setHTML() {
    return this
  }
  setText() {
    return this
  }
  addTo() {
    return this
  }
  isOpen() {
    return true
  }
  remove() {
    return this
  }
}
export class Marker extends Control {
  setLngLat() {
    return this
  }
  addTo() {
    return this
  }
}
export class Style {}
export class LngLatBounds {}
export class Point {}
export class MercatorCoordinate {}

export function setRTLTextPlugin() {}
export function getRTLTextPluginStatus() {
  return 'unavailable'
}
export function prewarm() {}
export function clearPrewarmedResources() {}
export function setWorkerUrl() {}
export function getWorkerUrl() {
  return ''
}
export function getVersion() {
  return '6.6.0'
}

export default {
  Map,
  Evented,
  LngLat,
  NavigationControl,
  GeolocateControl,
  AttributionControl,
  ScaleControl,
  FullscreenControl,
  Popup,
  Marker,
}
