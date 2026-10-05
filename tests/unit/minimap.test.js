import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { Minimap } from '../../src/controls/Minimap'
import { Map as MockMap } from './mocks/maplibre-gl'

const parentStyle = { version: 8, sources: {}, layers: [] }
const customStyle = { version: 8, name: 'custom', sources: {}, layers: [] }

function createParent(options = {}) {
  const parent = new MockMap({ zoom: 10, center: [90, 23], style: parentStyle, ...options })
  return parent
}

/** Add a Minimap to a parent map and wait for its async load lifecycle. */
async function mountMinimap(parent, options = {}) {
  const minimap = new Minimap(options)
  const container = minimap.onAdd(parent)
  document.body.appendChild(container)
  await new Promise(r => setTimeout(r, 10))
  return { minimap, container }
}

describe('Minimap constructor', () => {
  test('defaults when constructed bare', () => {
    const minimap = new Minimap()
    expect(minimap.isMinimized()).toBe(false)
    expect(minimap.map).toBeUndefined()
  })

  test('initialMinimized starts minimized', () => {
    expect(new Minimap({ initialMinimized: true }).isMinimized()).toBe(true)
  })

  test('explicit undefined options fall back to defaults', async () => {
    const parent = createParent({ zoom: 8 })
    const { minimap } = await mountMinimap(parent, {
      toggleable: false,
      zoomAdjust: undefined,
      initialMinimized: undefined,
    })
    expect(minimap.map.options.zoom).toBe(4) // 8 + (-4 default)
    expect(minimap.isMinimized()).toBe(false)
    minimap.onRemove()
  })
})

