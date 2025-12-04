# Barikoi GL JS

[![npm version](https://img.shields.io/npm/v/bkoi-gl.svg)](https://www.npmjs.com/package/bkoi-gl)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Description

**Barikoi GL JS** is a JavaScript library built on top of [MapLibre GL JS](https://maplibre.org/maplibre-gl-js-docs/), designed for seamless integration with Barikoi Maps, offering high-performance and customizable map rendering. This library is optimized for modern web applications and supports React, Next.js, and vanilla JavaScript projects.

Powered by <a href="https://barikoi.com/">Barikoi - Maps for Businesses</a>, this package provides tools to integrate maps and location services effortlessly.

For comprehensive examples and React/Next.js integrations, check out [react-bkoi-gl](https://www.npmjs.com/package/react-bkoi-gl) npm library.

## Features

- High-performance map rendering using WebGL.
- Easy integration with React and Next.js.
- Customizable map controls and interactions.
- Support for Barikoi geolocation services.
- Lightweight and optimized for production.
- Drawing tools for polygons.
- Multiple build formats (ESM, CJS, IIFE).

## Getting Started

### Get Barikoi API Key

To access Barikoi's API services, you need to:

1. Register on [Barikoi Developer Dashboard](https://developer.barikoi.com/register).
2. Verify with your phone number.
3. Claim your API key.

Once registered, you'll be able to access the full suite of Barikoi API services. If you exceed the free usage limits, you'll need to subscribe to a paid plan.


### Installation

Choose the installation method that best fits your project:

#### Option 1: Package Manager (Recommended for React, Next.js, or bundler-based projects)

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
import "bkoi-gl/dist/style/bkoi-gl.css";
```

This method provides tree-shaking support and better integration with modern build tools.

#### Option 2: CDN (For vanilla JavaScript or quick prototyping)

Add the following links to the `<head>` section of your HTML file:

**Using unpkg:**

```html
<link
  rel="stylesheet"
  href="https://unpkg.com/bkoi-gl@latest/dist/style/bkoi-gl.css"
/>
<script src="https://unpkg.com/bkoi-gl@latest/dist/iife/bkoi-gl.js"></script>
```

**Using jsDelivr:**

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/bkoi-gl@latest/dist/style/bkoi-gl.css"
/>
<script src="https://cdn.jsdelivr.net/npm/bkoi-gl@latest/dist/iife/bkoi-gl.js"></script>
```

The library will be available globally as `bkoigl` (e.g., `bkoigl.Map`).

## Usage

### Basic Usage

#### Display a Simple Map (Vanilla JavaScript)

Here's the minimal code to display a map:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Basic Map</title>
    <link
      rel="stylesheet"
      href="https://unpkg.com/bkoi-gl@latest/dist/style/bkoi-gl.css"
    />
    <script src="https://unpkg.com/bkoi-gl@latest/dist/iife/bkoi-gl.js"></script>
    <style>
      #map {
        width: 100%;
        height: 400px;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>

    <script>
      bkoigl.accessToken = "YOUR_BARIKOI_API_KEY_HERE";
      const map = new bkoigl.Map({
        container: "map",
        center: [90.39, 23.72], // Dhaka coordinates
        zoom: 10,
      });
    </script>
  </body>
</html>
```

#### Display a Simple Map (React)

```javascript
import { useEffect, useRef } from "react";
import { Map } from "bkoi-gl";
import "bkoi-gl/dist/style/bkoi-gl.css";

function BasicMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return;
    map.current = new Map({
      container: mapContainer.current,
      center: [90.39, 23.72], // Dhaka coordinates
      zoom: 10,
      accessToken: "YOUR_BARIKOI_API_KEY_HERE",
    });
  }, []);

  return <div ref={mapContainer} style={{ width: "100%", height: "400px" }} />;
}

export default BasicMap;
```

### Adding Markers

#### Vanilla JavaScript

```javascript
// After creating the map
const marker = new bkoigl.Marker().setLngLat([90.39, 23.72]).addTo(map);
```

#### React

```javascript
import { Marker } from "bkoi-gl";

// Inside your component's useEffect, after map initialization
const marker = new Marker().setLngLat([90.39, 23.72]).addTo(map.current);
```

### Advanced Features

#### Map Controls

Add navigation and other controls to your map:

```javascript
// Add controls (works with both Vanilla JS and React)
map.addControl(new bkoigl.NavigationControl(), "top-right");
map.addControl(new bkoigl.FullscreenControl(), "top-right");
map.addControl(new bkoigl.ScaleControl(), "bottom-right");
```

#### Drawing Tools (Polygon Drawing)

Enable polygon drawing capabilities:

```javascript
const map = new bkoigl.Map({
  container: "map",
  center: [90.39, 23.72],
  zoom: 10,
  accessToken: "YOUR_BARIKOI_API_KEY_HERE",
  polygon: true, // Enable drawing
  drawOptions: {
    controls: {
      polygon: true,
      trash: true,
    },
  },
});

// Listen to drawing events
map.on("draw.create", (e) => {
  console.log("Polygon created:", e.features);
});

map.on("draw.update", (e) => {
  console.log("Polygon updated:", e.features);
});

map.on("draw.delete", (e) => {
  console.log("Polygon deleted:", e.features);
});
```

#### Complete Examples

##### Full-Featured Vanilla JavaScript Example

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Full Map Example</title>
    <link
      rel="stylesheet"
      href="https://unpkg.com/bkoi-gl@latest/dist/style/bkoi-gl.css"
    />
    <script src="https://unpkg.com/bkoi-gl@latest/dist/iife/bkoi-gl.js"></script>
    <style>
      body,
      #map {
        margin: 0;
        padding: 0;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>

    <script>
      bkoigl.accessToken = "YOUR_BARIKOI_API_KEY_HERE";
      const map = new bkoigl.Map({
        container: "map",
        center: [90.3938010872331, 23.821600277500405],
        zoom: 12,
        polygon: true,
        drawOptions: {
          controls: {
            polygon: true,
            trash: true,
          },
        },
      });

      // Add marker
      const marker = new bkoigl.Marker()
        .setLngLat([90.3938010872331, 23.821600277500405])
        .addTo(map);

      // Add controls
      map.addControl(new bkoigl.FullscreenControl(), "top-right");
      map.addControl(new bkoigl.NavigationControl(), "top-right");
      map.addControl(new bkoigl.ScaleControl(), "bottom-right");

      // Drawing events
      map.on("draw.create", (e) => console.log("Created:", e.features));
      map.on("draw.update", (e) => console.log("Updated:", e.features));
      map.on("draw.delete", (e) => console.log("Deleted:", e.features));
    </script>
  </body>
</html>
```

##### Full-Featured React/Next.js Example

```javascript
import { useEffect, useRef } from "react";
import {
  Map,
  Marker,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
} from "bkoi-gl";
import "bkoi-gl/dist/style/bkoi-gl.css";

function FullFeaturedMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return;

    map.current = new Map({
      container: mapContainer.current,
      center: [90.39017821904588, 23.719800220780733],
      zoom: 10,
      doubleClickZoom: false,
      accessToken: "YOUR_BARIKOI_API_KEY_HERE",
      polygon: true,
      drawOptions: {
        controls: {
          polygon: true,
          trash: true,
        },
      },
    });

    // Add marker
    const marker = new Marker()
      .setLngLat([90.39017821904588, 23.719800220780733])
      .addTo(map.current);

    // Add controls
    map.current.addControl(new NavigationControl(), "top-right");
    map.current.addControl(new FullscreenControl(), "top-right");
    map.current.addControl(new ScaleControl(), "bottom-right");

    // Drawing events
    map.current.on("draw.create", (e) => console.log("Created:", e.features));
    map.current.on("draw.update", (e) => console.log("Updated:", e.features));
    map.current.on("draw.delete", (e) => console.log("Deleted:", e.features));
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

export default FullFeaturedMap;
```

**Note:** When using Next.js, ensure dynamic imports for the map component by using `next/dynamic`. If you're using the `/app` directory in Next.js, remember to include the `"use client"` directive at the top of your component.

## API Reference

For comprehensive API documentation, visit the [Barikoi Maps API Documentation](https://docs.barikoi.com/docs/maps-api).

## Support Resources

- [Barikoi Documentation](https://docs.barikoi.com/docs/maps-api)
- [MapLibre GL JS Docs](https://maplibre.org/maplibre-gl-js-docs/)
- [GitHub Issues](https://github.com/barikoi/bkoi-gl-js/issues)
- [Barikoi Support](mailto:support@barikoi.com)

## License

This library is licensed under the MIT License. See the [LICENSE](https://www.npmjs.com/package/LICENSE) file for details.
