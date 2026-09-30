/**
 * Globals the e2e app cases mount on `window` (tests/e2e/app/*.js) and the
 * specs read back. Without this file every `window.__*` access in the specs
 * is a TS2339 squiggle in the editor — Playwright itself never type-checks,
 * so tests ran fine regardless; this exists for humans and IDEs.
 *
 * Map/minimap/marker/draw types are kept loose (`unknown` + narrow at the
 * call site) on purpose: the app is plain JS and asserting exact engine types
 * here would duplicate src/ typing for no test value.
 */
import type { BkoiGlMap } from '../../src/index'

declare global {
  interface Window {
    /** The case's live map — mounted by every case in tests/e2e/app/cases.js. */
    __MAP__: BkoiGlMap
    /** Ordered event log the cases push to; specs wait on entries via waitForLog. */
    __LOG__: { type: string; [k: string]: unknown }[]
    /** Minimap control instance (controls/minimap cases). */
    __MINIMAP__: unknown
    /** Worker URLs captured by the init-script shim in formats.spec. */
    __WORKER_URLS__: string[]
    /** Per-block results of the README example runner (cases.js). */
    __README_RESULTS__: { id: string; mode: string; ok: boolean; error?: string; reason?: string }[]
    /** setStyle helper (styles/switch case). */
    __SETSTYLE__: (name: string, url: string) => void
    /** Marker instance (marker-popup case). */
    __MARKER__: unknown
    /** Currently drawn feature id (draw.spec). */
    __DRAW_ID__: string
  }
}

export {}
