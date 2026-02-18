/**
 * @fileoverview Minimap Control for bkoi-gl-js
 * @description This file implements the Minimap control that creates a small overview map
 * which syncs with the parent map's position and displays the parent's viewport boundaries.
 *
 * Features:
 * - Bidirectional movement sync between parent and minimap
 * - Optional parent rectangle overlay showing viewport boundaries
 * - Automatic style inheritance from parent map (if no style provided)
 * - Custom styles, zoom levels, and positioning
 * - Toggle button to minimize/maximize the minimap
 * - Configurable interactions control
 * - Full API access for style and layer manipulation
 * - Automatic cleanup on removal
 */

import {
  Map as MapLibreMap,
  type IControl,
  type GeoJSONSource,
  type CustomLayerInterface,
  type LayerSpecification,
  type SourceSpecification,
  type FilterSpecification,
  type StyleSpecification,
  type StyleOptions,
  type StyleSetterOptions,
  type StyleSwapOptions,
  type LineLayerSpecification,
  type FillLayerSpecification,
} from 'maplibre-gl'

import type { MinimapOptions, ParentRectConfig, MinimapInteractions } from '../types'
import appendToggleButtonToParentEl from './ToggleButton'
import { getRandomUUID } from '../utils/utils'

/**
 * Internal extended options for minimap map initialization
 */
interface MinimapInternalOptions extends MinimapOptions {
  container?: HTMLElement
  center?: [number, number]
  zoom?: number
  minZoom?: number
  maxZoom?: number
  bearing?: number
  pitch?: number
  attributionControl: boolean
  logoPosition?: string
}

/**
 * @class Minimap
 * @description A control that adds a small overview map to the main map.
 *
 * The minimap provides geographic context by showing the surrounding area
 * at a different zoom level. It syncs bidirectionally with the parent map,
 * can display a rectangle showing the parent map's current viewport, and
 * can be toggled (minimized/maximized) via a button.
 *
 * If no style is provided, the minimap will automatically use the parent map's style.
 *
 * @implements {IControl}
 * @example
 * // Using parent map's style (automatic)
 * const minimap = new Minimap({
 *   zoomAdjust: -4,
 *   position: 'bottom-right',
 * })
 * map.addControl(minimap)
 *
 * @example
 * // Using custom style
 * const minimap = new Minimap({
 *   style: 'https://map.barikoi.com/styles/barikoi-dark/style.json',
 *   zoomAdjust: -4,
 *   position: 'bottom-right',
 *   toggleable: true,
 *   initialMinimized: false,
 *   interactions: {
 *     dragPan: false,
 *     scrollZoom: false,
 *     boxZoom: false,
 *     dragRotate: false,
 *     keyboard: false,
 *     doubleClickZoom: false,
 *     touchZoomRotate: false,
 *   },
 *   parentRect: {
 *     linePaint: { 'line-color': '#FFF', 'line-width': 2 },
 *     fillPaint: { 'fill-color': '#0088FF', 'fill-opacity': 0.15 }
 *   }
 * })
 * map.addControl(minimap)
 */
export class Minimap implements IControl {
  /** Minimap configuration options */
  #options: MinimapInternalOptions

  /** The minimap instance */
  map!: MapLibreMap

  /** Reference to the parent map */
  #parentMap!: MapLibreMap

  /** Container element for the minimap */
  #container!: HTMLElement

  /** Unique ID for the minimap container */
  #id: string

  /** GeoJSON feature for parent rectangle */
  #parentRect?: GeoJSON.Feature<GeoJSON.Polygon>

  /** Whether minimap uses a different style than parent */
  #differentStyle = false

  /** Function to stop syncing maps */
  #desync?: () => void

  /** Toggle button cleanup function */
  #toggleButtonCleanup?: () => void

  /** Whether the minimap is currently minimized */
  #isMinimized = false

  /** Window resize handler reference for cleanup */
  #resizeHandler?: () => void