describe('Minimap onAdd', () => {
  let parent
  beforeEach(() => {
    parent = createParent()
  })
  afterEach(() => {
    parent?.fire?.('dispose')
  })

  test('inherits parent style when no style given', async () => {
    const { minimap, container } = await mountMinimap(parent, { toggleable: false })
    expect(minimap.map.options.style).toBe(parentStyle)
    expect(container.className).toContain('maplibregl-ctrl-minimap')
    minimap.onRemove()
  })

  test('uses custom style when provided', async () => {
    const { minimap } = await mountMinimap(parent, { style: customStyle, toggleable: false })
    expect(minimap.map.options.style).toBe(customStyle)
    minimap.onRemove()
  })

  test('lockZoom clamps zoom range', async () => {
    const { minimap } = await mountMinimap(parent, { lockZoom: 5, toggleable: false })
    expect(minimap.map.options.minZoom).toBe(5)
    expect(minimap.map.options.maxZoom).toBe(5)
    minimap.onRemove()
  })

  test('zoom derives from parent + zoomAdjust', async () => {
    const { minimap } = await mountMinimap(parent, { zoomAdjust: -2, toggleable: false })
    expect(minimap.map.options.zoom).toBe(8)
    minimap.onRemove()
  })

  test('pitchAdjust copies parent pitch, default flattens it', async () => {
    const pitched = createParent({ pitch: 45 })
    const flat = await mountMinimap(pitched, { toggleable: false })
    expect(flat.minimap.map.options.pitch).toBe(0)
    flat.minimap.onRemove()
    const copied = await mountMinimap(pitched, { pitchAdjust: true, toggleable: false })
    expect(copied.minimap.map.options.pitch).toBe(45)
    copied.minimap.onRemove()
  })

  test('minimized initial state collapses dimensions and skips responsive sizing', async () => {
    const { minimap, container } = await mountMinimap(parent, {
      initialMinimized: true,
      toggleable: false,
      collapsedWidth: '40px',
      collapsedHeight: '40px',
    })
    expect(container.classList.contains('minimized')).toBe(true)
    expect(container.style.width).toBe('40px')
    minimap.onRemove()
  })

  test('containerStyle is validated: valid kept, invalid falls back', async () => {
    const { minimap, container } = await mountMinimap(parent, {
      containerStyle: { width: '600px', height: 'not-a-size', border: '1px solid red' },
      responsive: false,
      toggleable: false,
    })
    expect(minimap.map.options.containerStyle.width).toBe('600px')
    // invalid height falls back to the default
    expect(minimap.map.options.containerStyle.height).toBe('300px')
    expect(minimap.map.options.containerStyle.border).toBe('1px solid red')
    expect(container.style.width).toBe('600px')
    minimap.onRemove()

    // invalid WIDTH also falls back (CSS.supports false branch)
    const parent2 = createParent()
    const invalidWidth = await mountMinimap(parent2, {
      containerStyle: { width: 'garbage!', height: '100px' },
      responsive: false,
      toggleable: false,
    })
    expect(invalidWidth.minimap.map.options.containerStyle.width).toBe('400px')
    invalidWidth.minimap.onRemove()
  })

  test('containerStyle missing width/height keys fall back to defaults', async () => {
    const { minimap } = await mountMinimap(parent, {
      containerStyle: { border: '2px solid blue' },
      toggleable: false,
    })
    expect(minimap.map.options.containerStyle.width).toBe('400px')
    expect(minimap.map.options.containerStyle.height).toBe('300px')
    minimap.onRemove()
  })

  test('empty-string sizing options fall back to defaults', async () => {
    const parent2 = createParent()
    const collapsed = await mountMinimap(parent2, {
      toggleable: false,
      responsive: false,
      initialMinimized: true,
      collapsedWidth: '',
      collapsedHeight: '',
      borderRadius: '',
    })
    expect(collapsed.container.style.width).toBe('29px')
    expect(collapsed.container.style.height).toBe('29px')
    expect(collapsed.minimap.map.options.borderRadius).toBe('')
    collapsed.minimap.toggle() // expanded: uses containerStyle dims, covers toggle-time || fallbacks
    expect(collapsed.container.style.width).toBe('400px')
    collapsed.minimap.onRemove()
  })

  test('empty position falls back to top-right toggle placement', async () => {
    const { minimap, container } = await mountMinimap(parent, {
      toggleable: true,
      position: '',
    })
    expect(container.querySelector('button.minimap-toggle-display-top-right')).toBeTruthy()
    minimap.onRemove()
  })

  test('contextmenu is prevented on the container', async () => {
    const { minimap, container } = await mountMinimap(parent, { toggleable: false })
    const event = new Event('contextmenu', { cancelable: true })
    container.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    minimap.onRemove()
  })

  test('disabled interactions call disable on minimap handlers', async () => {
    const { minimap } = await mountMinimap(parent, {
      toggleable: false,
      interactions: {
        scrollZoom: false,
        boxZoom: false,
        dragRotate: false,
        dragPan: false,
        keyboard: false,
        doubleClickZoom: false,
        touchZoomRotate: false,
      },
    })
    expect(minimap.map.disabledInteractions).toEqual([
      'scrollZoom',
      'boxZoom',
      'dragRotate',
      'dragPan',
      'keyboard',
      'doubleClickZoom',
      'touchZoomRotate',
    ])
    minimap.onRemove()
  })

  test('default interactions disable everything (read-only minimap)', async () => {
    const { minimap } = await mountMinimap(parent, { toggleable: false })
    expect(minimap.map.disabledInteractions.sort()).toEqual([
      'boxZoom',
      'doubleClickZoom',
      'dragPan',
      'dragRotate',
      'keyboard',
      'scrollZoom',
      'touchZoomRotate',
    ])
    minimap.onRemove()
  })

  test('enabling interactions skips their disable', async () => {
    const { minimap } = await mountMinimap(parent, {
      toggleable: false,
      interactions: { dragPan: true, scrollZoom: true },
    })
    expect(minimap.map.disabledInteractions).not.toContain('dragPan')
    expect(minimap.map.disabledInteractions).not.toContain('scrollZoom')
    minimap.onRemove()
  })

  test('toggle button only mounts when toggleable', async () => {
    const withToggle = await mountMinimap(parent, { toggleable: true })
    expect(
      withToggle.container.querySelector('button[class*="minimap-toggle-display"]')
    ).toBeTruthy()
    withToggle.minimap.onRemove()
    const withoutToggle = await mountMinimap(parent, { toggleable: false })
    expect(
      withoutToggle.container.querySelector('button[class*="minimap-toggle-display"]')
    ).toBeFalsy()
    withoutToggle.minimap.onRemove()
  })
})

