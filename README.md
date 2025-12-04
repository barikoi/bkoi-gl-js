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

## Quick Start

### Vanilla JavaScript

```html
<div id="map" style="width: 100%; height: 400px;"></div>
<script src="https://unpkg.com/bkoi-gl@latest/dist/iife/bkoi-gl.js"></script>
<link
  rel="stylesheet"
  href="https://unpkg.com/bkoi-gl@latest/dist/style/bkoi-gl.css"
/>
<script>
  bkoigl.accessToken = "YOUR_BARIKOI_API_KEY_HERE";
  const map = new bkoigl.Map({
    container: "map",
    center: [90.3938010872331, 23.821600277500405], // Dhaka coordinates
    zoom: 10,
  });
</script>
```

### React/Next.js

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
      center: [90.39017821904588, 23.719800220780733], // Dhaka coordinates
      zoom: 10,
      accessToken: "YOUR_BARIKOI_API_KEY_HERE",
    });
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "400px",
        height: "100vh",
        minHeight: "400px",
        overflow: "hidden",
      }}
    />
  );
}
```

## Examples

<!-- - [Interactive Examples](https://docs.barikoi.com/examples) - Code examples and live demos -->
Explore our interactive code examples with live demos and source code, covering basic maps to advanced features like markers, popups, layers, styling and animations.

**[Interactive Examples](https://docs.barikoi.com/examples)**

## Documentation

- [Map API Reference](https://docs.barikoi.com/docs/API%20Reference/bkoi-map) - Complete Barikoi GL JS API documentation

- [Business API Reference](https://docs.barikoi.com/api) - Barikoi location and business APIs

## Support Resources

- [Barikoi Documentation](https://docs.barikoi.com/docs/maps-api)
- [MapLibre GL JS Docs](https://maplibre.org/maplibre-gl-js-docs/)
- [GitHub Issues](https://github.com/barikoi/bkoi-gl-js/issues)
- [Barikoi Support](mailto:support@barikoi.com)

## License

This library is licensed under the MIT License. See the [LICENSE](https://www.npmjs.com/package/LICENSE) file for details.
