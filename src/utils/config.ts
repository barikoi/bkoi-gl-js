/**
 * @fileoverview Configuration management for bkoi-gl-js
 * @description This file provides global configuration settings for the bkoi-gl-js library,
 * including API access tokens and default style URLs. It serves as a centralized
 * configuration store that can be modified at runtime.

 * The configuration is used throughout the library for:
 * - Barikoi API authentication
 * - Default map style selection
 * - Fallback values when options aren't provided
 */

/**
 * @interface BkoiConfig
 * @description Interface defining the structure of the global bkoi-gl-js configuration.
 *
 * This interface specifies the available configuration properties that can be
 * modified globally to affect library behavior across all map instances.
 */
export interface BkoiConfig {
  /**
   * Global Barikoi API access token for authentication.
   *
   * This token is used as a fallback when no `accessToken` is provided
   * in individual map options. It's recommended to set this globally
   * for applications using Barikoi services.
   *
   * @type {string | null}
   * @default null
   */
  ACCESS_TOKEN: string | null;

  /**
   * Default map style URL used when no style is specified.
   *
   * This is the fallback style that gets loaded when a map is created
   * without explicit style configuration. Points to the standard
   * Barikoi light style which provides good readability and features.
   *
   * @type {string}
   * @default 'https://map.barikoi.com/styles/barikoi-light/style.json'
   */
  DEFAULT_STYLE: string;
}

/**
 * @const {BkoiConfig} bkoiConfig
 * @description Global configuration object for bkoi-gl-js.
 *
 * This is the main configuration instance that can be imported and modified
 * to set global defaults for the library. Changes to this object affect
 * all map instances created afterward.
 */
export const bkoiConfig: BkoiConfig = {
  /**
   * Initially null - must be set by the application
   */
  ACCESS_TOKEN: null,

  /**
   * Barikoi Light style - good balance of readability and features
   */
  DEFAULT_STYLE: 'https://map.barikoi.com/styles/barikoi-light/style.json'
};
