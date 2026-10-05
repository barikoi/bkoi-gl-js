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
import * as lib from 'bkoi-gl'
import 'bkoi-gl/style.css'

const DHAKA = [90.3938, 23.8216]
const apiKey = import.meta.env.BARIKOI_API_KEY

const CASES = {
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

  // Event payload contract — every documented event logs its payload shape
  // so the spec can assert required key fields (see events.spec.ts).
  'events/contract': root => {
    const map = new Map({
      container: root,
      accessToken: apiKey,
      center: DHAKA,
      zoom: 12,
      polygon: true,
      drawOptions: { controls: { polygon: false, point: true, trash: false } },
    })
    window.__MAP__ = map
    map.on('load', () => window.__log({ type: 'load' }))
    map.on('move', e => window.__log({ type: 'move', keys: Object.keys(e) }))
    map.on('moveend', () =>
      window.__log({ type: 'moveend', center: map.getCenter(), zoom: map.getZoom() })
    )
    map.on('zoomend', () => window.__log({ type: 'zoomend', zoom: map.getZoom() }))
    map.on('click', e =>
      window.__log({
        type: 'click',
        lngLat: [e.lngLat.lng, e.lngLat.lat],
        point: [e.point.x, e.point.y],
        keys: Object.keys(e),
      })
    )
    map.on('draw.create', e =>
      window.__log({
        type: 'draw.create',
        features: e.features?.length,
        geometry: e.features?.[0]?.geometry?.type,
      })
    )
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

  // Draw tools — one mount for both specs: toolbar-driven drawing
  // (draw.spec polygon e2e) and API-driven ops (add/changeMode/trash).
  'draw/tools': root => {
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
    map.on('draw.selectionchange', e =>
      window.__log({ type: 'draw.selectionchange', features: e.features?.length })
    )
    map.on('draw.update', e =>
      window.__log({ type: 'draw.update', action: e.action, features: e.features?.length })
    )
    map.on('draw.delete', e => window.__log({ type: 'draw.delete', features: e.features?.length }))
  },

  // README "Configuration" — Map Options table applied verbatim. The spec
  // asserts every option with a getter (center/zoom/bearing/pitch/limits/
  // maxBounds/world copies) against the documented values.
  'config/table-options': root => {
    const map = new Map({
      container: root,
      accessToken: apiKey,
      center: DHAKA,
      zoom: 10,
      bearing: 30,
      pitch: 45,
      minZoom: 5,
      maxZoom: 18,
      minPitch: 10,
      maxPitch: 60,
      maxBounds: [88.0, 20.5, 92.7, 26.6],
      renderWorldCopies: true,
      clickTolerance: 5,
    })
    window.__MAP__ = map
    map.on('load', () => window.__log({ type: 'load' }))
  },

  // README "Configuration" — documented defaults when nothing is passed.
  // These are the engine (maplibre v6) defaults the wrapper passes through.
  'config/defaults': root => {
    const map = new Map({
      container: root,
      accessToken: apiKey,
    })
    window.__MAP__ = map
    map.on('load', () => window.__log({ type: 'load' }))
  },

  // README "Configuration" — the Custom Styles drawOptions example,
  // verbatim from the docs (collapsed <details> block). The spec asserts
  // the custom gl-draw-* layers land in the map style.
  'config/draw-custom-styles': root => {
    const map = new Map({
      container: root,
      accessToken: apiKey,
      center: DHAKA,
      zoom: 12,
      polygon: true,
      drawOptions: {
        displayControlsDefault: true,
        controls: { polygon: true, line_string: true, point: true, trash: true },
        defaultMode: 'simple_select',
        userProperties: true,
        styles: [
          {
            id: 'gl-draw-polygon-fill',
            type: 'fill',
            filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
            paint: { 'fill-color': '#D20C0C', 'fill-opacity': 0.3 },
          },
          {
            id: 'gl-draw-polygon-stroke-active',
            type: 'line',
            filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#D20C0C', 'line-width': 2 },
          },
          {
            id: 'gl-draw-polygon-stroke-static',
            type: 'line',
            filter: ['all', ['==', '$type', 'Polygon'], ['==', 'mode', 'static']],
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#D20C0C', 'line-width': 2 },
          },
          {
            id: 'gl-draw-line-active',
            type: 'line',
            filter: ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#D20C0C', 'line-width': 3 },
          },
          {
            id: 'gl-draw-line-static',
            type: 'line',
            filter: ['all', ['==', '$type', 'LineString'], ['==', 'mode', 'static']],
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#D20C0C', 'line-width': 2 },
          },
          {
            id: 'gl-draw-point-active',
            type: 'circle',
            filter: ['all', ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
            paint: {
              'circle-radius': 8,
              'circle-color': '#D20C0C',
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff',
            },
          },
          {
            id: 'gl-draw-point-static',
            type: 'circle',
            filter: ['all', ['==', '$type', 'Point'], ['==', 'mode', 'static']],
            paint: {
              'circle-radius': 6,
              'circle-color': '#D20C0C',
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff',
            },
          },
          {
            id: 'gl-draw-vertex',
            type: 'circle',
            filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
            paint: {
              'circle-radius': 6,
              'circle-color': '#ffffff',
              'circle-stroke-width': 2,
              'circle-stroke-color': '#D20C0C',
            },
          },
          {
            id: 'gl-draw-midpoint',
            type: 'circle',
            filter: ['all', ['==', 'meta', 'midpoint'], ['==', '$type', 'Point']],
            paint: {
              'circle-radius': 4,
              'circle-color': '#D20C0C',
              'circle-stroke-width': 1,
              'circle-stroke-color': '#ffffff',
            },
          },
        ],
      },
    })
    window.__MAP__ = map
    map.on('load', () => window.__log({ type: 'load' }))
  },

  // README "Custom Layers & Sources" — GeoJSON source (point/line/polygon
  // features) with the documented circle/line/fill layers, verbatim shapes.
  'layers/sources': root => {
    const map = new Map({
      container: root,
      accessToken: apiKey,
      center: DHAKA,
      zoom: 12,
    })
    window.__MAP__ = map
    map.on('load', () => {
      window.__log({ type: 'load' })
      map.addSource('my-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: DHAKA },
              properties: { title: 'Dhaka' },
            },
            {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: [
                  [90.38, 23.81],
                  [90.4, 23.83],
                ],
              },
              properties: {},
            },
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [90.38, 23.81],
                    [90.4, 23.81],
                    [90.4, 23.83],
                    [90.38, 23.83],
                    [90.38, 23.81],
                  ],
                ],
              },
              properties: {},
            },
          ],
        },
      })
      map.addLayer({
        id: 'my-circle-layer',
        type: 'circle',
        source: 'my-source',
        filter: ['==', '$type', 'Point'],
        paint: {
          'circle-radius': 10,
          'circle-color': '#ff0000',
          'circle-opacity': 0.8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      })
      map.addLayer({
        id: 'my-line-layer',
        type: 'line',
        source: 'my-source',
        filter: ['==', '$type', 'LineString'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#0088ff', 'line-width': 3, 'line-opacity': 0.8 },
      })
      map.addLayer({
        id: 'my-fill-layer',
        type: 'fill',
        source: 'my-source',
        filter: ['==', '$type', 'Polygon'],
        paint: { 'fill-color': '#28a745', 'fill-opacity': 0.5 },
      })
      map.once('idle', () => window.__log({ type: 'layers-added' }))
    })
  },

  // Error paths: the map surfaces failures as 'error' events (or a
  // descriptive constructor throw), never as uncaught exceptions.
  'errors/bad-key': root => {
    const map = new Map({
      container: root,
      accessToken: 'definitely-not-a-real-key',
      center: DHAKA,
      zoom: 12,
    })
    window.__MAP__ = map
    map.on('error', e =>
      window.__log({ type: 'map-error', message: e?.error?.message ?? String(e?.error ?? e) })
    )
  },

  'errors/bad-style': root => {
    const map = new Map({
      container: root,
      accessToken: apiKey,
      style: 'https://map.barikoi.com/styles/definitely-missing-style/style.json',
      center: DHAKA,
      zoom: 12,
    })
    window.__MAP__ = map
    map.on('error', e =>
      window.__log({ type: 'map-error', message: e?.error?.message ?? String(e?.error ?? e) })
    )
  },

  'errors/bad-container': () => {
    try {
      new Map({
        container: 'no-such-container-exists',
        accessToken: apiKey,
        center: DHAKA,
        zoom: 12,
      })
      window.__log({ type: 'constructor-error', thrown: false })
    } catch (err) {
      window.__log({
        type: 'constructor-error',
        thrown: true,
        name: err?.name,
        message: err?.message,
      })
    }
  },

  // setStyle chain — Barikoi → Barikoi → custom URL. The helper appends the
  // key to Barikoi style URLs exactly like the constructor does. Assertions
  // live in styles.spec.ts (style.load fires + attribution survives).
  'styles/switch': root => {
    const map = new Map({
      container: root,
      accessToken: apiKey,
      center: DHAKA,
      zoom: 12,
    })
    window.__MAP__ = map
    map.on('load', () => window.__log({ type: 'load' }))
    window.__SETSTYLE__ = (name, url) => {
      const withKey = url.includes('barikoi.com/styles/') ? `${url}?key=${apiKey}` : url
      map.once('style.load', () => window.__log({ type: 'style.load', style: name }))
      map.setStyle(withKey)
    }
  },

  // Attribution hide/show — the ONLY branding toggle. Logo always renders.
  'controls/attribution-off': root => {
    const map = new Map({
      container: root,
      accessToken: apiKey,
      center: DHAKA,
      zoom: 12,
      showAttribution: false,
    })
    window.__MAP__ = map
    map.on('load', () => window.__log({ type: 'load' }))
  },

  // Markers & Popups — README "Markers & Popups" section.
  'markers/popup': root => {
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

  // README validation — runs every fenced README example (generated by
  // scripts/extract-readme-examples.mjs, run by `npm run e2e`) against the
  // built dist with a real key. Results land on window.__README_RESULTS__.
  'readme/examples': async root => {
    const { README_EXAMPLES } = await import('./readme-examples.js')
    const results = []
    const apiKey = import.meta.env.BARIKOI_API_KEY
    const main = new Map({ container: root, accessToken: apiKey, center: DHAKA, zoom: 12 })
    window.__MAP__ = main
    await new Promise(resolve => main.once('load', resolve))
    window.__log({ type: 'load' })

    for (const ex of README_EXAMPLES) {
      const created = []
      // Track self-constructed Maps so their WebGL contexts can be released.
      class TrackedMap extends Map {
        constructor(...a) {
          super(...a)
          created.push(this)
        }
      }
      const bkoigl = { ...lib, Map: TrackedMap }
      try {
        if (ex.mode === 'skip') {
          results.push({ id: ex.id, mode: ex.mode, ok: true, reason: ex.reason })
          continue
        }
        if (ex.mode === 'import') {
          // Bare specifiers resolved against the real package — proves every
          // documented import target exists and loads from dist.
          const targets = {
            'bkoi-gl': () => Promise.resolve(lib),
            'bkoi-gl/style.css': () => import('bkoi-gl/style.css'),
            // Worker entry registers itself only inside a WorkerGlobalScope
            // (instanceof gate), so importing it on the main thread is a
            // side-effect-free load check.
            'bkoi-gl/worker': () => import('bkoi-gl/worker'),
          }
          for (const line of ex.code.split('\n')) {
            const spec = line.match(/from '([^']+)'/)?.[1] || line.match(/import '([^']+)'/)?.[1]
            if (!spec) continue
            const load = targets[spec]
            if (!load) throw new Error(`unresolved import: ${spec}`)
            await load()
          }
        } else if (ex.mode === 'expression') {
          // Config/option documentation — must at minimum be valid JS.
          // Fragments start at a property key (drawOptions: {...}) — wrap.
          const wrapped = /^[{[]/.test(ex.code) ? ex.code : `{${ex.code}}`
          new Function(`return (${wrapped})`)()
        } else {
          // run / map-create: execute against the live map. Placeholder key
          // and style in README byte-identical → substituted only here.
          let code = ex.code
            .replaceAll("'YOUR_BARIKOI_API_KEY_HERE'", `'${apiKey}'`)
            .replaceAll("'YOUR_BARIKOI_API_KEY'", `'${apiKey}'`)
            .replaceAll("'YOUR_MAP_STYLE'", 'undefined')
          if (/new bkoigl\.Map\(/.test(code)) {
            const div = document.createElement('div')
            div.id = `readme-${ex.id.toLowerCase()}`
            div.style.cssText =
              'position:absolute;left:0;top:0;width:320px;height:240px;visibility:hidden'
            document.body.appendChild(div)
            code = code.replace(/container:\s*(['"])map\1/, `container: '${div.id}'`)
          }
          if (
            /getElementById\((['"])toggle-btn\1\)/.test(code) &&
            !document.getElementById('toggle-btn')
          ) {
            const btn = document.createElement('button')
            btn.id = 'toggle-btn'
            document.body.appendChild(btn)
          }
          // README blocks assume a consumer page: `map` and `bkoigl` are
          // globals and declarations persist across blocks (Example N references
          // function handleLoad from Example N-1). window.eval mirrors that.
          window.map = main
          window.bkoigl = bkoigl
          window.eval(code)
        }
        results.push({ id: ex.id, mode: ex.mode, ok: true })
      } catch (err) {
        results.push({
          id: ex.id,
          mode: ex.mode,
          ok: false,
          error: String((err && err.message) || err),
        })
      } finally {
        for (const m of created) {
          try {
            m.remove()
          } catch {
            /* already gone */
          }
        }
        document.querySelectorAll('[id^="readme-example"]')?.forEach(el => el.remove())
      }
    }
    window.__README_RESULTS__ = results
    window.__log({ type: 'readme-done' })
  },
}

export { CASES }
