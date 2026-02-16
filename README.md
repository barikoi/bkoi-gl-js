# Barikoi GL JS

[![npm version](https://img.shields.io/npm/v/bkoi-gl.svg)](https://www.npmjs.com/package/bkoi-gl)
[![npm downloads](https://img.shields.io/npm/dw/bkoi-gl)](https://www.npmjs.com/package/bkoi-gl)
[![Bundle Size](https://img.shields.io/bundlephobia/min/bkoi-gl)](https://bundlephobia.com/package/bkoi-gl)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js Version](https://img.shields.io/node/v/bkoi-gl)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Overview

Barikoi GL JS is a JavaScript library built on top of [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/), designed for seamless integration with Barikoi Maps, offering high-performance and customizable map rendering. This library is optimized for modern web applications and supports React, Next.js, and vanilla JavaScript projects.

Powered by [Barikoi - Maps for Businesses](https://barikoi.com/), this package provides tools to integrate maps and location services effortlessly.

> **Note:** For React/Next.js integrations, we recommend our [react-bkoi-gl](https://www.npmjs.com/package/react-bkoi-gl) npm library.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
  - [Map Options](#map-options)
  - [Draw Options](#draw-options)
  - [Map Events](#map-events)
    - [Map Lifecycle Events](#map-lifecycle-events)
    - [Camera Movement Events](#camera-movement-events)
    - [Mouse & Pointer Events](#mouse--pointer-events)
    - [Touch Events](#touch-events)
    - [Data & Style Events](#data--style-events)
    - [Source & Layer Events](#source--layer-events)
    - [Drawing Events](#drawing-events)
  - [Event Listener Management](#event-listener-management)
- [Markers & Popups](#markers--popups)
  - [Adding Markers](#adding-markers)
  - [Adding Popups](#adding-popups)
  - [Marker with Popup](#marker-with-popup)
- [Map Controls](#map-controls)
  - [Navigation Control](#navigation-control)
  - [Geolocate Control](#geolocate-control)
  - [Scale Control](#scale-control)
  - [Fullscreen Control](#fullscreen-control)
  - [Minimap Control](#minimap-control)
- [Camera Methods](#camera-methods)
  - [Fly To](#fly-to)
  - [Ease To](#ease-to)
  - [Jump To](#jump-to)
  - [Fit Bounds](#fit-bounds)
- [Custom Layers & Sources](#custom-layers--sources)
  - [Adding a GeoJSON Source](#adding-a-geojson-source)
  - [Adding Layers](#adding-layers)
  - [Layer Visibility](#layer-visibility)
- [Utility Methods](#utility-methods)
  - [Map State](#map-state)
  - [Interaction Handlers](#interaction-handlers)
- [Examples](#examples)
- [Documentation](#documentation)
- [Support Resources](#support-resources)
- [License](#license)

---

## Features

- **High Performance** - WebGL-based map rendering
- **Framework Support** - Easy integration with React and Next.js
- **Customizable Controls** - Flexible map controls and interactions
- **Location Services** - Support for Barikoi geolocation services
- **Lightweight** - Optimized for production use
- **Drawing Tools** - Built-in polygon, line, and point drawing
- **Minimap Control** - Synchronized overview map with customizable styling
- **Multiple Build Formats** - ESM, CJS, IIFE, and UMD
- **TypeScript Support** - Full TypeScript definitions included

---

## Getting Started

### Get Barikoi API Key

To access Barikoi's API services, you need to:

1. Register on [Barikoi Developer Dashboard](https://developer.barikoi.com/register)
2. Verify with your phone number
3. Claim your API key

Once registered, you'll be able to access the full suite of Barikoi API services. If you exceed the free usage limits, you'll need to subscribe to a paid plan.

---

## Installation

Choose the installation method that best fits your project:

### Option 1: CDN (For vanilla JavaScript or quick prototyping)

Add the following links to the `<head>` section of your HTML file:

**Using unpkg:**

```html
<link rel="stylesheet" href="https://unpkg.com/bkoi-gl@latest/dist/style/bkoi-gl.css" />
<script src="https://unpkg.com/bkoi-gl@latest/dist/iife/bkoi-gl.js"></script>
```

**Using jsDelivr:**

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bkoi-gl@latest/dist/style/bkoi-gl.css" />
<script src="https://cdn.jsdelivr.net/npm/bkoi-gl@latest/dist/iife/bkoi-gl.js"></script>
```

### Option 2: Package Manager (Recommended for React, Next.js, or bundler-based projects)

Install the package using npm:

```bash
npm install bkoi-gl
```

Or using yarn:

```bash
yarn add bkoi-gl
```

Then import the library in your JavaScript/TypeScript files:

```javascript
import { Map, Marker, FullscreenControl } from "bkoi-gl";
import "bkoi-gl/style.css";
```

> **Note:** You can also use the full path `"bkoi-gl/dist/style/bkoi-gl.css"` for backward compatibility.

---

## Quick Start

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="https://unpkg.com/bkoi-gl@latest/dist/style/bkoi-gl.css" />
    <script src="https://unpkg.com/bkoi-gl@latest/dist/iife/bkoi-gl.js"></script>
  </head>
  <body>
    <div id="map" style="width: 100%; height: 400px;"></div>
    <script>
      const map = new bkoigl.Map({
        container: "map",
        accessToken: "YOUR_BARIKOI_API_KEY_HERE",
        center: [90.3938010872331, 23.821600277500405], // Dhaka coordinates
        zoom: 10,
        polygon: true, // Enable draw polygon option
        drawOptions: {
          controls: {
            polygon: true,
            trash: true
          }
        }
      });
    </script>
  </body>
</html>
```

### React/Next.js

```typescript title=components/BasicMap.tsx
"use client";

import { useEffect, useRef } from "react";
import { Map } from "bkoi-gl";
import "bkoi-gl/style.css";

const BasicMap = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<null>(null);

  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    map.current = new Map({
      container: mapContainer.current,
      accessToken: "YOUR_BARIKOI_API_KEY_HERE",
      center: [90.39017821904588, 23.719800220780733], // Dhaka coordinates
      zoom: 10,
      polygon: true, // Enable draw polygon option
      drawOptions: {
        controls: {
          polygon: true,
          trash: true
        }
      }
    });

    // Cleanup on unmount
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "100vh",
        minHeight: "400px",
        overflow: "hidden",
      }}
    />
  );
}

export default BasicMap;
```

---

## Configuration

### Map Options

The `Map` constructor accepts an options object extending MapLibre GL JS MapOptions with Barikoi-specific additions.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `container` | string \| HTMLElement | *required* | The HTML element or ID to render the map in |
| `accessToken` | string | *required* | Your Barikoi API key for authentication |
| `style` | string | Barikoi Light | Map style URL or style identifier |
| `center` | [number, number] | `[90.3938, 23.8216]` | Initial center position [longitude, latitude] |
| `zoom` | number | `10` | Initial zoom level (0-22) |
| `bearing` | number | `0` | Initial bearing (rotation) in degrees, clockwise from north |
| `pitch` | number | `0` | Initial pitch (tilt) in degrees (0-85) |
| `minZoom` | number | `0` | Minimum zoom level |
| `maxZoom` | number | `22` | Maximum zoom level |
| `minPitch` | number | `0` | Minimum pitch level |
| `maxPitch` | number | `85` | Maximum pitch level |
| `bounds` | [number, number, number, number] | *none* | Initial map bounds as [swLng, swLat, neLng, neLat] |
| `fitBoundsOptions` | object | *none* | Options for fitBounds animation |
| `interactive` | boolean | `true` | Enable/disable map interactions (drag, zoom, rotate) |
| `pitchWithRotate` | boolean | `true` | Enable pitch with rotate gesture |
| `clickTolerance` | number | `3` | Max pixels between mouse down/up for click |
| `scrollZoom` | boolean \| object | `true` | Enable/disable scroll zoom |
| `boxZoom` | boolean | `true` | Enable/disable box zoom |
| `dragRotate` | boolean | `true` | Enable/disable drag to rotate |
| `dragPan` | boolean | `true` | Enable/disable drag to pan |
| `keyboard` | boolean | `true` | Enable/disable keyboard controls |
| `doubleClickZoom` | boolean | `true` | Enable/disable double-click zoom |
| `touchZoomRotate` | boolean \| object | `true` | Enable/disable touch zoom/rotate |
| `touchPitch` | boolean \| object | `true` | Enable/disable touch pitch |
| `antialias` | boolean | *auto* | Enable antialiasing |
| `refreshExpiredTiles` | boolean | `true` | Refresh expired tiles |
| `maxBounds` | [number, number, number, number] | *none* | Constrain map to bounds [swLng, swLat, neLng, neLat] |
| `projection` | string | `'mercator'` | Map projection ('mercator' or 'globe') |
| `renderWorldCopies` | boolean | `true` | Render multiple copies of the world |
| `locale` | object | *none* | Localization strings for UI |
| `polygon` | boolean | `false` | Enable drawing tools for polygons/lines/points |
| `drawOptions` | object | `{}` | Configuration for drawing tools |
| `minimap` | object | *none* | Configuration for minimap control |

---

### Draw Options

When `polygon: true` is set, the drawing tools are enabled. The `drawOptions` configures the available drawing controls.

#### Available Drawing Modes

| Mode | Description |
|------|-------------|
| `simple_select` | Default mode. Click to select features (default) |
| `direct_select` | Select and edit vertices of a feature |
| `draw_polygon` | Draw a polygon by clicking points |
| `draw_line_string` | Draw a line by clicking points |
| `draw_point` | Place a point marker by clicking |

#### Basic Configuration

```javascript
drawOptions: {
  // Controls which drawing tools are available
  displayControlsDefault: true,  // Show all controls by default
  controls: {
    polygon: true,        // Enable polygon drawing tool
    line_string: true,    // Enable line drawing tool
    point: true,          // Enable point marker tool
    trash: true           // Enable delete button
  },

  // Set the initial mode
  defaultMode: 'simple_select',  // Options: 'simple_select', 'direct_select', 'draw_polygon', 'draw_line_string', 'draw_point'

  // Enable custom properties on features
  userProperties: true
}
```

<details>
<summary>Custom Styles Configuration (Advanced)</summary>

You can customize the appearance of drawn features using the `styles` array:

```javascript
drawOptions: {
  displayControlsDefault: true,
  controls: {
    polygon: true,
    line_string: true,
    point: true,
    trash: true
  },
  defaultMode: 'simple_select',
  userProperties: true,

  // Custom styles for drawn features
  styles: [
    // POLYGON STYLES
    // Polygon fill (when being drawn or selected)
    {
      id: 'gl-draw-polygon-fill',
      type: 'fill',
      filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
      paint: {
        'fill-color': '#D20C0C',
        'fill-opacity': 0.3
      }
    },
    // Polygon outline (when being drawn or selected)
    {
      id: 'gl-draw-polygon-stroke-active',
      type: 'line',
      filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#D20C0C',
        'line-width': 2
      }
    },
    // Polygon outline (static/completed)
    {
      id: 'gl-draw-polygon-stroke-static',
      type: 'line',
      filter: ['all', ['==', '$type', 'Polygon'], ['==', 'mode', 'static']],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#D20C0C',
        'line-width': 2
      }
    },

    // LINE STRING STYLES
    // Line (when being drawn or selected)
    {
      id: 'gl-draw-line-active',
      type: 'line',
      filter: ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#D20C0C',
        'line-width': 3
      }
    },
    // Line (static/completed)
    {
      id: 'gl-draw-line-static',
      type: 'line',
      filter: ['all', ['==', '$type', 'LineString'], ['==', 'mode', 'static']],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#D20C0C',
        'line-width': 2
      }
    },

    // POINT STYLES
    // Point marker (when being placed or selected)
    {
      id: 'gl-draw-point-active',
      type: 'circle',
      filter: ['all', ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
      paint: {
        'circle-radius': 8,
        'circle-color': '#D20C0C',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    },
    // Point marker (static/completed)
    {
      id: 'gl-draw-point-static',
      type: 'circle',
      filter: ['all', ['==', '$type', 'Point'], ['==', 'mode', 'static']],
      paint: {
        'circle-radius': 6,
        'circle-color': '#D20C0C',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    },

    // VERTEX & MIDPOINT STYLES (for editing)
    // Vertex points (corners when editing polygon/line)
    {
      id: 'gl-draw-vertex',
      type: 'circle',
      filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
      paint: {
        'circle-radius': 6,
        'circle-color': '#ffffff',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#D20C0C'
      }
    },
    // Midpoint points (for adding new vertices)
    {
      id: 'gl-draw-midpoint',
      type: 'circle',
      filter: ['all', ['==', 'meta', 'midpoint'], ['==', '$type', 'Point']],
      paint: {
        'circle-radius': 4,
        'circle-color': '#D20C0C',
        'circle-stroke-width': 1,
        'circle-stroke-color': '#ffffff'
      }
    }
  ]
}
```

</details>

<details>
<summary>Style Filter Reference</summary>

| Filter | Description |
|--------|-------------|
| `['==', '$type', 'Polygon']` | Matches polygon features |
| `['==', '$type', 'LineString']` | Matches line features |
| `['==', '$type', 'Point']` | Matches point features |
| `['!=', 'mode', 'static']` | Feature is being drawn or selected |
| `['==', 'mode', 'static']` | Feature is completed/static |
| `['==', 'meta', 'vertex']` | Vertex points for editing |
| `['==', 'meta', 'midpoint']` | Midpoint markers for adding vertices |

</details>

---

### Map Events

Events are categorized by their purpose for easier navigation.

#### Map Lifecycle Events

Fired during the map's initialization and rendering cycle.

| Event | Description | Event Data |
|-------|-------------|------------|
| `load` | Fired when the map has finished loading all resources | - |
| `render` | Fired after the map completes a render cycle | - |
| `idle` | Fired when the map enters an idle state (no ongoing transitions) | - |
| `error` | Fired when an error occurs | `error` - Error object |

**Example:**

```javascript
map.on('load', () => {
  console.log('Map is ready for interaction');
});

map.on('error', (e) => {
  console.error('Map error:', e.error);
});
```

---

#### Camera Movement Events

Fired when the map's camera position changes (pan, zoom, rotate, pitch).

| Event | Description | Event Data |
|-------|-------------|------------|
| `movestart` | Fired when camera movement begins | - |
| `move` | Fired repeatedly during camera movement | - |
| `moveend` | Fired when camera movement ends | - |
| `zoomstart` | Fired when zoom level begins changing | - |
| `zoom` | Fired repeatedly during zoom | - |
| `zoomend` | Fired when zoom level change ends | - |
| `rotate` | Fired during rotation (bearing change) | - |
| `rotatestart` | Fired when rotation begins | - |
| `rotateend` | Fired when rotation ends | - |
| `pitch` | Fired during pitch (tilt) change | - |

**Example:**

```javascript
map.on('moveend', () => {
  const center = map.getCenter();
  const zoom = map.getZoom();
  console.log(`Map moved to [${center.lng}, ${center.lat}] at zoom ${zoom}`);
});

map.on('zoom', () => {
  console.log('Current zoom level:', map.getZoom());
});
```

---

#### Mouse & Pointer Events

Fired when users interact with the map using mouse or touch input.

| Event | Description | Event Data |
|-------|-------------|------------|
| `click` | Fired when the map is clicked | `lngLat`, `point` |
| `dblclick` | Fired when the map is double-clicked | `lngLat`, `point` |
| `mousedown` | Fired when mouse button is pressed | `lngLat`, `point` |
| `mouseup` | Fired when mouse button is released | `lngLat`, `point` |
| `mousemove` | Fired when mouse moves over the map | `lngLat`, `point` |
| `mouseover` | Fired when mouse enters the map | `lngLat`, `point` |
| `mouseout` | Fired when mouse leaves the map | `lngLat`, `point` |
| `wheel` | Fired when mouse wheel is used | - |

**Example:**

```javascript
map.on('click', (e) => {
  console.log(`Clicked at [${e.lngLat.lng}, ${e.lngLat.lat}]`);
  // Place a marker or show popup at e.lngLat
});

map.on('mousemove', (e) => {
  console.log('Mouse position:', e.lngLat);
});
```

---

#### Touch Events

Fired on touch-enabled devices.

| Event | Description | Event Data |
|-------|-------------|------------|
| `touchstart` | Fired when touch begins | `lngLat`, `point`, `touches` |
| `touchmove` | Fired during touch movement | `lngLat`, `point`, `touches` |
| `touchend` | Fired when touch ends | `lngLat`, `point`, `touches` |
| `touchcancel` | Fired when touch is interrupted | `lngLat`, `point`, `touches` |

---

#### Data & Style Events

Fired when map data or styles change.

| Event | Description | Event Data |
|-------|-------------|------------|
| `data` | Fired when any data is loaded | `dataType`, `source` |
| `sourcedata` | Fired when source data is loaded/changed | `sourceId`, `isSourceLoaded` |
| `styledata` | Fired when the map's style is changed | - |

**Example:**

```javascript
map.on('styledata', () => {
  console.log('Map style has changed');
});

map.on('sourcedata', (e) => {
  if (e.isSourceLoaded) {
    console.log('Source data loaded:', e.sourceId);
  }
});
```

---

#### Source & Layer Events

Fired when sources or layers are added, removed, or modified.

| Event | Description |
|-------|-------------|
| `sourceloading` | Fired when a source begins loading |
| `sourceadd` | Fired when a source is added |
| `sourceremove` | Fired when a source is removed |
| `layeradd` | Fired when a layer is added |
| `layerremove` | Fired when a layer is removed |

---

#### Other Events

| Event | Description | Event Data |
|-------|-------------|------------|
| `resize` | Fired when the map is resized | - |
| `webglcontextlost` | Fired when WebGL context is lost | - |
| `webglcontextrestored` | Fired when WebGL context is restored | - |

---

#### Drawing Events

Available when drawing tools are enabled via `polygon: true`.

| Event | Description | Event Data |
|-------|-------------|------------|
| `draw.create` | Fired when a feature is created | `features` - Array of created features |
| `draw.update` | Fired when a feature is updated | `features` - Array of updated features |
| `draw.delete` | Fired when a feature is deleted | `features` - Array of deleted features |
| `draw.selectionchange` | Fired when selection changes | `features`, `points` |
| `draw.modechange` | Fired when draw mode changes | `mode` - Current mode name |
| `draw.actionable` | Fired when available actions change | `actionable` - Action state object |

**Example:**

```javascript
// Assuming map is initialized with drawing enabled (polygon: true)

// Handle feature creation
map.on('draw.create', (e) => {
  const feature = e.features[0];
  const geometryType = feature.geometry.type;

  switch (geometryType) {
    case 'Polygon':
      console.log('Polygon created:', feature.geometry.coordinates);
      break;
    case 'LineString':
      console.log('Line created:', feature.geometry.coordinates);
      break;
    case 'Point':
      console.log('Point created:', feature.geometry.coordinates);
      break;
  }
});

// Handle feature updates
map.on('draw.update', (e) => {
  console.log('Feature updated:', e.features);
});

// Handle feature deletion
map.on('draw.delete', (e) => {
  console.log('Feature deleted:', e.features);
});
```

---

### Event Listener Management

#### Adding Event Listeners

Use `map.on()` to attach event listeners:

```javascript
// Anonymous function
map.on('load', () => {
  console.log('Map loaded');
});

// Named function (easier to remove later)
function handleLoad() {
  console.log('Map loaded');
}
map.on('load', handleLoad);

// Once - listener fires only once
map.once('load', () => {
  console.log('This will only fire once');
});
```

#### Removing Event Listeners

Use `map.off()` to remove event listeners:

```javascript
// Remove specific listener
map.off('load', handleLoad);

// Remove all listeners for an event
map.off('load');

// Remove all listeners
map.off();
```

#### Getting Event Data

Event handlers receive an event object with contextual data:

```javascript
map.on('click', (e) => {
  // Geographic coordinates
  console.log('Lng:', e.lngLat.lng);
  console.log('Lat:', e.lngLat.lat);

  // Pixel coordinates
  console.log('X:', e.point.x);
  console.log('Y:', e.point.y);

  // Original event
  console.log('Original event:', e.originalEvent);
});
```

---

## Markers & Popups

### Adding Markers

Markers are visual indicators placed at specific locations on the map.

```javascript
// Basic marker
const marker = new bkoigl.Marker()
  .setLngLat([90.39, 23.82])
  .addTo(map);

// Marker with custom color
const marker = new bkoigl.Marker({ color: '#ff0000' })
  .setLngLat([90.39, 23.82])
  .addTo(map);

// Marker with custom element
const el = document.createElement('div');
el.className = 'custom-marker';
el.style.backgroundImage = 'url(marker.png)';
el.style.width = '30px';
el.style.height = '30px';

const marker = new bkoigl.Marker(el)
  .setLngLat([90.39, 23.82])
  .addTo(map);

// Remove a marker
marker.remove();
```

### Adding Popups

Popups display information when clicked or hovered.

```javascript
// Basic popup
const popup = new bkoigl.Popup()
  .setLngLat([90.39, 23.82])
  .setHTML('<h3>Dhaka</h3><p>Capital of Bangladesh</p>')
  .addTo(map);

// Popup with options
const popup = new bkoigl.Popup({
  closeButton: true,
  closeOnClick: false,
  offset: 25,
  anchor: 'bottom'
})
  .setLngLat([90.39, 23.82])
  .setText('Hello World!')
  .addTo(map);
```

### Marker with Popup

Attach a popup to a marker that opens when clicked.

```javascript
const popup = new bkoigl.Popup({ offset: 25 })
  .setHTML('<h3>Location</h3><p>This is a marker</p>');

const marker = new bkoigl.Marker()
  .setLngLat([90.39, 23.82])
  .setPopup(popup)
  .addTo(map);

// Toggle popup programmatically
marker.togglePopup();
```

---

## Map Controls

### Navigation Control

Adds zoom in/out buttons and a compass for rotation.

```javascript
// Add navigation control
map.addControl(new bkoigl.NavigationControl(), 'top-right');

// With options
map.addControl(new bkoigl.NavigationControl({
  visualizePitch: true,  // Show pitch visualization
  showZoom: true,
  showCompass: true
}), 'top-right');
```

### Geolocate Control

Allows users to find and track their current location.

```javascript
map.addControl(new bkoigl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true
  },
  trackUserLocation: true,  // Track user movement
  showAccuracyCircle: true,
  showUserHeading: true
}), 'top-right');
```

### Scale Control

Displays a scale bar showing distances.

```javascript
map.addControl(new bkoigl.ScaleControl({
  maxWidth: 100,
  unit: 'metric'  // 'metric', 'imperial', or 'nautical'
}), 'bottom-left');
```

### Fullscreen Control

Allows users to toggle fullscreen mode.

```javascript
map.addControl(new bkoigl.FullscreenControl(), 'top-right');
```

### Minimap Control

Adds a small overview map that syncs with the main map, providing geographic context by showing the surrounding area at a different zoom level.

#### Basic Usage

```javascript
// Using map options
const map = new bkoigl.Map({
  container: 'map',
  accessToken: 'YOUR_BARIKOI_API_KEY',
  center: [90.39, 23.82],
  zoom: 12,
  minimap: {
    zoomAdjust: -4,
    position: 'bottom-right'
  }
})

// Or using addControl
const minimap = new bkoigl.Minimap({
  zoomAdjust: -4,
  position: 'bottom-right'
})
map.addControl(minimap, 'bottom-right')
```

#### Minimap Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `style` | string \| StyleSpecification | *parent style* | Map style for the minimap. If not provided, inherits from parent map |
| `zoomAdjust` | number | `-4` | Zoom level difference between parent and minimap. Positive = zoomed out more |
| `lockZoom` | number | *none* | Lock minimap to a specific zoom level (overrides zoomAdjust) |
| `pitchAdjust` | boolean | `false` | Whether to sync pitch (tilt) with parent map |
| `position` | string | `'top-right'` | Position of minimap control (`'top-left'`, `'top-right'`, `'bottom-left'`, `'bottom-right'`) |
| `center` | [number, number] | *parent center* | Initial center coordinates [lng, lat] |
| `accessToken` | string | *parent token* | Barikoi API access token for the minimap |
| `containerStyle` | object | `{ width: '400px', height: '300px' }` | Custom CSS properties for the minimap container |
| `borderRadius` | string | `'3px'` | Border radius of the minimap container |
| `toggleable` | boolean | `true` | Whether the minimap can be minimized/maximized |
| `toggleButton` | object | *default button* | Custom toggle button configuration (see ToggleButton Options) |
| `initialMinimized` | boolean | `false` | Whether to start in minimized state |
| `collapsedWidth` | string | `'29px'` | Width when minimized |
| `collapsedHeight` | string | `'29px'` | Height when minimized |
| `hideText` | string | `'Hide minimap'` | Tooltip text when expanded |
| `showText` | string | `'Show minimap'` | Tooltip text when minimized |
| `onToggle` | function | *none* | Callback when minimap is toggled: `(isMinimized: boolean) => void` |
| `interactions` | object | *all disabled* | Map interactions configuration (see Interactions Options) |
| `parentRect` | object | *none* | Parent rectangle overlay configuration (see ParentRect Options) |

#### Custom Toggle Button

Customize the minimap toggle button appearance:

```javascript
const map = new bkoigl.Map({
  container: 'map',
  accessToken: 'YOUR_BARIKOI_API_KEY',
  center: [90.39, 23.82],
  zoom: 12,
  minimap: {
    zoomAdjust: -4,
    position: 'bottom-right',
    toggleable: true,
    toggleButton: {
      // Custom SVG icon
      icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17.6 18L8 8.4V17H6V5h12v2H9.4l9.6 9.6l-1.4 1.4Z"/></svg>',
      // Custom CSS class
      className: 'my-toggle-button',
      // Custom inline styles
      style: {
        background: 'linear-gradient(to right, #667eea 0%, #764ba2 100%)',
        borderRadius: '4px'
      },
      // Button background color
      iconBackgroundColor: '#333',
      // Hover color
      hoverColor: '#FF5722',
      // Enable rotation based on position
      enableRotation: true,
      // Custom rotation angle (degrees)
      rotationAngle: -180
    }
  }
})
```

| ToggleButton Option | Type | Default | Description |
|---------------------|------|---------|-------------|
| `icon` | string | *default arrow* | Custom SVG icon for the button |
| `className` | string | *none* | Custom CSS class name(s) |
| `style` | object | *none* | Custom inline styles |
| `iconBackgroundColor` | string | `'black'` | Background color of the button |
| `hoverColor` | string | `'#e5e7e3'` | Background color on hover |
| `enableRotation` | boolean | `true` | Enable rotation based on position |
| `rotationAngle` | number | *position-based* | Custom rotation angle in degrees |

#### Parent Rectangle Overlay

Display a rectangle on the minimap showing the parent map's current viewport:

```javascript
const map = new bkoigl.Map({
  container: 'map',
  accessToken: 'YOUR_BARIKOI_API_KEY',
  center: [90.39, 23.82],
  zoom: 12,
  minimap: {
    zoomAdjust: -4,
    position: 'bottom-right',
    parentRect: {
      // Outline styling
      linePaint: {
        'line-color': '#FFFFFF',
        'line-width': 2,
        'line-opacity': 0.9
      },
      // Fill styling
      fillPaint: {
        'fill-color': '#0088FF',
        'fill-opacity': 0.2
      }
    }
  }
})
```

| ParentRect Option | Type | Description |
|-------------------|------|-------------|
| `lineLayout` | object | Layout properties for the rectangle outline |
| `linePaint` | object | Paint properties for the rectangle outline (color, width, opacity) |
| `fillPaint` | object | Paint properties for the rectangle fill (color, opacity) |

#### Minimap Interactions

Control which map interactions are enabled on the minimap. By default, all interactions are disabled for a cleaner overview experience:

```javascript
const map = new bkoigl.Map({
  container: 'map',
  accessToken: 'YOUR_BARIKOI_API_KEY',
  center: [90.39, 23.82],
  zoom: 12,
  minimap: {
    zoomAdjust: -4,
    position: 'bottom-right',
    interactions: {
      dragPan: true,        // Enable panning
      scrollZoom: false,    // Disable scroll zoom
      boxZoom: false,
      dragRotate: false,
      keyboard: false,
      doubleClickZoom: false,
      touchZoomRotate: false
    }
  }
})
```

| Interaction | Default | Description |
|-------------|---------|-------------|
| `dragPan` | `false` | Enable/disable drag to pan |
| `scrollZoom` | `false` | Enable/disable scroll wheel zoom |
| `boxZoom` | `false` | Enable/disable box zoom |
| `dragRotate` | `false` | Enable/disable drag to rotate |
| `keyboard` | `false` | Enable/disable keyboard controls |
| `doubleClickZoom` | `false` | Enable/disable double-click zoom |
| `touchZoomRotate` | `false` | Enable/disable touch zoom/rotate |

#### Minimap Methods

When you create a Minimap instance via `addControl`, you can access these methods:

```javascript
const minimap = new bkoigl.Minimap({
  zoomAdjust: -4,
  position: 'bottom-right'
})
map.addControl(minimap, 'bottom-right')

// Toggle minimap programmatically
minimap.toggle()

// Check if minimized
const isMinimized = minimap.isMinimized()

// Set custom style (only works if minimap has its own style)
minimap.setStyle('https://map.barikoi.com/styles/barikoi-dark/style.json')

// Add layers to minimap (only works if minimap has its own style)
minimap.addLayer({
  id: 'my-layer',
  type: 'circle',
  source: 'my-source',
  paint: {
    'circle-radius': 10,
    'circle-color': '#FF0000'
  }
})

// Remove layer
minimap.removeLayer('my-layer')

// Set paint/layout properties
minimap.setPaintProperty('my-layer', 'circle-color', '#00FF00')
minimap.setLayoutProperty('my-layer', 'visibility', 'none')

// Set filter
minimap.setFilter('my-layer', ['==', 'type', 'restaurant'])

// Set layer zoom range
minimap.setLayerZoomRange('my-layer', 10, 18)

// Move layer in stack
minimap.moveLayer('my-layer', 'another-layer')
```

#### Custom Style Example

Use a different style for the minimap than the parent map:

```javascript
const map = new bkoigl.Map({
  container: 'map',
  accessToken: 'YOUR_BARIKOI_API_KEY',
  center: [90.39, 23.82],
  zoom: 12,
  style: 'https://map.barikoi.com/styles/barikoi-light/style.json',
  minimap: {
    style: 'https://map.barikoi.com/styles/barikoi-dark/style.json',
    zoomAdjust: -5,
    position: 'bottom-right',
    containerStyle: {
      width: '300px',
      height: '200px',
      border: '2px solid #333'
    },
    parentRect: {
      linePaint: {
        'line-color': '#FFD700',
        'line-width': 2
      },
      fillPaint: {
        'fill-color': '#FFD700',
        'fill-opacity': 0.15
      }
    }
  }
})
```

#### Vanilla JavaScript Example

A complete HTML example with all minimap features:

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="https://unpkg.com/bkoi-gl@latest/dist/style/bkoi-gl.css" />
    <script src="https://unpkg.com/bkoi-gl@latest/dist/iife/bkoi-gl.js"></script>
    <style>
      body { margin: 0; padding: 0; }
      #map { width: 100%; height: 100vh; }
      #toggle-btn {
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 10;
        padding: 10px 20px;
        background: #fff;
        border: 1px solid #ccc;
        cursor: pointer;
        font-size: 14px;
      }
      #toggle-btn:hover {
        background: #f0f0f0;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <button id="toggle-btn">Toggle Minimap</button>

    <script>
      // Store minimap reference for programmatic control
      let minimapControl = null

      // Initialize map with minimap
      const map = new bkoigl.Map({
        container: 'map',
        accessToken: 'YOUR_BARIKOI_API_KEY',
        center: [90.39, 23.82],
        zoom: 12,
        minimap: {
          // Use dark style for minimap
          style: 'YOUR_MAP_STYLE',
          zoomAdjust: -5,
          position: 'bottom-right',
          // Container styling
          containerStyle: {
            width: '300px',
            height: '200px'
          },
          // Toggle functionality
          toggleable: true,
          initialMinimized: false,
          hideText: 'Hide overview',
          showText: 'Show overview',
          onToggle: function(isMinimized) {
            console.log('Minimap minimized:', isMinimized)
            updateButtonText()
          },
          // Custom toggle button
          toggleButton: {
            iconBackgroundColor: '#333',
            hoverColor: '#FF5722',
            enableRotation: true
          },
          // Parent rectangle overlay
          parentRect: {
            linePaint: {
              'line-color': '#FFD700',
              'line-width': 2,
              'line-opacity': 0.9
            },
            fillPaint: {
              'fill-color': '#FFD700',
              'fill-opacity': 0.15
            }
          },
          // Enable drag pan on minimap
          interactions: {
            dragPan: true,
            scrollZoom: false,
            boxZoom: false,
            dragRotate: false,
            keyboard: false,
            doubleClickZoom: false,
            touchZoomRotate: false
          }
        }
      })

      // Alternative: Add minimap using addControl
      // minimapControl = new bkoigl.Minimap({
      //   zoomAdjust: -4,
      //   position: 'bottom-right',
      //   parentRect: {
      //     linePaint: { 'line-color': '#FFF', 'line-width': 2 },
      //     fillPaint: { 'fill-color': '#0088FF', 'fill-opacity': 0.2 }
      //   }
      // })
      // map.addControl(minimapControl, 'bottom-right')

      // Toggle button handler
      document.getElementById('toggle-btn').addEventListener('click', function() {
        if (minimapControl) {
          minimapControl.toggle()
        }
      })

      function updateButtonText() {
        const btn = document.getElementById('toggle-btn')
        if (minimapControl && minimapControl.isMinimized()) {
          btn.textContent = 'Show Minimap'
        } else {
          btn.textContent = 'Hide Minimap'
        }
      }
    </script>
  </body>
</html>
```

### Removing Controls

```javascript
const control = new bkoigl.NavigationControl();
map.addControl(control, 'top-right');

// Remove the control
map.removeControl(control);
```

---

## Camera Methods

### Fly To

Smooth animated transition to a location with a "flying" effect.

```javascript
map.flyTo({
  center: [90.39, 23.82],
  zoom: 14,
  bearing: 0,
  pitch: 0,
  speed: 1.2,      // Animation speed
  curve: 1.42      // Flying curve
});
```

### Ease To

Smooth animated transition with customizable duration.

```javascript
map.easeTo({
  center: [90.39, 23.82],
  zoom: 14,
  bearing: 45,
  pitch: 30,
  duration: 2000   // Duration in ms
});
```

### Jump To

Instant transition without animation.

```javascript
map.jumpTo({
  center: [90.39, 23.82],
  zoom: 14,
  bearing: 0,
  pitch: 0
});
```

### Pan To

Pan the map to a location.

```javascript
map.panTo([90.39, 23.82], { duration: 1000 });
```

### Zoom Methods

```javascript
map.setZoom(14);
map.zoomTo(15, { duration: 500 });
map.zoomIn({ duration: 500 });
map.zoomOut({ duration: 500 });
```

### Rotation Methods

```javascript
map.setBearing(45);
map.rotateTo(90, { duration: 500 });
map.resetNorth({ duration: 500 });
```

### Pitch Methods

```javascript
map.setPitch(45);
```

### Fit Bounds

Fit the map to show a specific area.

```javascript
const bounds = [[90.3, 23.7], [90.5, 23.9]]; // [SW, NE]
map.fitBounds(bounds, {
  padding: 50,      // Padding in pixels
  duration: 2000
});
```

### Get Camera State

```javascript
const center = map.getCenter();  // { lng, lat }
const zoom = map.getZoom();      // number
const bearing = map.getBearing(); // number
const pitch = map.getPitch();    // number
const bounds = map.getBounds();  // { getWest, getSouth, getEast, getNorth }
```

---

## Custom Layers & Sources

### Adding a GeoJSON Source

```javascript
map.addSource('my-source', {
  type: 'geojson',
  data: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [90.39, 23.82]
        },
        properties: {
          title: 'Dhaka'
        }
      }
    ]
  }
});
```

### Adding Layers

#### Circle Layer (Points)

```javascript
map.addLayer({
  id: 'my-circle-layer',
  type: 'circle',
  source: 'my-source',
  paint: {
    'circle-radius': 10,
    'circle-color': '#ff0000',
    'circle-opacity': 0.8,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff'
  }
});
```

#### Line Layer

```javascript
map.addLayer({
  id: 'my-line-layer',
  type: 'line',
  source: 'my-source',
  layout: {
    'line-cap': 'round',
    'line-join': 'round'
  },
  paint: {
    'line-color': '#0088ff',
    'line-width': 3,
    'line-opacity': 0.8
  }
});
```

#### Fill Layer (Polygons)

```javascript
map.addLayer({
  id: 'my-fill-layer',
  type: 'fill',
  source: 'my-source',
  paint: {
    'fill-color': '#28a745',
    'fill-opacity': 0.5
  }
});

// Add outline for the polygon
map.addLayer({
  id: 'my-fill-outline',
  type: 'line',
  source: 'my-source',
  paint: {
    'line-color': '#ffffff',
    'line-width': 2
  }
});
```

### Layer Visibility

```javascript
// Hide a layer
map.setLayoutProperty('my-layer', 'visibility', 'none');

// Show a layer
map.setLayoutProperty('my-layer', 'visibility', 'visible');
```

### Removing Sources & Layers

```javascript
// Remove a layer
map.removeLayer('my-layer');

// Remove a source (remove layers first)
map.removeSource('my-source');
```

### Querying Layers

```javascript
// Check if layer exists
if (map.getLayer('my-layer')) {
  map.removeLayer('my-layer');
}

// Check if source exists
if (map.getSource('my-source')) {
  map.removeSource('my-source');
}
```

---

## Utility Methods

### Map State

```javascript
// Get bounds
const bounds = map.getBounds();
console.log(bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth());

// Set max bounds
map.setMaxBounds([[90.0, 23.5], [91.0, 24.5]]);

// Get projection
const projection = map.getProjection();

// World copies
map.setRenderWorldCopies(true);
```

### Resize

Trigger a map resize when the container size changes.

```javascript
map.resize();
```

### Interaction Handlers

Enable or disable specific interactions:

```javascript
// Scroll zoom
map.scrollZoom.enable();
map.scrollZoom.disable();

// Drag pan
map.dragPan.enable();
map.dragPan.disable();

// Drag rotate
map.dragRotate.enable();
map.dragRotate.disable();

// Keyboard
map.keyboard.enable();
map.keyboard.disable();

// Double click zoom
map.doubleClickZoom.enable();
map.doubleClickZoom.disable();

// Touch zoom rotate
map.touchZoomRotate.enable();
map.touchZoomRotate.disable();

// Touch pitch
map.touchPitch.enable();
map.touchPitch.disable();

// Box zoom
map.boxZoom.enable();
map.boxZoom.disable();
```

---

## Examples

Explore our interactive code examples with live demos and source code, covering basic maps to advanced features like markers, popups, layers, styling and animations.

**[Interactive Examples](https://docs.barikoi.com/examples)**

---

## Documentation

- [Map API Reference](https://docs.barikoi.com/docs/API%20Reference/bkoi-map) - Complete Barikoi GL JS API documentation
- [Business API Reference](https://docs.barikoi.com/api) - Barikoi location and business APIs

---

## Support Resources

- [Barikoi Documentation](https://docs.barikoi.com/docs/maps-api)
- [MapLibre GL JS Docs](https://maplibre.org/maplibre-gl-js/docs/)
- [GitHub Issues](https://github.com/barikoi/bkoi-gl-js/issues)
- [Barikoi Support](mailto:support@barikoi.com)

---

## License

This library is licensed under the MIT License. See the [LICENSE](https://github.com/barikoi/bkoi-gl-js/blob/main/LICENSE) file for details.
