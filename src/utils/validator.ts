/**
 * @fileoverview Style validation utilities for bkoi-gl-js
 * @description This file contains utility functions for validating Barikoi-specific
 * map styles and URLs. It provides type-safe validation for style URLs and
 * ensures compatibility with Barikoi mapping services.

 * The validation functions are used internally by the library to:
 * - Determine if a style requires Barikoi authentication
 * - Validate style URL formats
 * - Provide fallback behavior for invalid styles
 */

/**
 * @function isBarikoiStyle
 * @description Checks if a given style URL or identifier is a Barikoi map style.
 *
 * This function validates whether a style string represents a Barikoi-hosted map style
 * by checking for Barikoi domain patterns and proper URL structure. It's used internally
 * to determine authentication requirements and style handling behavior.
 *
 * @param {string | null | undefined} style - The style URL or identifier to validate
 *
 * @returns {boolean} True if the style is a valid Barikoi style URL, false otherwise
 */
export function isBarikoiStyle(style: string | null | undefined): boolean {
  // Handle null, undefined, or non-string inputs
  if (!style || typeof style !== 'string') {
    return false
  }

  // Check if the URL contains Barikoi domain patterns
  // Supports both 'barikoi.com' and 'map.barikoi' for flexibility
  if (!style.includes('barikoi.com') && !style.includes('map.barikoi')) {
    return false
  }

  // Validate the complete Barikoi style URL pattern
  // Pattern: https://map.barikoi.com/styles/{style-name}/style.json
  // - Must start with https://map.barikoi.com/styles/
  // - Must have a style name (one or more non-slash characters)
  // - Must end with /style.json
  const barikoiStylePattern = /^https:\/\/map\.barikoi\.com\/styles\/[^/]+\/style\.json$/

  return barikoiStylePattern.test(style)
}
