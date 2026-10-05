/**
 * @fileoverview TypeScript type definitions for bkoi-gl-js
 * @description This file contains all TypeScript interfaces and types used throughout
 * the bkoi-gl-js library for type safety and better developer experience.

 * The types defined here extend MapLibre GL JS types with Barikoi-specific features
 * including drawing tools, style management, and authentication.
 */

import type {
  MapOptions,
  ControlPosition,
  FillLayerSpecification,
  LineLayerSpecification,
  StyleSpecification,
} from 'maplibre-gl'
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
   * Show the Barikoi attribution control (bottom-right). Default `true`.
   * The Barikoi logo (bottom-left) is NOT toggleable — it always renders
   * (same contract as react-bkoi-gl).
   */
  showAttribution?: boolean

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

  /**
   * Enable and configure the minimap control.
   * When provided, creates a small overview map that syncs with the main map.
   *
   * @type {MinimapOptions}
   * @optional
   */
  minimap?: MinimapOptions
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

/**
 * @interface ParentRectConfig
 * @description Configuration for the parent rectangle overlay on the minimap.
 *
 * Defines the visual styling of the rectangle that shows the parent map's viewport
 * boundaries on the minimap. The rectangle can have both a line (outline) and fill style.
 */
export interface ParentRectConfig {
  /**
   * Layout properties for the line layer (outline of the parent rectangle).
   * Controls line visibility, cap style, join style, dash array, etc.
   *
   * @type {LineLayerSpecification["layout"]}
   * @optional
   * @example { 'visibility': 'visible' }
   */
  lineLayout?: LineLayerSpecification['layout']

  /**
   * Paint properties for the line layer (outline of the parent rectangle).
   * Controls line color, width, opacity, blur, etc.
   *
   * @type {LineLayerSpecification["paint"]}
   * @optional
   * @example { 'line-color': '#FFFFFF', 'line-width': 2, 'line-opacity': 0.8 }
   */
  linePaint?: LineLayerSpecification['paint']

  /**
   * Paint properties for the fill layer (interior of the parent rectangle).
   * Controls fill color, opacity, pattern, etc.
   *
   * @type {FillLayerSpecification["paint"]}
   * @optional
   * @example { 'fill-color': '#0088FF', 'fill-opacity': 0.2 }
   */
  fillPaint?: FillLayerSpecification['paint']
}

/**
 * The `MapInteractions` type is a union of the possible interactions that can be
 * disabled/enabled on the minimap.
 */
export type MapInteractions =
  | 'dragPan'
  | 'scrollZoom'
  | 'boxZoom'
  | 'dragRotate'
  | 'keyboard'
  | 'doubleClickZoom'
  | 'touchZoomRotate'

/**
 * Configuration for minimap interactions.
 * Each property controls whether the interaction is enabled (true) or disabled (false).
 */
export type MinimapInteractions = Record<MapInteractions, boolean>

/**
 * @interface ToggleButtonConfig
 * @description Configuration for customizing the minimap toggle button appearance.
 *
 * Allows users to customize the default toggle button with their own icon, CSS classes,
 * inline styles, hover colors, rotation behavior, and icon background color.
 * The button maintains its default behavior (minimizing/maximizing the minimap)
 * while having a custom appearance.
 *
 * If not provided, a default button with standard styling is used.
 *
 * @example
 * ```typescript
 * const minimap = new Minimap({
 *   toggleButton: {
 *     icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>',
 *     className: 'my-custom-toggle-button',
 *     style: {
 *       background: 'linear-gradient(to right, #667eea 0%, #764ba2 100%)',
 *       color: 'white',
 *       border: 'none',
 *       borderRadius: '4px'
 *     },
 *     iconBackgroundColor: 'black',
 *     hoverColor: '#FF5722',
 *     enableRotation: true,
 *     rotationAngle: 45
 *   }
 * })
 * ```
 */
export interface ToggleButtonConfig {
  /**
   * Custom SVG icon for the toggle button.
   * Should be a valid SVG string. The icon will rotate on toggle.
   *
   * @type {string}
   * @optional
   * @example '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>'
   */
  icon?: string

  /**
   * Custom CSS class name(s) to add to the toggle button.
   * Multiple classes should be space-separated.
   *
   * @type {string}
   * @optional
   * @example 'my-custom-toggle-button active'
   */
  className?: string