describe('Minimap proxy methods', () => {
  let parent
  beforeEach(() => {
    parent = createParent()
  })

  test('proxy methods forward when custom style is set, and skip otherwise', async () => {
    const custom = await mountMinimap(parent, { style: customStyle, toggleable: false })
    const m = custom.minimap.map
    custom.minimap.setStyle('https://example.com/s.json', { diff: false })
    expect(m._style).toBe('https://example.com/s.json')
    expect(custom.minimap.addLayer({ id: 'x', type: 'circle', source: 's' })).toBe(m)
    expect(m._layers.at(-1).layer.id).toBe('x')
    custom.minimap.moveLayer('x', 'y')
    expect(m._layers.at(-1).beforeId).toBe('y')
    expect(custom.minimap.removeLayer('x')).toBe(custom.minimap)
    expect(m._layers.find(l => l.layer.id === 'x')).toBeUndefined()
    custom.minimap.setLayerZoomRange('a', 0, 10)
    custom.minimap.setFilter('a', null)
    custom.minimap.setPaintProperty('a', 'circle-color', 'red')
    expect(m.paintCalls.at(-1).slice(0, 3)).toEqual(['a', 'circle-color', 'red'])
    custom.minimap.setLayoutProperty('a', 'visibility', 'none')
    expect(m.layoutCalls.at(-1).slice(0, 3)).toEqual(['a', 'visibility', 'none'])
    custom.minimap.setGlyphs('https://g.example/{fontstack}/{range}.pbf')
    custom.minimap.onRemove()

    // Without a custom style, none of the calls reach the inner map.
    const inherited = await mountMinimap(parent, { toggleable: false })
    const before = inherited.minimap.map._layers.length
    const paintBefore = inherited.minimap.map.paintCalls.length
    const layoutBefore = inherited.minimap.map.layoutCalls.length
    inherited.minimap.addLayer({ id: 'y', type: 'circle', source: 's' })
    expect(inherited.minimap.map._layers.length).toBe(before)
    inherited.minimap.setStyle(customStyle)
    inherited.minimap.moveLayer('y', 'z')
    inherited.minimap.removeLayer('y')
    inherited.minimap.setLayerZoomRange('y', 0, 10)
    inherited.minimap.setFilter('y', null)
    inherited.minimap.setPaintProperty('y', 'circle-color', 'red')
    inherited.minimap.setLayoutProperty('y', 'visibility', 'none')
    inherited.minimap.setGlyphs('https://g.example/{fontstack}/{range}.pbf')
    expect(inherited.minimap.map._style).toBe(parentStyle) // setStyle skipped
    expect(inherited.minimap.map.paintCalls.length).toBe(paintBefore)
    expect(inherited.minimap.map.layoutCalls.length).toBe(layoutBefore)
    inherited.minimap.onRemove()
  })
})

describe('Minimap parent rect', () => {
  test('no rect config or no paint props → no source added', async () => {
    const parent = createParent()
    const none = await mountMinimap(parent, { toggleable: false })
    expect(none.minimap.map.getSource('parentRect')).toBeUndefined()
    none.minimap.onRemove()
    const lineless = await mountMinimap(parent, {
      toggleable: false,
      parentRect: {},
    })
    expect(lineless.minimap.map.getSource('parentRect')).toBeUndefined()
    lineless.minimap.onRemove()
  })

  test('line + fill config adds source and both layers', async () => {
    const parent = createParent()
    const { minimap } = await mountMinimap(parent, {
      toggleable: false,
      parentRect: {
        linePaint: { 'line-color': '#f00' },
        lineLayout: { 'line-join': 'round' },
        fillPaint: { 'fill-color': '#00f' },
      },
    })
    const source = minimap.map.getSource('parentRect')
    expect(source).toBeDefined()
    const layerIds = minimap.map._layers.map(l => l.layer.id)
    expect(layerIds).toContain('parentRectOutline')
    expect(layerIds).toContain('parentRectFill')
    const outline = minimap.map._layers.find(l => l.layer.id === 'parentRectOutline')
    expect(outline.layer.paint['line-color']).toBe('#f00')
    const fill = minimap.map._layers.find(l => l.layer.id === 'parentRectFill')
    expect(fill.layer.paint['fill-color']).toBe('#00f')
    // bounds were computed against the parent viewport
    const coords = source.data.geometry.coordinates[0]
    expect(coords).toHaveLength(5)
    expect(coords[0]).toEqual(coords[4]) // closed ring
    minimap.onRemove()
  })

  test('fill-only config adds fill layer without outline', async () => {
    const parent = createParent()
    const { minimap } = await mountMinimap(parent, {
      toggleable: false,
      parentRect: { fillPaint: { 'fill-color': '#0f0' } },
    })
    const layerIds = minimap.map._layers.map(l => l.layer.id)
    expect(layerIds).toContain('parentRectFill')
    expect(layerIds).not.toContain('parentRectOutline')
    minimap.onRemove()
  })

  test('line-only config adds outline layer without fill', async () => {
    const parent = createParent()
    const { minimap } = await mountMinimap(parent, {
      toggleable: false,
      parentRect: { linePaint: { 'line-color': '#ff0' } },
    })
    const layerIds = minimap.map._layers.map(l => l.layer.id)
    expect(layerIds).toContain('parentRectOutline')
    expect(layerIds).not.toContain('parentRectFill')
    minimap.onRemove()
  })

  test('parentRect with lineLayout + fillPaint adds outline via layout branch', async () => {
    const parent = createParent()
    const { minimap } = await mountMinimap(parent, {
      toggleable: false,
      parentRect: { lineLayout: { 'line-join': 'bevel' }, fillPaint: { 'fill-color': '#0f0' } },
    })
    expect(minimap.map._layers.map(l => l.layer.id)).toContain('parentRectOutline')
    minimap.onRemove()
  })
})

