/**
 * Typed payloads for the `draw.*` events emitted by the bundled
 * maplibre-gl-draw instance (enabled via the `polygon` map option / DrawControl).
 *
 * maplibre's `MapEventType` union does not know about these events, so without
 * this file `map.on('draw.create', …)` fails to compile (TS2769 + implicit any)
 * even though the events fire at runtime. The extended map type is wired into
 * `BkoiGlMap.on/once/off` overloads in src/index.ts.
 */
import type { MapEventType, MapLayerEventType, Listener, Subscription } from 'maplibre-gl'
import type { Feature } from 'geojson'

/** Emitted when one or more features are created by the draw tools. */
export interface BkoiDrawCreateEvent {
  features: Feature[]
}

/** Emitted when one or more features are updated (moved, scaled, rotated, coordinates/properties changed). */
export interface BkoiDrawUpdateEvent {
  features: Feature[]
  action: 'change_coordinates' | 'change_properties' | 'move' | 'scale' | 'rotate'
}

/** Emitted when one or more features are deleted via the draw tools. */
export interface BkoiDrawDeleteEvent {
  features: Feature[]
}

/** Emitted when the draw selection changes. */
export interface BkoiDrawSelectionChangeEvent {
  features: Feature[]
}

/** Emitted when the draw mode changes (e.g. `simple_select` ⇄ `draw_polygon`). */
export interface BkoiDrawModeChangeEvent {
  mode: string
  opts?: Record<string, unknown>
}

/** Emitted when the state of the draw toolbar buttons changes. */
export interface BkoiDrawActionableEvent {
  actions: {
    trash: boolean
    combineFeatures: boolean
    uncombineFeatures: boolean
  }
}

/** Emitted after every draw-mode render pass; carries no payload. */
export type BkoiDrawRenderEvent = Record<string, never>

/** Emitted when features are combined into one Multi* feature. */
export interface BkoiDrawCombineEvent {
  createdFeatures: Feature[]
  deletedFeatures: Feature[]
}

/** Emitted when a Multi* feature is split back into its parts. */
export interface BkoiDrawUncombineEvent {
  createdFeatures: Feature[]
  deletedFeatures: Feature[]
}

/**
 * The full event-name → payload map accepted by `BkoiGlMap.on/once/off`:
 * every maplibre `Map` event plus the nine `draw.*` events.
 */
export type BkoiMapEventType = MapEventType & {
  'draw.create': BkoiDrawCreateEvent
  'draw.update': BkoiDrawUpdateEvent
  'draw.delete': BkoiDrawDeleteEvent
  'draw.selectionchange': BkoiDrawSelectionChangeEvent
  'draw.modechange': BkoiDrawModeChangeEvent
  'draw.actionable': BkoiDrawActionableEvent
  'draw.render': BkoiDrawRenderEvent
  'draw.combine': BkoiDrawCombineEvent
  'draw.uncombine': BkoiDrawUncombineEvent
}

export type { MapEventType, MapLayerEventType, Listener, Subscription }