  /**
   * Custom inline styles to apply to the toggle button.
   * These styles will override the default button styles.
   *
   * @type {Record<string, string>}
   * @optional
   * @example { background: 'red', color: 'white', border: 'none' }
   */
  style?: Record<string, string>

  /**
   * Background color of the toggle button icon.
   * Default is 'black'.
   *
   * @type {string}
   * @optional
   * @default 'black'
   * @example '#FF0000' or 'rgb(255, 0, 0)' or 'black'
   */
  iconBackgroundColor?: string

  /**
   * Hover color for the toggle button.
   * Controls the background color when hovering over the button.
   * Default is '#e5e7e3'.
   *
   * @type {string}
   * @optional
   * @default '#e5e7e3'
   * @example '#FF5722' or 'rgb(255, 87, 34)' or 'lightblue'
   */
  hoverColor?: string

  /**
   * Whether to enable rotation of the button icon based on position.
   * When true, the button rotates according to its position (top-right, bottom-left, etc.).
   * When false, the button maintains its default orientation.
   *
   * @type {boolean}
   * @optional
   * @default true
   */
  enableRotation?: boolean

  /**
   * Custom rotation angle in degrees.
   * Overrides the default position-based rotation when set.
   *
   * @type {number}
   * @optional
   * @example 45 (for 45 degrees) or -90 (for -90 degrees)
   */
  rotationAngle?: number
}

/**
 * @interface MinimapOptions
 * @description Configuration options for the Minimap control.
 *
 * The minimap creates a small overview map that syncs with the parent map's position,
 * showing the current viewport in a larger geographic context. It supports custom
 * styles, zoom levels, toggle button, interactions control, and an optional parent rectangle overlay.
 *
 * @example
 * ```typescript
 * const map = new Map({
 *   container: 'map',
 *   accessToken: 'your-key',
 *   minimap: {
 *     style: 'https://map.barikoi.com/styles/barikoi-dark/style.json',
 *     zoomAdjust: -4,
 *     position: 'bottom-right',
 *     toggleable: true,
 *     toggleButton: {
 *       icon: '<svg>...</svg>',
 *       className: 'my-custom-button',
 *       style: { background: 'red' }
 *     },
 *     initialMinimized: false,
 *     interactions: {
 *       dragPan: false,
 *       scrollZoom: false,
 *       boxZoom: false,
 *       dragRotate: false,
 *       keyboard: false,
 *       doubleClickZoom: false,
 *       touchZoomRotate: false,
 *     },
 *     parentRect: {
 *       linePaint: { 'line-color': '#FFF', 'line-width': 2 },
 *       fillPaint: { 'fill-color': '#0088FF', 'fill-opacity': 0.15 }
 *     }
 *   }
 * })
 * ```
 */
export interface MinimapOptions {
  /**
   * Initial center coordinates [lng, lat] for the minimap.
   * If not provided, the minimap syncs with the parent map's center on load.
   *
   * @type {[number, number]}
   * @optional
   */
  center?: [number, number]

  /**
   * Barikoi API access token for authentication.
   * Required when using Barikoi map styles.
   *
   * @type {string}
   * @optional
   */
  accessToken?: string

  /**
   * Map style for the minimap.
   * Can be:
   * - A full style URL (e.g., 'https://map.barikoi.com/styles/barikoi-dark/style.json?key=xxx')
   * - A style specification object
   *
   * If not provided, the minimap will use the same style as the parent map.
   *
   * @type {string | StyleSpecification}
   * @optional
   */
  style?: string | StyleSpecification

  /**
   * Zoom level difference between the parent and minimap.
   *
   * Positive value: minimap is zoomed out more than parent
   * Negative value: minimap is zoomed in more than parent
   *
   * For example, if parent is at zoom 10 and zoomAdjust is -4:
   * - Minimap will be at zoom 6
   *
   * @type {number}
   * @optional
   * @default -4
   */
  zoomAdjust?: number

  /**
   * Lock the minimap to a specific zoom level.
   * When set, the minimap's zoom will not change based on the parent map.
   *
   * @type {number}
   * @optional
   * @example 8
   */
  lockZoom?: number

