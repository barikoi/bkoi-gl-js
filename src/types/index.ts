/**
 * @fileoverview TypeScript type definitions for bkoi-gl-js
 * @description This file contains all TypeScript interfaces and types used throughout
 * the bkoi-gl-js library for type safety and better developer experience.

 * The types defined here extend MapLibre GL JS types with Barikoi-specific features
 * including drawing tools, style management, and authentication.
 */

import type { MapOptions } from 'maplibre-gl'
import type MapboxDraw from 'maplibre-gl-draw'

/**
 * @interface BkoiMapOptions
 * @description Extended map options for bkoi-gl-js with Barikoi-specific features.
 *
 * This interface extends MapLibre GL's MapOptions while replacing 'style' and 'accessToken'
 * with Barikoi-specific alternatives and adding new features like polygon drawing and style management.
 *
 * @extends {Omit<MapOptions, 'style' | 'accessToken'>}
 */
export interface BkoiMapOptions extends Omit<MapOptions, 'style' | 'accessToken'> {
  /**
   * Barikoi API access token for authentication with Barikoi services.
   * Required when using Barikoi map styles or features.
   *
   * @type {string}
   * @optional
   */
  accessToken?: string

  /**
   * Mapbox access token for compatibility with Mapbox-based features.
   * Used when integrating with Mapbox services alongside Barikoi.
   *
   * @type {string}
   * @optional
   */
  mapboxAccessToken?: string

  /**
   * Map style URL or Barikoi style identifier.
   * Can be a full Barikoi style URL or a style identifier that gets resolved to a full URL.
   *
   * @type {string}
   * @optional
   */
  style?: string

  /**
   * Enable polygon drawing tools using Mapbox GL Draw.
   * When true, initializes drawing controls for creating polygons, lines, and points.
   *
   * @type {boolean}
   * @optional
   * @default false
   */
  polygon?: boolean

  /**
   * Configuration options for Mapbox GL Draw when polygon drawing is enabled.
   * Allows customization of drawing controls, modes, and behavior.
   *
   * @type {Partial<MapboxDraw.MapboxDrawOptions>}
   * @optional
   */
  drawOptions?: Partial<MapboxDraw.MapboxDrawOptions>

  /**
   * Array of style configurations for the interactive style drawer.
   * Each style config defines a map style option that users can switch between.
   *
   * @type {StyleConfig[]}
   * @optional
   */
  styles?: StyleConfig[]
}

/**
 * @interface StyleConfig
 * @description Configuration for a single map style in the style drawer.
 *
 * Defines the properties needed to display and switch to a specific map style
 * in the interactive style selection UI.
 */
export interface StyleConfig {
  /**
   * The map style URL or identifier.
   * Can be a full style URL or a style identifier that gets resolved.
   *
   * @type {string}
   */
  style: string

  /**
   * URL to a thumbnail image representing the style.
   * Used in the style drawer UI to visually represent each style option.
   *
   * @type {string}
   */
  image: string

  /**
   * Human-readable display name for the style.
   * Shown in the style drawer UI and tooltips.
   *
   * @type {string}
   */
  name: string
}

/**
 * @interface BkoiConfig
 * @description Global configuration object for bkoi-gl-js.
 *
 * Contains application-wide settings that can be modified at runtime.
 * Used internally by the library for managing authentication and defaults.
 */
export interface BkoiConfig {
  /**
   * Global Barikoi API access token.
   * Used as fallback when no accessToken is provided in map options.
   *
   * @type {string | null}
   * @default null
   */
  ACCESS_TOKEN: string | null

  /**
   * Default map style URL used when no style is specified.
   * Points to the standard Barikoi light style.
   *
   * @type {string}
   * @default 'https://map.barikoi.com/styles/barikoi-light/style.json'
   */
  DEFAULT_STYLE: string
}
