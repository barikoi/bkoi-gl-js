import { describe, expect, test, vi } from 'vitest'
import { bkoiConfig, Map as BkoiGlMap } from 'bkoi-gl'
import exported from 'bkoi-gl'
import { AttributionControl } from 'maplibre-gl'
import { load } from './helpers'

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function createMap(options = {}) {
  const map = new BkoiGlMap({
    accessToken: 'test-key',
    style: { version: 8, sources: {}, layers: [] },
    ...options,
  })
  document.body.appendChild(map.getContainer())
  await load(map)
  return map
}

describe('BkoiGlMap style URL construction', () => {
  test('no style → default Barikoi style with key', async () => {
    const map = new BkoiGlMap({ accessToken: 'k1' })
    expect(map.options.style).toBe('https://map.barikoi.com/styles/barikoi-light/style.json?key=k1')
    map.remove()
  })

  test('Barikoi style URL gets key appended', async () => {
    const map = new BkoiGlMap({
      accessToken: 'k2',
      style: 'https://map.barikoi.com/styles/barikoi-dark/style.json',
    })
    expect(map.options.style).toBe('https://map.barikoi.com/styles/barikoi-dark/style.json?key=k2')
    map.remove()
  })

  test('Barikoi style falls back to global config token', async () => {
    bkoiConfig.ACCESS_TOKEN = 'global-token'
    const map = new BkoiGlMap({
      style: 'https://map.barikoi.com/styles/barikoi-dark/style.json',
    })
    expect(map.options.style).toContain('key=global-token')
    bkoiConfig.ACCESS_TOKEN = ''
    map.remove()
  })

  test('non-Barikoi style is passed through untouched', async () => {
    const map = new BkoiGlMap({ accessToken: 'k3', style: 'https://example.com/s.json' })
    expect(map.options.style).toBe('https://example.com/s.json')
    map.remove()
  })

  test('object style is passed through untouched', async () => {
    const style = { version: 8, sources: {}, layers: [] }
    const map = new BkoiGlMap({ accessToken: 'k4', style })
    expect(map.options.style).toBe(style)
    map.remove()
  })

  test('missing token for Barikoi style logs an error', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const map = new BkoiGlMap({
      style: 'https://map.barikoi.com/styles/barikoi-light/style.json',
    })
    expect(errorSpy).toHaveBeenCalledWith(
      'Please provide a valid accessToken to use Barikoi assets.'
    )
    errorSpy.mockRestore()
    map.remove()
  })

  test('no style and no tokens anywhere → default style with empty key', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const map = new BkoiGlMap({})
    expect(map.options.style).toBe('https://map.barikoi.com/styles/barikoi-light/style.json?key=')
    expect(errorSpy).toHaveBeenCalled()
    errorSpy.mockRestore()
    map.remove()
  })
})

