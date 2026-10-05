import { expect, test } from 'vitest'
import { mapEvent, mountMap, unmount, waitFor } from './utils'

const styles = [
  { name: 'Light', style: 'https://map.barikoi.com/styles/barikoi-light/style.json' },
  { name: 'Dark', style: 'https://map.barikoi.com/styles/barikoi-dark/style.json' },
]

test('styles option mounts a style drawer with a toggle button', async () => {
  const { map, container } = mountMap({ styles })
  await mapEvent(map, 'load')
  await waitFor(() => !!container.querySelector('.style-drawer'))
  expect(container.querySelector('.style-drawer-toggle-button')).toBeTruthy()
  map.remove()
  unmount(container)
})

test('drawer lists every configured style', async () => {
  const { map, container } = mountMap({ styles })
  await mapEvent(map, 'load')
  await waitFor(() => !!container.querySelector('.style-drawer'))
  const labels = Array.from(container.querySelectorAll('.style-drawer *')).map(el =>
    el.textContent?.trim()
  )
  expect(labels).toContain('Light')
  expect(labels).toContain('Dark')
  map.remove()
  unmount(container)
})