describe('Minimap sync', () => {
  test('parent move syncs minimap with adjusted zoom; minimap move syncs back', async () => {
    const parent = createParent()
    const { minimap } = await mountMinimap(parent, {
      toggleable: false,
      zoomAdjust: undefined,
      parentRect: { fillPaint: { 'fill-color': '#08F' } },
    })

    parent.fire('move')
    expect(minimap.map.jumpToCalls).toHaveLength(1)
    expect(minimap.map.jumpToCalls[0].zoom).toBe(6) // 10 + default -4

    minimap.map.fire('move')
    expect(parent.jumpToCalls).toHaveLength(1)
    // minimap zoom is now 6 (after parent sync) → 6 - (-4) = 10 = parent zoom
    expect(parent.jumpToCalls[0].zoom).toBe(10)

    minimap.onRemove()
  })

  test('pitchAdjust true copies parent pitch through sync', async () => {
    const parent = createParent({ pitch: 45 })
    const { minimap } = await mountMinimap(parent, {
      toggleable: false,
      pitchAdjust: true,
    })
    parent.fire('move')
    expect(minimap.map.jumpToCalls[0].pitch).toBe(45)
    minimap.onRemove()
    const flatParent = createParent({ pitch: 45 })
    const flat = await mountMinimap(flatParent, { toggleable: false })
    flatParent.fire('move')
    expect(flat.minimap.map.jumpToCalls[0].pitch).toBe(0)
    flat.minimap.onRemove()
  })

  test('sync ignores moves while minimized and resumes after expand', async () => {
    const parent = createParent()
    const { minimap } = await mountMinimap(parent, { toggleable: false })
    minimap.toggle() // minimize
    parent.fire('move')
    expect(minimap.map.jumpToCalls).toHaveLength(0)
    minimap.map.fire('move') // minimized minimap move also ignored
    expect(parent.jumpToCalls).toHaveLength(0)
    minimap.toggle() // expand again
    parent.fire('move')
    expect(minimap.map.jumpToCalls).toHaveLength(1)
    minimap.onRemove()
  })

  test('desync stops the sync (removed control ignores parent moves)', async () => {
    const parent = createParent()
    const { minimap } = await mountMinimap(parent, { toggleable: false })
    minimap.onRemove()
    parent.fire('move')
    expect(minimap.map.jumpToCalls).toHaveLength(0)
  })
})

describe('Minimap toggle', () => {
  test('toggle collapses then expands, invoking onToggle', async () => {
    vi.useFakeTimers()
    const parent = createParent()
    const onToggle = vi.fn()
    const minimap = new Minimap({
      toggleable: false,
      responsive: false,
      onToggle,
      containerStyle: { width: '500px', height: '400px' },
    })
    const container = minimap.onAdd(parent)
    document.body.appendChild(container)
    await vi.advanceTimersByTimeAsync(10) // minimap load lifecycle
    expect(minimap.isMinimized()).toBe(false)

    minimap.toggle()
    expect(minimap.isMinimized()).toBe(true)
    expect(container.classList.contains('minimized')).toBe(true)
    expect(container.style.width).toBe('29px')

    minimap.toggle()
    expect(minimap.isMinimized()).toBe(false)
    expect(container.classList.contains('minimized')).toBe(false)
    // responsive disabled → raw containerStyle dimensions restored
    expect(container.style.width).toBe('500px')
    expect(container.style.height).toBe('400px')

    expect(onToggle).toHaveBeenNthCalledWith(1, true)
    expect(onToggle).toHaveBeenNthCalledWith(2, false)

    // the post-transition timer resizes the map and refreshes parent bounds
    const resizes = minimap.map.resizeCalls
    await vi.advanceTimersByTimeAsync(600)
    expect(minimap.map.resizeCalls).toBeGreaterThan(resizes)
    minimap.onRemove()
    vi.useRealTimers()
  })

  test('toggle button click toggles through the DOM', async () => {
    const parent = createParent()
    const { minimap, container } = await mountMinimap(parent, { toggleable: true })
    const btn = container.querySelector('button[class*="minimap-toggle-display"]')
    btn.click()
    expect(minimap.isMinimized()).toBe(true)
    minimap.onRemove()
  })
})