  /** Default interactions (all disabled) */
  static readonly #defaultInteractions: MinimapInteractions = {
    dragPan: false,
    scrollZoom: false,
    boxZoom: false,
    dragRotate: false,
    keyboard: false,
    doubleClickZoom: false,
    touchZoomRotate: false,
  }

  /**
   * @constructor
   * @description Creates a new Minimap instance.
   *
   * @param {MinimapOptions} options - Configuration options for the minimap
   */
  constructor(options: MinimapOptions = {}) {
    // Generate unique ID
    this.#id = `minimap-${getRandomUUID()}`

    // Check if a custom style is provided
    if (options.style !== undefined) {
      this.#differentStyle = true
    }

    // Merge interactions with defaults
    const interactions = {
      ...Minimap.#defaultInteractions,
      ...(options.interactions ?? {}),
    }

    // Validate CSS values for container style
    const containerStyle = this.#validateContainerStyle(options.containerStyle)

    // Set defaults and merge with user options
    this.#options = {
      // Default values
      zoomAdjust: -4,
      position: 'top-right',
      pitchAdjust: false,
      attributionControl: false,
      logoPosition: 'bottom-left',
      toggleable: true,
      initialMinimized: false,
      collapsedWidth: '29px',
      collapsedHeight: '29px',
      borderRadius: '3px',
      hideText: 'Hide minimap',
      showText: 'Show minimap',
      responsive: true,
      responsiveWidth: '20vw',
      responsiveHeight: '20vh',
      minWidth: '200px',
      minHeight: '150px',
      maxWidth: '400px',
      maxHeight: '300px',
      interactions,
      // User-provided options
      ...options,
      containerStyle,
    } as MinimapInternalOptions

    // Handle zoom locking
    if (options.lockZoom !== undefined) {
      this.#options.minZoom = options.lockZoom
      this.#options.maxZoom = options.lockZoom
    }

    this.#isMinimized = this.#options.initialMinimized ?? false
  }

  /**
   * @method onAdd
   * @description Called when the control is added to the map.
   *
   * Creates the minimap container, initializes the map instance, sets up
   * the toggle button (if enabled), configures interactions, sets up
   * the parent rectangle overlay (if configured), and establishes the
   * bidirectional sync between parent and minimap.
   *
   * @param {MapLibreMap} parentMap - The parent map instance
   * @returns {HTMLElement} The control container element
   */
  onAdd(parentMap: MapLibreMap): HTMLElement {
    this.#parentMap = parentMap

    // Create the container element
    this.#container = this.#createContainer()

    this.#options.container = this.#container
    this.#options.zoom = parentMap.getZoom() + (this.#options.zoomAdjust ?? -4)
    this.#options.center ??= parentMap.getCenter().toArray() as [number, number]
    this.#options.bearing = parentMap.getBearing()
    this.#options.pitch = this.#options.pitchAdjust ? parentMap.getPitch() : 0

    // If no style was provided, use the parent map's style
    if (!this.#differentStyle) {
      this.#options.style = parentMap.getStyle()
    }

    // Create the minimap instance using raw MapLibre Map (no logo/attribution)
    this.map = new MapLibreMap(
      this.#options as unknown as ConstructorParameters<typeof MapLibreMap>[0]
    )

    // Fix size issue: the DOM doesn't properly update in time
    this.map.once('style.load', () => {
      this.map.resize()
    })

    // Initialize features after map loads
    this.map.once('load', () => {
      this.#configureInteractions()
      this.#addParentRect(this.#options.parentRect)
      this.#desync = this.#syncMaps()
      this.#setupToggleButton()
      this.#setupResponsiveSizing()
    })

    return this.#container
  }

  /**
   * @method onRemove
   * @description Called when the control is removed from the map.
   *
   * Cleans up by stopping the sync, removing the toggle button, and removing the DOM elements.
   *
   * @returns {void}
   */
  onRemove(): void {
    // Clean up window resize handler
    if (this.#resizeHandler) {
      window.removeEventListener('resize', this.#resizeHandler)
      this.#resizeHandler = undefined
    }
    this.#toggleButtonCleanup?.()
    this.#desync?.()
    this.#container.remove()
  }

  /**
   * @private
   * @method #createContainer
   * @description Creates the minimap container element with proper styling.
   *
   * @returns {HTMLElement} The created container element
   */
  #createContainer(): HTMLElement {
    const container = document.createElement('div')
    container.id = this.#id
    container.className =
      'maplibregl-ctrl maplibregl-ctrl-group maplibregl-ctrl-minimap custom-ctrl-minimap'

    // Apply minimized state if needed
    if (this.#isMinimized) {
      container.classList.add('minimized')
    }

    // Create inline styles
    const styleEl = document.createElement('style')
    styleEl.innerHTML = this.#getContainerStyles()
    container.appendChild(styleEl)

    // Apply custom container styles
    if (this.#options.containerStyle) {
      for (const [key, value] of Object.entries(this.#options.containerStyle)) {
        container.style.setProperty(key, value)
      }
    }

    // When starting minimized, override inline width/height so collapsed dimensions apply
    if (this.#isMinimized) {
      container.style.width = this.#options.collapsedWidth || '29px'
      container.style.height = this.#options.collapsedHeight || '29px'
    }

    // Add context menu prevention
    const preventDefault = (e: Event) => e.preventDefault()
    container.addEventListener('contextmenu', preventDefault)

    return container
  }

  /**
   * @private
   * @method #getContainerStyles
   * @description Generates CSS styles for the minimap container.
   *
   * @returns {string} CSS styles as a string
   */
  #getContainerStyles(): string {
    const width = this.#options.containerStyle?.width || '400px'
    const height = this.#options.containerStyle?.height || '300px'
    const collapsedWidth = this.#options.collapsedWidth || '29px'
    const collapsedHeight = this.#options.collapsedHeight || '29px'
    const borderRadius = this.#options.borderRadius || '3px'

    return `
      #${this.#id}.custom-ctrl-minimap {
        cursor: default !important;
        box-shadow: 0 1px 5px rgba(0, 0, 0, 0.65);
        transition: width 0.6s ease-in, height 0.6s ease-in, border-color 0s ease-in;
        border-style: solid;
        border-radius: ${borderRadius};
        border-width: 4px;
        border-color: white;
        width: ${width};
        height: ${height};
        overflow: hidden;
        background: #fff;
        position: relative;
      }

      #${this.#id}.minimized {
        border-radius: 3px !important;
        width: ${collapsedWidth};
        height: ${collapsedHeight};
      }

      #${this.#id} canvas {
        width: 100% !important;
        height: 100% !important;
        display: block;
      }

      @media (prefers-color-scheme: dark) {
        #${this.#id}.custom-ctrl-minimap {
          border-color: hsl(0, 0%, 15.2%);
        }
      }
    `
  }

  /**
   * @private
   * @method #validateContainerStyle
   * @description Validates CSS property values for container style.
   *
   * @param style - The container style object to validate
   * @returns Validated container style object
   */
  #validateContainerStyle(style?: Record<string, string>): Record<string, string> {
    const defaults = {
      border: '1px solid #000',
      width: '400px',
      height: '300px',
    }

    if (!style) {
      return defaults
    }

    const validated: Record<string, string> = {}

    // Validate width
    if (style.width) {
      validated.width = CSS.supports('width', style.width) ? style.width : defaults.width
    } else {
      validated.width = defaults.width
    }

    // Validate height
    if (style.height) {
      validated.height = CSS.supports('height', style.height) ? style.height : defaults.height
    } else {
      validated.height = defaults.height
    }

    // Copy other styles as-is
    for (const [key, value] of Object.entries(style)) {
      if (key !== 'width' && key !== 'height') {
        validated[key] = value
      }
    }

    return validated
  }

  /**
   * @private
   * @method #configureInteractions
   * @description Configures map interactions based on the interactions option.
   *
   * Enables or disables specific map interactions like dragPan, scrollZoom, etc.
   * based on the user's configuration.
   *
   * @returns {void}
   */
  #configureInteractions(): void {
    const interactions = this.#options.interactions || Minimap.#defaultInteractions

    for (const [interaction, enabled] of Object.entries(interactions)) {
      if (!enabled) {
        // Type assertion needed because we're dynamically accessing methods
        const interactionMethod = interaction as keyof MinimapInteractions
        // MapLibre interactions are methods on the map instance
        const interactionObj = this.map[interactionMethod] as { disable: () => void } | undefined
        interactionObj?.disable()
      }
    }
  }

  /**
   * @private
   * @method #setupToggleButton
   * @description Sets up the toggle button if enabled.
   *
   * Creates and appends a toggle button to the minimap container that allows
   * users to minimize/maximize the minimap.
   *
   * @returns {void}
   */
  #setupToggleButton(): void {
    if (!this.#options.toggleable) {
      return
    }

    // Use position from options, or default to top-right
    const minimap_position = this.#options.position || 'top-right'

    const toggleHandler = () => {
      this.toggle()
    }

    this.#toggleButtonCleanup = appendToggleButtonToParentEl(
      {
        position: minimap_position,
        fn: toggleHandler,
        hideText: this.#options.hideText,
        showText: this.#options.showText,
        buttonConfig: this.#options.toggleButton,
      },
      this.#container
    )
  }

  /**
   * @private
   * @method #setupResponsiveSizing
   * @description Sets up responsive sizing based on window dimensions.
   *
   * Updates the minimap size dynamically when the window is resized.
   * Only applies when responsive option is true and minimap is not minimized.
   *
   * @returns {void}
   */
  #setupResponsiveSizing(): void {
    if (!this.#options.responsive) {
      return
    }

    // Calculate and apply responsive size
    const updateSize = () => {
      if (this.#isMinimized) return

      const responsiveWidth = this.#options.responsiveWidth || '20vw'
      const responsiveHeight = this.#options.responsiveHeight || '20vh'
      const minWidth = this.#options.minWidth || '200px'
      const minHeight = this.#options.minHeight || '150px'
      const maxWidth = this.#options.maxWidth || '400px'
      const maxHeight = this.#options.maxHeight || '300px'

      // Parse viewport units and calculate actual sizes
      const vw = window.innerWidth / 100
      const vh = window.innerHeight / 100

      // Calculate responsive dimensions
      let width: number
      let height: number

      // Parse responsive width
      if (responsiveWidth.endsWith('vw')) {
        width = parseFloat(responsiveWidth) * vw
      } else if (responsiveWidth.endsWith('%')) {
        width = (parseFloat(responsiveWidth) / 100) * window.innerWidth
      } else {
        width = parseFloat(responsiveWidth)
      }

      // Parse responsive height
      if (responsiveHeight.endsWith('vh')) {
        height = parseFloat(responsiveHeight) * vh
      } else if (responsiveHeight.endsWith('%')) {
        height = (parseFloat(responsiveHeight) / 100) * window.innerHeight
      } else {
        height = parseFloat(responsiveHeight)
      }

      // Parse min/max constraints
      const minW = parseFloat(minWidth)
      const minH = parseFloat(minHeight)
      const maxW = parseFloat(maxWidth)
      const maxH = parseFloat(maxHeight)

      // Apply constraints
      width = Math.max(minW, Math.min(maxW, width))
      height = Math.max(minH, Math.min(maxH, height))

      // Apply new dimensions
      this.#container.style.width = `${width}px`
      this.#container.style.height = `${height}px`

      // Trigger map resize
      this.map.resize()
      this.#setParentBounds()
    }

    // Initial size calculation
    updateSize()

    // Debounced resize handler
    let resizeTimeout: ReturnType<typeof setTimeout>
    this.#resizeHandler = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(updateSize, 100)
    }

    // Listen for window resize
    window.addEventListener('resize', this.#resizeHandler)
  }

  /**
   * @method toggle
   * @description Toggles the minimap between minimized and maximized states.
   *
   * When minimized, the minimap shrinks to a small size and stops syncing.
   * When maximized, it returns to full size and resumes syncing.
   *
   * @returns {void}
   */
  toggle(): void {
    this.#isMinimized = !this.#isMinimized

    const collapsedWidth = this.#options.collapsedWidth || '29px'
    const collapsedHeight = this.#options.collapsedHeight || '29px'

    if (this.#isMinimized) {
      this.#container.classList.add('minimized')
      // Override inline width/height so minimized dimensions apply
      this.#container.style.width = collapsedWidth
      this.#container.style.height = collapsedHeight
    } else {
      this.#container.classList.remove('minimized')
      // If responsive sizing is enabled, trigger a recalculation
      if (this.#options.responsive && this.#resizeHandler) {
        this.#resizeHandler()
      } else {
        const expandedWidth = this.#options.containerStyle?.width || '400px'
        const expandedHeight = this.#options.containerStyle?.height || '300px'
        this.#container.style.width = expandedWidth
        this.#container.style.height = expandedHeight
      }
    }

    this.#options.onToggle?.(this.#isMinimized)

    // Trigger resize after transition
    setTimeout(() => {
      this.map.resize()
      this.#setParentBounds()
    }, 600) // Match CSS transition duration
  }

  /**
   * @method isMinimized
   * @description Returns whether the minimap is currently in a minimized state.
   *
   * @returns {boolean} true if minimap is minimized, false otherwise
   */
  isMinimized(): boolean {
    return this.#isMinimized
  }

  /**
   * @method setStyle
   * @description Sets the style of the minimap.
   *
   * Only updates the minimap if it has a custom style (different from parent).
   * After style change, updates the parent rectangle if present.
   *
   * @param {string | StyleSpecification | null} style - The new style
   * @param {StyleSwapOptions & StyleOptions} options - Style options
   * @returns {void}
   */
  setStyle(
    style: null | string | StyleSpecification,
    options?: StyleSwapOptions & StyleOptions
  ): void {
    if (this.#differentStyle) {
      this.map.setStyle(style, options)
    }
    this.#setParentBounds()
  }

  /**
   * @method addLayer
   * @description Adds a layer to the minimap.
   *
   * Only adds the layer if minimap has a custom style (different from parent).
   * Updates the parent rectangle after adding.
   *
   * @param {LayerSpecification | CustomLayerInterface} layer - The layer to add
   * @param {string} beforeId - Insert layer before this ID
   * @returns {MapLibreMap} The minimap instance
   */
  addLayer(
    layer: (LayerSpecification & { source?: string | SourceSpecification }) | CustomLayerInterface,
    beforeId?: string
  ): MapLibreMap {
    if (this.#differentStyle) {
      this.map.addLayer(layer, beforeId)
    }
    this.#setParentBounds()
    return this.map
  }

  /**
   * @method moveLayer
   * @description Moves a layer in the minimap's layer stack.
   *
   * Only moves the layer if minimap has a custom style (different from parent).
   * Updates the parent rectangle after moving.
   *
   * @param {string} id - The layer ID
   * @param {string} beforeId - Insert layer before this ID
   * @returns {MapLibreMap} The minimap instance
   */
  moveLayer(id: string, beforeId?: string): MapLibreMap {
    if (this.#differentStyle) {
      this.map.moveLayer(id, beforeId)
    }
    this.#setParentBounds()
    return this.map
  }

  /**
   * @method removeLayer
   * @description Removes a layer from the minimap.
   *
   * Only removes the layer if minimap has a custom style (different from parent).
   * Updates the parent rectangle after removing.
   *
   * @param {string} id - The layer ID to remove
   * @returns {this} The minimap instance
   */
  removeLayer(id: string): this {
    if (this.#differentStyle) {
      this.map.removeLayer(id)
    }
    this.#setParentBounds()
    return this
  }

  /**
   * @method setLayerZoomRange
   * @description Sets the zoom range for a layer.
   *
   * Only sets the range if minimap has a custom style (different from parent).
   * Updates the parent rectangle after setting.
   *
   * @param {string} layerId - The layer ID
   * @param {number} minzoom - Minimum zoom level
   * @param {number} maxzoom - Maximum zoom level
   * @returns {this} The minimap instance
   */
  setLayerZoomRange(layerId: string, minzoom: number, maxzoom: number): this {
    if (this.#differentStyle) {
      this.map.setLayerZoomRange(layerId, minzoom, maxzoom)
    }
    this.#setParentBounds()
    return this
  }

  /**
   * @method setFilter
   * @description Sets the filter for a layer.
   *
   * Only sets the filter if minimap has a custom style (different from parent).
   * Updates the parent rectangle after setting.
   *
   * @param {string} layerId - The layer ID
   * @param {FilterSpecification | null} filter - The filter specification
   * @param {StyleSetterOptions} options - Style setter options
   * @returns {this} The minimap instance
   */
  setFilter(
    layerId: string,
    filter?: FilterSpecification | null,
    options?: StyleSetterOptions
  ): this {
    if (this.#differentStyle) {
      this.map.setFilter(layerId, filter, options)
    }
    this.#setParentBounds()
    return this
  }

  /**
   * @method setPaintProperty
   * @description Sets a paint property for a layer.
   *
   * Only sets the property if minimap has a custom style (different from parent).
   * Updates the parent rectangle after setting.
   *
   * @param {string} layerId - The layer ID
   * @param {string} name - The property name
   * @param {any} value - The property value
   * @param {StyleSetterOptions} options - Style setter options
   * @returns {this} The minimap instance
   */
  setPaintProperty(
    layerId: string,
    name: string,
    value: unknown,
    options?: StyleSetterOptions
  ): this {
    if (this.#differentStyle) {
      this.map.setPaintProperty(layerId, name, value as string, options)
    }
    this.#setParentBounds()
    return this
  }

  /**
   * @method setLayoutProperty
   * @description Sets a layout property for a layer.
   *
   * Only sets the property if minimap has a custom style (different from parent).
   * Updates the parent rectangle after setting.
   *
   * @param {string} layerId - The layer ID
   * @param {string} name - The property name
   * @param {any} value - The property value
   * @param {StyleSetterOptions} options - Style setter options
   * @returns {this} The minimap instance
   */
  setLayoutProperty(
    layerId: string,
    name: string,
    value: unknown,
    options?: StyleSetterOptions
  ): this {
    if (this.#differentStyle) {
      this.map.setLayoutProperty(layerId, name, value as string, options)
    }
    this.#setParentBounds()
    return this
  }

  /**
   * @method setGlyphs
   * @description Sets the glyph URL for the map.
   *
   * Only sets the glyphs if minimap has a custom style (different from parent).
   * Updates the parent rectangle after setting.
   *
   * @param {string | null} glyphsUrl - The glyphs URL
   * @param {StyleSetterOptions} options - Style setter options
   * @returns {this} The minimap instance
   */
  setGlyphs(glyphsUrl: string | null, options?: StyleSetterOptions): this {
    if (this.#differentStyle) {
      this.map.setGlyphs(glyphsUrl, options)
    }
    this.#setParentBounds()
    return this
  }

  /**
   * @private
   * @method #addParentRect
   * @description Adds the parent rectangle overlay to the minimap.
   *
   * Creates a GeoJSON source and line/fill layers to display the parent
   * map's viewport boundaries. Only adds layers if paint properties are provided.
   *
   * @param {ParentRectConfig} rect - Configuration for the rectangle appearance
   * @returns {void}
   */
  #addParentRect(rect?: ParentRectConfig): void {
    // Skip if no configuration or no paint properties
    if (rect === undefined || (rect.linePaint === undefined && rect.fillPaint === undefined)) {
      return
    }

    // Initialize the rectangle geometry
    this.#parentRect = {
      type: 'Feature',
      properties: {
        name: 'parentRect',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[], [], [], [], []]],
      },
    }

    // Add the GeoJSON source
    this.map.addSource('parentRect', {
      type: 'geojson',
      data: this.#parentRect,
    })

    // Add line layer for outline
    if (rect.lineLayout !== undefined || rect.linePaint !== undefined) {
      this.map.addLayer({
        id: 'parentRectOutline',
        type: 'line',
        source: 'parentRect',
        layout: {
          ...rect.lineLayout,
        },
        paint: {
          'line-color': '#FFF',
          'line-width': 1,
          'line-opacity': 0.85,
          ...rect.linePaint,
        },
      } as LineLayerSpecification)
    }

    // Add fill layer for interior
    if (rect.fillPaint !== undefined) {
      this.map.addLayer({
        id: 'parentRectFill',
        type: 'fill',
        source: 'parentRect',
        layout: {},
        paint: {
          'fill-color': '#08F',
          'fill-opacity': 0.135,
          ...rect.fillPaint,
        },
      } as FillLayerSpecification)
    }

    this.#setParentBounds()
  }

  /**
   * @private
   * @method #setParentBounds
   * @description Updates the parent rectangle geometry based on current viewport.
   *
   * Calculates the geographic coordinates of the parent map's viewport corners
   * and updates the GeoJSON source data to display the rectangle.
   */
  #setParentBounds(): void {
    if (this.#parentRect === undefined || this.#isMinimized) return

    const { devicePixelRatio } = window
    const canvas = this.#parentMap.getCanvas()
    const width = canvas.width / devicePixelRatio
    const height = canvas.height / devicePixelRatio

    // Get coordinates for all four corners of the viewport
    const unproject = this.#parentMap.unproject.bind(this.#parentMap)
    const northWest = unproject([0, 0])
    const northEast = unproject([width, 0])
    const southWest = unproject([0, height])
    const southEast = unproject([width, height])

    // Update polygon coordinates (closed ring)
    this.#parentRect.geometry.coordinates = [
      [
        southWest.toArray(),
        southEast.toArray(),
        northEast.toArray(),
        northWest.toArray(),
        southWest.toArray(),
      ],
    ]

    // Update the source data
    const source = this.map.getSource<GeoJSONSource>('parentRect')
    if (source !== undefined) {
      source.setData(this.#parentRect)
    }
  }

  /**
   * @private
   * @method #syncMaps
   * @description Establishes bidirectional sync between parent and minimap.
   *
   * Sets up event listeners on both maps to sync their position, zoom, bearing,
   * and pitch. When one map moves, the other follows with appropriate adjustments.
   *
   * The sync works by:
   * 1. Temporarily disabling listeners to prevent infinite loops
   * 2. Reading state from the moved map
   * 3. Applying adjusted state to the other map
   * 4. Re-enabling listeners
   *
   * @returns {() => void} Function to stop syncing (cleanup)
   */
  #syncMaps(): () => void {
    const { pitchAdjust } = this.#options

    // Callback functions for move events
    const parentCallback = () => {
      if (!this.#isMinimized) {
        sync('parent')
      }
    }
    const minimapCallback = () => {
      if (!this.#isMinimized) {
        sync('minimap')
      }
    }

    // Functions to attach/detach event listeners
    const on = () => {
      this.#parentMap.on('move', parentCallback)
      this.map.on('move', minimapCallback)
    }

    const off = () => {
      this.#parentMap.off('move', parentCallback)
      this.map.off('move', minimapCallback)
    }

    /**
     * Sync one map to the other
     * @param which - Which map triggered the sync
     */
    const sync = (which: 'parent' | 'minimap') => {
      // Disable listeners to prevent feedback loop
      off()

      // Determine source and destination
      const from = which === 'parent' ? this.#parentMap : this.map
      const to = which === 'parent' ? this.map : this.#parentMap

      // Calculate adjusted values
      const center = from.getCenter()
      const zoom = from.getZoom() + (this.#options.zoomAdjust ?? -4) * (which === 'parent' ? 1 : -1)
      const bearing = from.getBearing()
      const pitch = from.getPitch()

      // Apply to destination
      to.jumpTo({
        center,
        zoom,
        bearing,
        pitch: pitchAdjust ? pitch : 0,
      })

      // Update parent rectangle
      this.#setParentBounds()

      // Re-enable listeners
      on()
    }

    // Start listening
    on()

    // Return cleanup function
    return () => {
      off()
    }
  }
}
