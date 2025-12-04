/*
 * bkoi-gl-js Main Entry Point
 *
 * This file is the main entry point for the bkoi-gl-js library, a Maplibre GL JS
 * wrapper with Barikoi-specific mapping features. It extends the base Maplibre
 * functionality with custom Barikoi map styles, attribution controls, and drawing
 * tools.
 *
 * Key features implemented:
 * - BkoiGlMap class: Extended Map class with Barikoi integration
 * - Barikoi attribution: Custom logo and attribution controls
 * - Drawing tools: Polygon/line/point drawing using Mapbox GL Draw
 * - Configuration: Access token and API URL management
 *
 * Exports the complete bkoi-gl-js API for use in applications.
 */

// @ts-nocheck

import maplibre from "maplibre-gl";
import MapboxDraw from "maplibre-gl-draw";
import { bkoiConfig } from "./utils/config.js";
import { isBarikoiStyle } from "./utils/validator.js";
const {
  version,
  supported,
  setRTLTextPlugin,
  getRTLTextPluginStatus,
  Map,
  NavigationControl,
  GeolocateControl,
  AttributionControl,
  ScaleControl,
  FullscreenControl,
  Popup,
  Marker,
  Style,
  LngLat,
  LngLatBounds,
  Point,
  MercatorCoordinate,
  Evented,
  config,
  prewarm,
  clearPrewarmedResources,
} = maplibre;

// Extend Map
class BkoiGlMap extends Map {
  constructor(mapOptions) {
    if (
      !mapOptions.accessToken &&
      !bkoiConfig.ACCESS_TOKEN &&
      (!mapOptions.style || isBarikoiStyle(mapOptions.style))
    ) {
      console.error(
        "Please provide a valid accessToken to use Barikoi assets."
      );
    }

    super({
      ...mapOptions,
      accessToken: mapOptions.mapboxAccessToken
        ? mapOptions.mapboxAccessToken
        : null,
      attributionControl: false, // Disable default attribution control
      style: mapOptions.style
        ? isBarikoiStyle(mapOptions.style)
          ? mapOptions.style +
            "?key=" +
            (mapOptions.accessToken
              ? mapOptions.accessToken
              : bkoiConfig.ACCESS_TOKEN)
          : mapOptions.style
        : bkoiConfig.DEFAULT_STYLE +
          "?key=" +
          (mapOptions.accessToken
            ? mapOptions.accessToken
            : bkoiConfig.ACCESS_TOKEN),
    });

    // Initially remove attribution text
    const attributionOptions = {
      compact: true,
      customAttribution: "",
      // customAttribution: '© Barikoi © OpenMapTiles © OpenStreetMap contributors'
    };
    const attributionControl = new AttributionControl(attributionOptions);
    this.addControl(attributionControl, "bottom-right");

    // Make attribution links clickable after control is added
    this.once("load", () => {
      setTimeout(() => {
        const container = this.getContainer();
        const attributionContainer = container.querySelector(
          ".maplibregl-ctrl-attrib"
        );
        if (attributionContainer) {
          const inner = attributionContainer.querySelector(
            ".maplibregl-ctrl-attrib-inner"
          );
          if (inner) {
            inner.innerHTML =
              '© <a href="https://www.barikoi.com" target="_blank">Barikoi</a> © <a href="https://openmaptiles.org" target="_blank">OpenMapTiles</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>';
          }
        }
      }, 0);
    });

    // Add Barikoi Attribution
    this.on("load", () => {
      this._addBarikoiAttribution();
      // Initialize Draw if polygon drawing is enabled
      if (mapOptions.polygon) {
        this._initializeDraw(mapOptions.drawOptions || {});
      }
      // Initialize the style drawer
      if (mapOptions.styles) {
        this._initializeStyleDrawer(mapOptions.styles);
      }
    });
  }

  // Add Barikoi Attribution on Map Load
  _addBarikoiAttribution() {
    // Create clickable logo control with actual DOM elements
    const logoControl = {
      onAdd: function () {
        const container = document.createElement("a");
        container.className = "maplibregl-ctrl-logo";
        container.setAttribute("href", "https://www.barikoi.com");
        container.setAttribute("target", "_blank");
        container.setAttribute("alt", "Barikoi");

        // Create actual img element for clickability
        // const logo = document.createElement('img')
        // logo.src = 'data:image/png;base64,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'
        // logo.setAttribute('alt', 'Barikoi')

        // container.appendChild(logo)
        return container;
      },
      onRemove: function () {},
    };

    this.addControl(logoControl, "bottom-left");
  }
  // Initialize maplibre-gl-draw
  _initializeDraw(drawOptions) {
    const defaultOptions = {
      displayControlsDefault: false,
      controls: {
        polygon: true, // Enable polygon drawing by default
        trash: true,
      },
      ...drawOptions,
    };

    const draw = new MapboxDraw(defaultOptions);
    this.addControl(draw);
  }