describe('BkoiGlMap attribution', () => {
  test('attribution renders exactly one Barikoi copyright set and survives rebuilds', async () => {
    const map = await createMap()
    const positions = map._controls.map(c => c.position)
    expect(positions).toContain('bottom-right')
    expect(positions).toContain('bottom-left') // Barikoi logo control

    const inner = () => map.getContainer().querySelector('.maplibregl-ctrl-attrib-inner')

    // Exact set: one Barikoi + OMT + OSM link — no duplicates
    const links = () => [...inner().querySelectorAll('a')].map(a => a.getAttribute('href'))
    expect(links()).toContain('https://barikoi.com')
    expect(links().filter(h => h === 'https://barikoi.com')).toHaveLength(1)
    expect(inner().textContent).toContain('OpenStreetMap contributors')

    // maplibre wipes/rebuilds the inner content on styledata (setStyle/tile
    // loads) — the MutationObserver must re-apply ours. Simulate a rebuild:
    // drop in foreign content exactly like maplibre would (source attributions)
    // and let the observer fire.
    inner().innerHTML = '© <a href="https://some-source.example">SomeSource</a>'
    await new Promise(r => setTimeout(r, 50)) // MutationObserver microtask+macrotask
    expect(links()).toContain('https://barikoi.com')
    expect(links().filter(h => h === 'https://barikoi.com')).toHaveLength(1)
    expect(links()).not.toContain('https://some-source.example')

    // Style-swap regression: maplibre re-adds the hiding class WITHOUT
    // touching the inner content (momentarily empty attribution list) —
    // childList-only observation would miss it and the copyright stays
    // display:none. The observer must clear the class on the class-only toggle.
    const attrib = map.getContainer().querySelector('.maplibregl-ctrl-attrib')
    attrib.classList.add('maplibregl-attrib-empty')
    await new Promise(r => setTimeout(r, 50))
    expect(attrib.classList.contains('maplibregl-attrib-empty')).toBe(false)

    // The empty-hiding class is cleared once our markup is present
    expect(attrib.classList.contains('maplibregl-attrib-empty')).toBe(false)
    map.remove()
  })

  test('attribution is always-expanded (compact: false) — copyright stays visible', async () => {
    const map = await createMap()
    const attrib = map._controls.find(c => c.position === 'bottom-right')
    expect(attrib?.control?.options?.compact).toBe(false)
    map.remove()
  })

  test('missing attribution _container is tolerated (defensive guard)', async () => {
    // `_container` is a maplibre private; a future engine version that stops
    // exposing it must not break construction — the observer setup is skipped.
    const onAdd = vi.spyOn(AttributionControl.prototype, 'onAdd').mockImplementation(function () {
      return document.createElement('div') // element, but no _container
    })
    try {
      const map = await createMap()
      expect(onAdd).toHaveBeenCalled()
      expect(map.getContainer().querySelector('.maplibregl-ctrl-attrib-inner')).toBe(null)
      map.remove()
    } finally {
      onAdd.mockRestore()
    }
  })

  test('logo is added at construction — later bottom-left controls stack above it', async () => {
    // Logo before load: maplibre inserts bottom-corner controls above existing
    // ones, so the construction-time logo anchors the very bottom-left corner.
    const map = new BkoiGlMap({
      accessToken: 'k',
      style: { version: 8, sources: {}, layers: [] },
    })
    document.body.appendChild(map.getContainer())
    const positions = map._controls.map(c => c.position)
    expect(positions).toContain('bottom-left') // before any load event
    const logo = map.getContainer().querySelector('a.maplibregl-ctrl-logo')
    expect(logo).toBeTruthy()
    expect(logo.getAttribute('aria-label')).toBe('Barikoi logo')
    map.remove()
  })

  test('maplibre watermark is force-disabled; Barikoi logo is the only logo', async () => {
    const map = new BkoiGlMap({
      accessToken: 'k',
      style: { version: 8, sources: {}, layers: [] },
    })
    expect(map.options.maplibreLogo).toBe(false)
    expect(map.options.attributionControl).toBe(false)
    map.remove()
  })

  test('showAttribution:false hides the attribution but never the logo', async () => {
    const map = new BkoiGlMap({
      accessToken: 'k',
      style: { version: 8, sources: {}, layers: [] },
      showAttribution: false,
    })
    document.body.appendChild(map.getContainer())
    const positions = map._controls.map(c => c.position)
    expect(positions).not.toContain('bottom-right') // attribution control skipped
    expect(positions).toContain('bottom-left') // logo always present
    expect(map.getContainer().querySelector('.maplibregl-ctrl-attrib')).toBeNull()
    expect(map.getContainer().querySelector('a.maplibregl-ctrl-logo')).toBeTruthy()
    map.remove()
  })

  test('injection is skipped when the inner element is gone', async () => {
    vi.useFakeTimers()
    const map = new BkoiGlMap({
      accessToken: 'k',
      style: { version: 8, sources: {}, layers: [] },
    })
    document.body.appendChild(map.getContainer())
    map.getContainer().querySelector('.maplibregl-ctrl-attrib-inner')?.remove()
    await vi.advanceTimersByTimeAsync(20)
    const attrib = map.getContainer().querySelector('.maplibregl-ctrl-attrib')
    expect(attrib).toBeTruthy() // outer survived, inner was not re-created
    expect(attrib.querySelector('.maplibregl-ctrl-attrib-inner')).toBeNull()
    vi.useRealTimers()
  })
})