  /**
   * Whether to sync the pitch (tilt) with the parent map.
   *
   * - true: Minimap pitch matches parent map pitch
   * - false: Minimap always stays flat (pitch: 0)
   *
   * @type {boolean}
   * @optional
   * @default false
   */
  pitchAdjust?: boolean

  /**
   * Custom CSS properties for the minimap container.
   * Allows customization of size, border, margin, etc.
   *
   * @type {Record<string, string>}
   * @optional
   * @example { width: '320px', height: '240px', border: '2px solid #333' }
   */
  containerStyle?: Record<string, string>

  /**
   * Position of the minimap control on the map.
   *
   * @type {ControlPosition}
   * @optional
   * @default 'top-right'
   */
  position?: ControlPosition

  /**
   * Configuration for the parent rectangle overlay.
   * Shows the parent map's viewport boundaries on the minimap.
   *
   * @type {ParentRectConfig}
   * @optional
   */
  parentRect?: ParentRectConfig

  /**
   * Whether the minimap can be toggled (minimized/maximized) via a button.
   *
   * @type {boolean}
   * @optional
   * @default true
   */
  toggleable?: boolean

  /**
   * Custom toggle button configuration.
   * Allows customization of the button's appearance while maintaining default behavior.
   *
   * @type {ToggleButtonConfig}
   * @optional
   */
  toggleButton?: ToggleButtonConfig

  /**
   * Whether the minimap should start in a minimized state.
   * Only applies when toggleable is true.
   *
   * @type {boolean}
   * @optional
   * @default false
   */
  initialMinimized?: boolean

  /**
   * Width of the minimap when minimized.
   *
   * @type {string}
   * @optional
   * @default '29px'
   */
  collapsedWidth?: string

  /**
   * Height of the minimap when minimized.
   *
   * @type {string}
   * @optional
   * @default '29px'
   */
  collapsedHeight?: string

  /**
   * Border radius of the minimap container.
   *
   * @type {string}
   * @optional
   * @default '3px'
   */
  borderRadius?: string

  /**
   * Minimap interactions configuration.
   * Controls which map interactions are enabled/disabled on the minimap.
   * By default, all interactions are disabled for a cleaner overview experience.
   *
   * @type {MinimapInteractions}
   * @optional
   * @default { dragPan: false, scrollZoom: false, boxZoom: false, dragRotate: false, keyboard: false, doubleClickZoom: false, touchZoomRotate: false }
   */
  interactions?: Partial<MinimapInteractions>

  /**
   * Callback invoked when the minimap is toggled (minimized or expanded).
   * Use this to sync external state (e.g. React) with the minimap state.
   *
   * @type {(isMinimized: boolean) => void}
   * @optional
   */
  onToggle?: (isMinimized: boolean) => void

  /**
   * Text to show on the toggle button when minimap is expanded (tooltip).
   *
   * @type {string}
   * @optional
   * @default 'Hide minimap'
   */
  hideText?: string

  /**
   * Text to show on the toggle button when minimap is minimized (tooltip).
   *
   * @type {string}
   * @optional
   * @default 'Show minimap'
   */
  showText?: string

  /**
   * Enable responsive sizing based on window dimensions.
   * When true, the minimap will resize dynamically when the window is resized.
   *
   * @type {boolean}
   * @optional
   * @default true
   */
  responsive?: boolean

  /**
   * Responsive width as a CSS value (e.g., '20vw', '30%', '300px').
   * Only applies when responsive is true.
   *
   * @type {string}
   * @optional
   * @default '20vw'
   */
  responsiveWidth?: string

  /**
   * Responsive height as a CSS value (e.g., '20vh', '30%', '200px').
   * Only applies when responsive is true.
   *
   * @type {string}
   * @optional
   * @default '20vh'
   */
  responsiveHeight?: string

  /**
   * Minimum width constraint for responsive sizing.
   *
   * @type {string}
   * @optional
   * @default '200px'
   */
  minWidth?: string

  /**
   * Minimum height constraint for responsive sizing.
   *
   * @type {string}
   * @optional
   * @default '150px'
   */
  minHeight?: string

  /**
   * Maximum width constraint for responsive sizing.
   *
   * @type {string}
   * @optional
   * @default '400px'
   */
  maxWidth?: string

  /**
   * Maximum height constraint for responsive sizing.
   *
   * @type {string}
   * @optional
   * @default '300px'
   */
  maxHeight?: string
}
