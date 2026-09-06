import { describe, expect, test, vi } from 'vitest'
import { bkoiConfig, Map as BkoiGlMap } from 'bkoi-gl'
import exported from 'bkoi-gl'
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
  test('attribution control is added and Barikoi attribution injected on load', async () => {
    const map = await createMap()
    const positions = map._controls.map(c => c.position)
    expect(positions).toContain('bottom-right')
    expect(positions).toContain('bottom-left') // Barikoi logo control
    await sleep(10) // attribution injection runs in a setTimeout after load
    const attrib = map.getContainer().querySelector('.maplibregl-ctrl-attrib-inner')
    expect(attrib.innerHTML).toContain('Barikoi')
    map.remove()
  })

  test('injection is skipped when the attribution element is gone', async () => {
    vi.useFakeTimers()
    const map = new BkoiGlMap({
      accessToken: 'k',
      style: { version: 8, sources: {}, layers: [] },
    })
    document.body.appendChild(map.getContainer())
    map.getContainer().innerHTML = '' // strip control DOM before deferred injection
    await vi.advanceTimersByTimeAsync(20)
    expect(map.getContainer().querySelector('.maplibregl-ctrl-attrib')).toBeNull()
    vi.useRealTimers()
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