  // Initialize Style Drawer
  _initializeStyleDrawer(styles) {
    const mapContainer = this.getContainer();

    // Create the drawer container
    const drawer = document.createElement("div");
    drawer.className = "style-drawer";
    drawer.style.maxHeight = "0"; // Initially closed

    // Create the toggle button
    const toggleButton = document.createElement("button");
    toggleButton.className = "style-drawer-toggle-button";
    toggleButton.innerHTML = "☰"; // Initial icon for closed state

    // Toggle drawer visibility
    toggleButton.addEventListener("click", () => {
      if (drawer.style.maxHeight === "0px") {
        drawer.style.maxHeight = "400px"; // Open the drawer
        toggleButton.innerHTML = "▲"; // Change icon to open state
      } else {
        drawer.style.maxHeight = "0"; // Close the drawer
        toggleButton.innerHTML = "☰"; // Change icon to closed state
      }
    });

    // Add styles to the drawer
    styles.forEach(({ style, image, name }) => {
      const styleItem = document.createElement("div");
      styleItem.className = "style-item";
      styleItem.style.position = "relative";
      styleItem.style.cursor = "pointer";
      styleItem.style.marginBottom = "10px";

      // Wrapper for image and overlay
      const wrapper = document.createElement("div");
      wrapper.style.position = "relative";
      wrapper.style.overflow = "hidden";

      // Add thumbnail (blurred image)
      const thumbnail = document.createElement("img");
      thumbnail.src = image;
      thumbnail.alt = name;
      thumbnail.style.width = "100%";
      thumbnail.style.height = "100%";
      thumbnail.style.objectFit = "cover";
      // thumbnail.style.filter = 'blur(5px)';
      thumbnail.style.transition = "transform 0.3s";

      // Add name overlay (hidden by default)
      const nameOverlay = document.createElement("div");
      nameOverlay.innerText = name;
      nameOverlay.style.position = "absolute";
      nameOverlay.style.top = "50%";
      nameOverlay.style.width = "100%";
      nameOverlay.style.height = "100%";
      nameOverlay.style.left = "50%";
      nameOverlay.style.transform = "translate(-50%, -50%)";
      nameOverlay.style.color = "#fff";
      nameOverlay.style.fontWeight = "bold";
      nameOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      // nameOverlay.style.padding = '5px 10px';
      nameOverlay.style.borderRadius = "4px";
      nameOverlay.style.display = "none"; // Initially hidden

      // Add hover effect
      styleItem.addEventListener("mouseenter", () => {
        thumbnail.style.transform = "scale(1.05)";
        nameOverlay.style.display = "block"; // Show name on hover
      });
      styleItem.addEventListener("mouseleave", () => {
        thumbnail.style.transform = "scale(1)";
        nameOverlay.style.display = "none"; // Hide name when not hovering
      });

      // Handle style change on click
      styleItem.addEventListener("click", () => {
        this.setStyle(style); // Change map style
      });

      // Append elements
      wrapper.appendChild(thumbnail);
      wrapper.appendChild(nameOverlay);
      styleItem.appendChild(wrapper);
      drawer.appendChild(styleItem);
    });

    // Append toggle button and drawer to the map container
    mapContainer.appendChild(toggleButton);
    mapContainer.appendChild(drawer);
  }
}

const exported = {
  version,
  supported,
  setRTLTextPlugin,
  getRTLTextPluginStatus,
  Map: BkoiGlMap,
  NavigationControl,
  GeolocateControl,
  AttributionControl,
  ScaleControl,
  FullscreenControl,
  Popup,
  Marker,
  Style,
  LngLat,
  LngLatBounds,
  Point,
  MercatorCoordinate,
  Evented,
  config,
  prewarm,
  clearPrewarmedResources,
  get accessToken() {
    return bkoiConfig.ACCESS_TOKEN;
  },
  /**
   * @param {string} token
   */
  set accessToken(token) {
    bkoiConfig.ACCESS_TOKEN = token;
  },
  get mapboxAccessToken() {
    return config.ACCESS_TOKEN;
  },
  /**
   * @param {string} token
   */
  set mapboxAccessToken(token) {
    config.ACCESS_TOKEN = token;
  },
  get baseApiUrl() {
    return config.API_URL;
  },
  /**
   * @param {string} url
   */
  set baseApiUrl(url) {
    config.API_URL = url;
  },
  get maxParallelImageRequests() {
    return config.MAX_PARALLEL_IMAGE_REQUESTS;
  },
  /**
   * @param {number} numRequests
   */
  set maxParallelImageRequests(numRequests) {
    config.MAX_PARALLEL_IMAGE_REQUESTS = numRequests;
  },
  workerUrl: "",
};

// Exports
export default exported;
