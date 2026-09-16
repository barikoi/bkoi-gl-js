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

  // Draw API-driven ops (add/changeMode/trash) — payload contract without
  // synthetic canvas drags (see draw.spec.ts).
  'draw/api': root => {
    const map = new Map({
      container: root,
      accessToken: apiKey,
      center: DHAKA,
      zoom: 12,
      polygon: true,
      drawOptions: { controls: { polygon: true, point: true, trash: true } },
    })
    window.__MAP__ = map
    map.on('load', () => window.__log({ type: 'load' }))
    map.on('draw.modechange', e => window.__log({ type: 'draw.modechange', mode: e.mode }))
    map.on('draw.selectionchange', e =>
      window.__log({ type: 'draw.selectionchange', features: e.features?.length })
    )
    map.on('draw.update', e =>
      window.__log({ type: 'draw.update', action: e.action, features: e.features?.length })
    )
    map.on('draw.delete', e => window.__log({ type: 'draw.delete', features: e.features?.length }))
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
  'styles/setstyle': root => {
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
