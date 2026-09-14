/**
 * Registers the bundled, self-contained maplibre worker on the engine before
 * the first map is constructed — zero configuration for the consumer.
 *
 * maplibre-gl v6 loads its worker from a separate file resolved relative to
 * `import.meta.url`. When a consumer bundles this library, that sibling no
 * longer exists, so the worker 404s and tiles never parse. We inline the
 * whole worker (worker + shared chunk) and build a same-origin Blob URL from
 * it synchronously, which works in every bundler (Vite, Nuxt, SvelteKit,
 * webpack, esbuild/Angular) and in script-tag builds.
 *
 * An explicit consumer override via maplibre's `setWorkerUrl()` (or the
 * `bkoi-gl/worker` file for strict CSP `worker-src 'self'`) is always
 * respected and never second-guessed.
 */
import { getWorkerUrl, setWorkerUrl } from 'maplibre-gl'
import { BKOI_WORKER_SOURCE } from './worker-bundle.generated'

let cachedBlobUrl: string | null = null

/** @internal — test hook so the module cache doesn't leak across cases. */
export function resetWorkerUrlCache(): void {
  cachedBlobUrl = null
}

/** @internal — same-origin Blob worker from the inlined source. */
export function blobWorkerUrl(source: string = BKOI_WORKER_SOURCE): string {
  if (cachedBlobUrl) return cachedBlobUrl
  cachedBlobUrl =
    typeof URL.createObjectURL === 'function'
      ? URL.createObjectURL(new Blob([source], { type: 'text/javascript' }))
      : 'blob:bkoi-map-worker'
  return cachedBlobUrl
}

/**
 * Pure decision for which worker URL to install (or null to leave the engine
 * default alone). Extracted so every branch is unit-testable.
 * @internal
 */
export function resolveWorkerUrl(current: string, createBlobUrl: () => string): string | null {
  if (current) return null
  return createBlobUrl()
}

/**
 * Install the shipped worker on the engine unless the consumer set their own.
 * Synchronous and idempotent so it can run from the Map constructor.
 */
export function ensureWorkerUrl(
  current: string = getWorkerUrl(),
  set: (url: string) => void = setWorkerUrl,
  create: () => string = blobWorkerUrl
): void {
  const url = resolveWorkerUrl(current, create)
  if (url) set(url)
}
