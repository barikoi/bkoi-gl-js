# Barikoi GL JS

[![npm version](https://img.shields.io/npm/v/bkoi-gl.svg)](https://www.npmjs.com/package/bkoi-gl)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Description

**Barikoi GL JS** is a JavaScript library built on top of [MapLibre GL JS](https://maplibre.org/maplibre-gl-js-docs/), designed for seamless integration with Barikoi Maps, offering high-performance and customizable map rendering. This library is optimized for modern web applications and supports React, Next.js, and vanilla JavaScript projects.

Powered by <a href="https://barikoi.com/">Barikoi - Maps for Businesses</a>, this package provides tools to integrate maps and location services effortlessly.

## Features

- High-performance map rendering using WebGL.
- Easy integration with React and Next.js.
- Customizable map controls and interactions.
- Support for Barikoi geolocation services.
- Lightweight and optimized for production.
- Drawing tools for polygons.
- Multiple build formats (ESM, CJS, IIFE).

## Installation

To install the package via npm, run the following command:

### yarn

```bash
npm install bkoi-gl
```

### yarn

```bash
yarn add bkoi-gl
```

### CDN

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://unpkg.com/bkoi-gl@latest/dist/style/bkoi-gl.css"
/>
<script src="https://unpkg.com/bkoi-gl@latest/dist/iife/bkoi-gl.js"></script>
```

## Usage

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link
      rel="stylesheet"
      type="text/css"
      href="https://unpkg.com/bkoi-gl@latest/dist/style/bkoi-gl.css"
    />
    <script src="https://unpkg.com/bkoi-gl@latest/dist/iife/bkoi-gl.js"></script>
    <style>
      body,
      #map {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
      }
    </style>
    <title>Display Map</title>
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

      map.addControl(new bkoigl.FullscreenControl(), "top-right");
      map.addControl(new bkoigl.NavigationControl(), "top-right");
      map.addControl(new bkoigl.GeolocateControl(), "top-right");
      map.addControl(new bkoigl.ScaleControl(), "bottom-right");
    </script>
  </body>
</html>
```

### React/Next.js

Here’s an example of how to use the library in a React component:

```javascript
import { useEffect, useRef } from "react";
import { Map, Marker } from "bkoi-gl"; // Import Package
import "bkoi-gl/dist/style/bkoi-gl.css"; // Import CSS

const BarikoiMapGL = () => {
  // Refs
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return; // Ensures map initializes only once
    map.current = new Map({
      container: mapContainer.current,
      center: [90.39017821904588, 23.719800220780733], // Dhaka coordinates
      zoom: 10,
      doubleClickZoom: false,
      accessToken: "YOUR_BARIKOI_API_KEY_HERE", // Replace with your Barikoi API key
    });

    const marker = new Marker()
      .setLngLat([90.39017821904588, 23.719800220780733]) // Set marker coordinates (Dhaka)
      .addTo(map.current); // Add marker to the map
  }, []);

  return <div ref={mapContainer} style={containerStyles} />;
};

// JSX Styles
const containerStyles = {
  width: "100%",
  height: "100vh",
  minHeight: "400px",
  overflow: "hidden",
};

export default BarikoiMapGL;
```

**Note:** When using Next.js, ensure dynamic imports for the `<BarikoiMapGL/> `component by using `next/dynamic`. If you're using the `/app` directory in Next.js, remember to include the `"use client"` directive at the top of your component.


Comprehensive guide is available [here.](https://docs.barikoi.com/docs/maps-api)

## Get Barikoi API key

To access Barikoi's API services, you need to:

1. Register on [Barikoi Developer Dashboard](https://developer.barikoi.com/register).
2. Verify with your phone number.
3. Claim your API key.

Once registered, you'll be able to access the full suite of Barikoi API services. If you exceed the free usage limits, you'll need to subscribe to a paid plan.

## Support Resources

- [Barikoi Documentation](https://docs.barikoi.com/docs/maps-api)
- [MapLibre GL JS Docs](https://maplibre.org/maplibre-gl-js-docs/)
- [GitHub Issues](https://github.com/barikoi/bkoi-gl-js/issues)
- [Barikoi Support](mailto:support@barikoi.com)

## License

This library is licensed under the MIT License. See the [LICENSE](https://www.npmjs.com/package/LICENSE) file for details.
