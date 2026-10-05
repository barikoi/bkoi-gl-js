import { afterEach, describe, expect, test, vi } from 'vitest'
import {
  blobWorkerUrl,
  ensureWorkerUrl,
  resetWorkerUrlCache,
  resolveWorkerUrl,
} from '../../src/worker-setup'

afterEach(() => {
  resetWorkerUrlCache()
  vi.unstubAllGlobals()
})

describe('resolveWorkerUrl', () => {
  test('returns null when the consumer set an override', () => {
    const create = vi.fn(() => 'blob:x')
    expect(resolveWorkerUrl('https://other.example.com/worker.mjs', create)).toBeNull()
    expect(create).not.toHaveBeenCalled()
  })

  test('creates the blob worker when there is no override', () => {
    const create = vi.fn(() => 'blob:x')
    expect(resolveWorkerUrl('', create)).toBe('blob:x')
  })
})

describe('blobWorkerUrl', () => {
  test('uses URL.createObjectURL when available and caches the result', () => {
    const createObjectURL = vi.fn(() => 'blob:mock')
    vi.stubGlobal('URL', { createObjectURL })
    expect(blobWorkerUrl('source')).toBe('blob:mock')
    expect(blobWorkerUrl('source')).toBe('blob:mock')
    expect(createObjectURL).toHaveBeenCalledTimes(1)
  })

  test('falls back to a placeholder without createObjectURL', () => {
    vi.stubGlobal('URL', { createObjectURL: undefined })
    expect(blobWorkerUrl('source')).toBe('blob:bkoi-map-worker')
  })
})

describe('ensureWorkerUrl', () => {
  test('installs the worker when there is no override', () => {
    const set = vi.fn()
    ensureWorkerUrl('', set, () => 'blob:x')
    expect(set).toHaveBeenCalledWith('blob:x')
  })

  test('leaves an explicit consumer override untouched', () => {
    const set = vi.fn()
    ensureWorkerUrl('https://other.example.com/worker.mjs', set, () => 'blob:x')
    expect(set).not.toHaveBeenCalled()
  })

  test('is safe to call with the real module defaults', () => {
    expect(() => ensureWorkerUrl()).not.toThrow()
  })
})
