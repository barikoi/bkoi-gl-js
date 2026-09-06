/**
 * Minimal maplibre-gl-draw mock for unit (jsdom) tests.
 * The browser project exercises the real draw library; this stub exists so
 * unit tests can drive BkoiGlMap's draw event handlers and getDraw().
 */
export class MapboxDraw {
  constructor(options = {}) {
    this.options = options
    this._mode = options.defaultMode ?? 'simple_select'
  }
  getMode() {
    return this._mode
  }
  changeMode(mode) {
    this._mode = mode
    return this
  }
  add(feature) {
    return [feature.id ?? 1]
  }
  getAll() {
    return { type: 'FeatureCollection', features: [] }
  }
  onAdd() {
    const el = document.createElement('div')
    el.className = 'mapbox-gl-draw_ctrl-draw maplibregl-ctrl'
    return el
  }
  onRemove() {}
}

export default MapboxDraw
