/*
 * bkoi-gl-js Configuration
 *
 * This file contains the default configuration settings for the bkoi-gl-js library,
 * including the Barikoi access token and default map style URL.
 *
 * The configuration is used throughout the library to manage API access and
 * default styling options.
 */

/**
 * @typedef {Object} BkoiConfig
 * @property {string|null} ACCESS_TOKEN
 * @property {string} DEFAULT_STYLE
 */

/**
 * Barikoi configuration object
 * @type {BkoiConfig}
 */
export const bkoiConfig = {
    ACCESS_TOKEN: null,
    DEFAULT_STYLE: 'https://map.barikoi.com/styles/osm-liberty/style.json'
}