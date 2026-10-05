import { describe, expect, test, vi } from 'vitest'
import appendToggleButtonToParentEl from '../../src/controls/ToggleButton'

function mount(props, parentNode) {
  const parent = parentNode ?? document.createElement('div')
  document.body.appendChild(parent)
  const cleanup = appendToggleButtonToParentEl(
    { position: 'top-right', fn: () => {}, ...props },
    parent
  )
  return { parent, cleanup, button: parent.querySelector('button') }
}

describe('appendToggleButtonToParentEl', () => {
  test('throws on invalid arguments', () => {
    expect(() =>
      appendToggleButtonToParentEl({ position: null, fn: () => {} }, document.createElement('div'))
    ).toThrow(/Invalid arguments/)
    expect(() =>
      appendToggleButtonToParentEl({ position: 'top-right' }, document.createElement('div'))
    ).toThrow(/Invalid arguments/)
    expect(() =>
      appendToggleButtonToParentEl({ position: 'top-right', fn: () => {} }, null)
    ).toThrow(/Invalid arguments/)
  })

  test.each(['top-left', 'bottom-left', 'top-right', 'bottom-right'])(
    'position %s gets its position class and rotation styles',
    position => {
      const { button, cleanup } = mount({ position })
      expect(button.classList.contains(`minimap-toggle-display-${position}`)).toBe(true)
      expect(button.getAttribute('aria-label')).toBe('Hide minimap')
      expect(button.innerHTML).toContain('<svg')
      cleanup()
    }
  )

  test('default aria-label falls back when hideText missing', () => {
    const { button, cleanup } = mount({})
    expect(button.getAttribute('title')).toBe('Hide minimap')
    cleanup()
  })

  test('custom icon, className, and style are applied', () => {
    const { button, cleanup } = mount({
      buttonConfig: {
        icon: '<span data-testid="custom-icon"></span>',
        className: 'one two',
        style: { background: 'red', 'z-index': '9' },
      },
    })
    expect(button.querySelector('[data-testid="custom-icon"]')).toBeTruthy()
    expect(button.classList.contains('one')).toBe(true)
    expect(button.classList.contains('two')).toBe(true)
    const styleEl = [...document.head.querySelectorAll('style')].at(-1) // injected <style>
    expect(styleEl.textContent).toContain('background: red')
    cleanup()
  })

  test('enableRotation false omits rotate rules; custom rotationAngle applies to all positions', () => {
    const a = mount({ buttonConfig: { enableRotation: false } })
    const aStyle = [...document.head.querySelectorAll('style')].at(-1)
    expect(aStyle.textContent).not.toContain('rotate:')
    a.cleanup()

    const b = mount({ buttonConfig: { rotationAngle: -90 } })
    const bStyle = [...document.head.querySelectorAll('style')].at(-1)
    expect(bStyle.textContent).toContain('rotate: -90deg')
    b.cleanup()
  })

  test('custom colors flow into the injected stylesheet', () => {
    const { cleanup } = mount({
      buttonConfig: { iconBackgroundColor: '#123456', hoverColor: '#abcdef' },
    })
    const style = [...document.head.querySelectorAll('style')].at(-1)
    expect(style.textContent).toContain('#123456')
    expect(style.textContent).toContain('#abcdef')
    cleanup()
  })

  test('click invokes fn and swaps tooltip for minimized state', () => {
    const fn = vi.fn()
    const { parent, button, cleanup } = mount({ fn, hideText: 'Collapse', showText: 'Expand' })
    button.click()
    expect(fn).toHaveBeenCalledTimes(1)
    expect(button.getAttribute('aria-label')).toBe('Collapse') // parent not minimized

    parent.classList.add('minimized')
    button.click()
    expect(fn).toHaveBeenCalledTimes(2)
    expect(button.getAttribute('aria-label')).toBe('Expand')
    expect(button.getAttribute('title')).toBe('Expand')
    cleanup()
  })

  test('default hideText falls back on click while expanded', () => {
    const fn = vi.fn()
    const { button, cleanup } = mount({ fn })
    button.click()
    expect(fn).toHaveBeenCalledTimes(1)
    expect(button.getAttribute('aria-label')).toBe('Hide minimap')
    expect(button.getAttribute('title')).toBe('Hide minimap')
    cleanup()
  })

  test('tooltip falls back to defaults when texts missing and parent minimized', () => {
    const { parent, button, cleanup } = mount({ hideText: undefined, showText: undefined })
    parent.classList.add('minimized')
    button.click()
    expect(button.getAttribute('aria-label')).toBe('Show minimap')
    cleanup()
  })

  test('cleanup removes button and stylesheet, stops invoking fn', () => {
    const fn = vi.fn()
    const { parent, button, cleanup } = mount({ fn })
    const styleCount = document.head.querySelectorAll('style').length
    cleanup()
    expect(parent.contains(button)).toBe(false)
    expect(document.head.querySelectorAll('style').length).toBe(styleCount - 1)
    button.click() // detached listener
    expect(fn).toHaveBeenCalledTimes(0)
  })
})
