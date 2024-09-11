# Barikoi GL JS

## Description
**Barikoi GL JS** is a JavaScript library built on top of MapLibre GL, designed for seamless integration with Barikoi Maps, offering high-performance and customizable map rendering. It is ideal for use in modern web applications, including React and Next.js projects.

Powered by <a href="https://barikoi.com/">Barikoi - Maps for Businesses</a>, this package provides tools to integrate maps and location services effortlessly.

## Features
- High-performance map rendering using WebGL.
- Easy integration with React and Next.js.
- Customizable map controls and interactions.
- Support for Barikoi geolocation services.
- Lightweight and optimized for production.

## Installation
To install the package via npm, run the following command:
```bash
npm i bkoi-gl
```
Or via yarn:
```bash
yarn add bkoi-gl
```

## Usage
### Using With React or Next.js

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
      accessToken: "YOUR_BARIKOI_API_KEY_HERE" // Replace with your Barikoi API key
    });

      const marker = new Marker()
    .setLngLat([90.39017821904588, 23.719800220780733]) // Set marker coordinates (Dhaka)
    .addTo(map.current); // Add marker to the map
  }, []);

  return <div ref={mapContainer} style={containerStyles} />;
}

// JSX Styles
const containerStyles = {
  width: "100%",
  height: "100vh",
  minHeight: "400px",
  overflow: "hidden",
};

export default BarikoiMapGL
```
**Note:** When using Next.js, ensure dynamic imports for the `<BarikoiMapGL/> `component by using `next/dynamic`. If you're using the `/app` directory in Next.js, remember to include the `"use client"` directive at the top of your component.

### Using with CDN
Add the following script to your HTML:
```html
<script src="https://cdn.barikoi.com/bkoi-gl-js/dist/bkoi-gl.js"></script>
```
Comprehensive guide is available [here.](https://docs.barikoi.com/docs/maps-api)

## Get Barikoi API key
To access Barikoi's API services, you need to:
1. Register on [Barikoi Developer Dashboard](https://developer.barikoi.com/register).
2. Verify with your phone number.
3. Claim your API key.

Once registered, you'll be able to access the full suite of Barikoi API services. If you exceed the free usage limits, you'll need to subscribe to a paid plan.

## Learning Resources
* [Barikoi API Documentation](https://docs.barikoi.com/docs/maps-api)

## License
This library is licensed under the MIT License. See the [LICENSE](https://www.npmjs.com/package/LICENSE) file for details.

## Support
For any issues or questions, please contact [support@barikoi.com](mailto:support@barikoi.com).