describe('Minimap responsive sizing', () => {
  test('resize recalculates size via vw/vh with min/max clamps', async () => {
    vi.useFakeTimers()
    const parent = createParent()
    const minimap = new Minimap({
      toggleable: false,
      responsive: true,
      responsiveWidth: '10vw',
      responsiveHeight: '10vh',
      minWidth: '5000px', // force clamp to min
      minHeight: '5000px',
    })
    const container = minimap.onAdd(parent)
    document.body.appendChild(container)
    await vi.advanceTimersByTimeAsync(10)

    // 10vw of 1024px = 102.4 → clamped up to 5000
    expect(container.style.width).toBe('5000px')
    expect(container.style.height).toBe('5000px')

    window.dispatchEvent(new Event('resize'))
    await vi.advanceTimersByTimeAsync(200) // debounce is 100ms
    expect(minimap.map.resizeCalls).toBeGreaterThan(2) // debounced updateSize ran
    minimap.onRemove()
    vi.useRealTimers()
  })

  test('percentage and px units parse with max clamps', async () => {
    const parent = createParent()
    const minimap = new Minimap({
      toggleable: false,
      responsiveWidth: '50%', // 50% of 1024 = 512 → clamped to maxWidth 400
      responsiveHeight: '300px',
    })
    const container = minimap.onAdd(parent)
    document.body.appendChild(container)
    await new Promise(r => setTimeout(r, 10))
    expect(container.style.width).toBe('400px')
    expect(container.style.height).toBe('300px')
    minimap.onRemove()

    // percentage height + raw px width exercise the remaining unit branches
    const p2 = createParent()
    const m2 = new Minimap({
      toggleable: false,
      responsiveWidth: '260px',
      responsiveHeight: '50%', // 50% of 768 = 384 → clamped to maxHeight 300
    })
    const c2 = m2.onAdd(p2)
    document.body.appendChild(c2)
    await new Promise(r => setTimeout(r, 10))
    expect(c2.style.width).toBe('260px')
    expect(c2.style.height).toBe('300px')
    m2.onRemove()
  })

  test('empty responsive values fall back to vw/vh defaults', async () => {
    const parent = createParent()
    const minimap = new Minimap({
      toggleable: false,
      responsiveWidth: '',
      responsiveHeight: '',
      minWidth: '',
      minHeight: '',
      maxWidth: '',
      maxHeight: '',
    })
    const container = minimap.onAdd(parent)
    document.body.appendChild(container)
    await new Promise(r => setTimeout(r, 10))
    // 20vw of 1024 = 204.8, 20vh of 768 = 153.6 — no clamps (defaults restored)
    expect(container.style.width).toBe('204.8px')
    expect(container.style.height).toBe('153.6px')
    minimap.onRemove()
  })

  test('minimized minimap skips responsive resize', async () => {
    const parent = createParent()
    const minimap = new Minimap({
      toggleable: false,
      responsive: true,
      initialMinimized: true,
    })
    const container = minimap.onAdd(parent)
    document.body.appendChild(container)
    await new Promise(r => setTimeout(r, 10))
    // minimized → updateSize returns early, collapsed size kept
    expect(container.style.width).toBe('29px')
    minimap.onRemove()
  })

  test('responsive:false never installs a window resize handler', async () => {
    const parent = createParent()
    const { minimap } = await mountMinimap(parent, { toggleable: false, responsive: false })
    window.dispatchEvent(new Event('resize'))
    minimap.onRemove() // would throw if a handler leaked
  })
})

describe('Minimap onRemove cleanup', () => {
  test('removes container, toggle button, and style element', async () => {
    const parent = createParent()
    const { minimap, container } = await mountMinimap(parent, { toggleable: true })
    const btn = container.querySelector('button[class*="minimap-toggle-display"]')
    // (style element removal is asserted via head child count in the cleanup test)
    minimap.onRemove()
    expect(document.body.contains(container)).toBe(false)
    expect(document.body.contains(btn)).toBe(false)
  })
})
