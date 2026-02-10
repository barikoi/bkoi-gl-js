/**
 * @fileoverview Toggle Button for Minimap Control
 * @description Creates and manages a toggle button for minimizing/maximizing the minimap.
 */

import type { ControlPosition } from 'maplibre-gl'
import { getRandomUUID } from '../utils/utils'
import type { ToggleButtonConfig } from '../types'

/**
 * Toggle button configuration options.
 */
export interface ToggleButtonOptions {
  /** The position of the toggle button (determines button rotation/positioning) */
  position: ControlPosition
  /** Callback function to execute when the button is clicked */
  fn: () => void
  /** Tooltip text for when minimap is expanded */
  hideText?: string
  /** Tooltip text for when minimap is minimized */
  showText?: string
  /** Custom button configuration (icon, className, style) */
  buttonConfig?: ToggleButtonConfig
}

/**
 * Default SVG icon for the toggle button (arrow pointing down/left).
 */
const DEFAULT_ICON = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path d="M17.6 18L8 8.4V17H6V5h12v2H9.4l9.6 9.6l-1.4 1.4Z" />
</svg>`

/**
 * Creates and appends a toggle button to a parent node.
 *
 * @param props - Toggle button configuration
 * @param parentNode - The parent DOM element to append the button to
 * @returns A cleanup function that removes the button and its event listeners
 *
 * @throws {Error} If invalid arguments are provided
 *
 * @example
 * ```typescript
 * const cleanup = appendToggleButtonToParentEl({
 *   position: 'top-right',
 *   fn: () => console.log('toggled'),
 *   hideText: 'Hide minimap',
 *   showText: 'Show minimap',
 *   buttonConfig: {
 *     icon: '<svg>...</svg>',
 *     className: 'my-custom-button',
 *     style: { background: 'red' }
 *   }
 * }, minimapContainer)
 *
 * // Later, to cleanup:
 * cleanup()
 * ```
 */
export default function appendToggleButtonToParentEl(
  props: ToggleButtonOptions,
  parentNode: HTMLElement
): () => void {
  if (!props.position || !props.fn || !parentNode) {
    throw new Error('Invalid arguments: position, fn, and parentNode are required')
  }

  const el = document.createElement('button')
  const el_id = 'btn-' + getRandomUUID()

  // Use custom icon or default
  const iconSvg = props.buttonConfig?.icon || DEFAULT_ICON
  el.innerHTML = iconSvg

  el.setAttribute('id', el_id)
  el.setAttribute('type', 'button')
  el.setAttribute('aria-label', props.hideText || 'Hide minimap')

  // Add custom class name if provided
  if (props.buttonConfig?.className) {
    const classes = props.buttonConfig.className.split(' ')
    classes.forEach(cls => el.classList.add(cls))
  }

  // Add position-specific class
  switch (props.position) {
    case 'top-left':
      el.classList.add('minimap-toggle-display-top-left')
      break
    case 'bottom-left':
      el.classList.add('minimap-toggle-display-bottom-left')
      break
    case 'top-right':
      el.classList.add('minimap-toggle-display-top-right')
      break
    case 'bottom-right':
      el.classList.add('minimap-toggle-display-bottom-right')
      break
  }

  // Build custom styles string
  let customStyles = ''

  if (props.buttonConfig?.style) {
    for (const [key, value] of Object.entries(props.buttonConfig.style)) {
      customStyles += '  ' + key + ': ' + value + ';\n'
    }
  }

  // Get custom options with defaults
  const iconBackgroundColor = props.buttonConfig?.iconBackgroundColor || 'black'
  const hoverColor = props.buttonConfig?.hoverColor || '#e5e7e3'
  const enableRotation = props.buttonConfig?.enableRotation !== false // Default true
  const customRotationAngle = props.buttonConfig?.rotationAngle
  const minimizedRotationAngle = customRotationAngle !== undefined ? customRotationAngle : -180

  // Determine rotation angles based on position
  let rotationBottomRight = -180
  let rotationBottomLeft = -90
  let rotationTopLeft = 0
  let rotationTopRight = 90

  // If custom rotation angle is provided, use it for all positions
  if (customRotationAngle !== undefined) {
    rotationBottomRight = customRotationAngle
    rotationBottomLeft = customRotationAngle
    rotationTopLeft = customRotationAngle
    rotationTopRight = customRotationAngle
  }

  // Build position-specific rotation styles
  let positionStyles = ''
  if (enableRotation) {
    positionStyles = `
    /* Position and rotation based on control position */
    button#${el_id}.minimap-toggle-display-bottom-right {
      rotate: ${rotationBottomRight}deg;
      left: 0;
      top: 0;
    }

    button#${el_id}.minimap-toggle-display-bottom-left {
      rotate: ${rotationBottomLeft}deg;
      right: 0;
      top: 0;
    }

    button#${el_id}.minimap-toggle-display-top-left {
      rotate: ${rotationTopLeft}deg;
      bottom: 0;
      right: 0;
    }

    button#${el_id}.minimap-toggle-display-top-right {
      rotate: ${rotationTopRight}deg;
      bottom: 0;
      left: 0;
    }`
  } else {
    // No rotation, just positioning
    positionStyles = `
    /* Position without rotation */
    button#${el_id}.minimap-toggle-display-bottom-right {
      left: 0;
      top: 0;
    }

    button#${el_id}.minimap-toggle-display-bottom-left {
      right: 0;
      top: 0;
    }

    button#${el_id}.minimap-toggle-display-top-left {
      bottom: 0;
      right: 0;
    }

    button#${el_id}.minimap-toggle-display-top-right {
      bottom: 0;
      left: 0;
    }`
  }

  // Create style element
  const styleEl = document.createElement('style')
  styleEl.innerHTML = `
    button#${el_id} {
      border-radius: 0 !important;
      color: black;
      background-color: ${iconBackgroundColor};
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease-in;
      position: absolute;
      width: 24px;
      height: 24px;
      z-index: 2;
      padding: 0;
${customStyles}
    }

    button#${el_id}:hover {
      background-color: ${hoverColor} !important;
    }

    button#${el_id}:focus {
      outline: none;
    }

${positionStyles}

    /* Minimized state styling */
    .minimized > button#${el_id} {
      border-radius: 0 !important;
    }

    button#${el_id} > * {
      transition: transform 0.5s ease-in;
    }

    button#${el_id} svg {
      fill: white;
      width: 16px;
      height: 16px;
    }

    .minimized > button#${el_id} > * {
      transform: rotate(${minimizedRotationAngle}deg);
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      button#${el_id} {
        background-color: ${iconBackgroundColor};
        color: white;
      }

      button#${el_id}:hover {
        background-color: ${hoverColor} !important;
      }

      button#${el_id}:focus {
        outline: none;
      }

      button#${el_id} > svg {
        fill: white;
      }
    }
  `

  // Click handler
  const clickHandler = () => {
    props.fn()
    // Update aria-label based on minimized state
    const isMinimized = parentNode.classList.contains('minimized')
    el.setAttribute(
      'aria-label',
      isMinimized ? props.showText || 'Show minimap' : props.hideText || 'Hide minimap'
    )
  }

  el.addEventListener('click', clickHandler)

  // Append elements
  document.head.appendChild(styleEl)
  parentNode.appendChild(el)

  // Return cleanup function
  return () => {
    el.removeEventListener('click', clickHandler)
    styleEl.remove()
    parentNode.removeChild(el)
  }
}