describe('BkoiGlMap draw integration', () => {
  test('polygon option initializes draw and getDraw returns it', async () => {
    const map = await createMap({
      polygon: true,
      drawOptions: { defaultMode: 'simple_select' },
    })
    expect(map.getDraw()).toBeDefined()
    expect(map.getDraw().getMode()).toBe('simple_select')
    map.remove()
  })

  test('no polygon option leaves draw undefined', async () => {
    const map = await createMap()
    expect(map.getDraw()).toBeUndefined()
    map.remove()
  })

  test.each([
    ['draw.create', true],
    ['draw.update', true],
    ['draw.delete', true],
    ['draw.selectionchange', true],
    ['draw.modechange', true],
    ['draw.create', false],
    ['draw.update', false],
    ['draw.delete', false],
    ['draw.selectionchange', false],
    ['draw.modechange', false],
  ])('%s resets cursor only in simple_select mode (simple=%s)', async (event, simple) => {
    const map = await createMap({ polygon: true })
    if (!simple) map.getDraw().changeMode('draw_polygon')
    map.getCanvas().style.cursor = 'crosshair'
    map.fire(event)
    expect(map.getCanvas().style.cursor).toBe(simple ? '' : 'crosshair')
    map.remove()
  })
})

describe('BkoiGlMap style drawer', () => {
  const styles = [
    {
      name: 'Light',
      style: 'https://map.barikoi.com/styles/barikoi-light/style.json',
      image: 'https://example.com/light.png',
    },
    {
      name: 'Dark',
      style: 'https://map.barikoi.com/styles/barikoi-dark/style.json',
      image: 'https://example.com/dark.png',
    },
  ]

  test('styles option mounts drawer with items', async () => {
    const map = await createMap({ styles })
    const container = map.getContainer()
    expect(container.querySelector('.style-drawer')).toBeTruthy()
    expect(container.querySelector('.style-drawer-toggle-button')).toBeTruthy()
    const names = Array.from(container.querySelectorAll('.style-item')).map(el => el.textContent)
    expect(names.join(' ')).toContain('Light')
    expect(names.join(' ')).toContain('Dark')
    map.remove()
  })

  test('toggle button opens and closes the drawer', async () => {
    const map = await createMap({ styles })
    const container = map.getContainer()
    const drawer = container.querySelector('.style-drawer')
    const toggle = container.querySelector('.style-drawer-toggle-button')
    expect(drawer.style.maxHeight).toBe('0px')
    toggle.click()
    expect(drawer.style.maxHeight).toBe('400px')
    toggle.click()
    expect(drawer.style.maxHeight).toBe('0px')
    map.remove()
  })

  test('style item hover shows/hides name overlay and click switches style', async () => {
    const map = await createMap({ styles })
    const item = map.getContainer().querySelectorAll('.style-item')[0]
    const overlay = item.querySelector('img + div') // nameOverlay (thumbnail sibling)
    item.dispatchEvent(new Event('mouseenter'))
    expect(overlay.style.display).toBe('block')
    item.dispatchEvent(new Event('mouseleave'))
    expect(overlay.style.display).toBe('none')
    item.click()
    expect(map.getStyle()).toBe(styles[0].style)
    map.remove()
  })
})

describe('BkoiGlMap minimap option', () => {
  test('minimap option adds a Minimap control at the given position', async () => {
    const map = await createMap({ minimap: { toggleable: false, position: 'bottom-left' } })
    await sleep(10) // initializeMinimap imports the control dynamically
    const entry = map._controls.find(c => c.control.constructor.name === 'Minimap')
    expect(entry).toBeDefined()
    expect(entry.position).toBe('bottom-left')
    map.remove()
  })

  test('minimap option defaults to top-right position', async () => {
    const map = await createMap({ minimap: { toggleable: false } })
    await sleep(10)
    const entry = map._controls.find(c => c.control.constructor.name === 'Minimap')
    expect(entry.position).toBe('top-right')
    map.remove()
  })
})

describe('exported accessors', () => {
  test('accessToken getter/setter proxies bkoiConfig', () => {
    exported.accessToken = 'via-setter'
    expect(exported.accessToken).toBe('via-setter')
    expect(bkoiConfig.ACCESS_TOKEN).toBe('via-setter')
    exported.accessToken = ''
  })
})
