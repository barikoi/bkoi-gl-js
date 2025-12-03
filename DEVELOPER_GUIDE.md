# bkoi-gl-js Developer Guide

## Overview

**bkoi-gl-js** is a JavaScript library built on top of MapLibre GL JS, specifically built for seamless integration with Barikoi Maps and location services. It provides a thin wrapper around MapLibre GL v5.13.0 with Barikoi-specific enhancements including automatic attribution, drawing tools, and style management.

The package is maintained as an npm module with ES module support, targeting modern web applications including React, Next.js, and vanilla JavaScript projects.

## Architecture

### Core Components

1. **BkoiGlMap Class** (`src/index.js`)

   - **Purpose**: Main entry point for the bkoi-gl-js library, a Maplibre GL JS wrapper with Barikoi-specific mapping features
   - Extends MapLibre's `Map` class with Barikoi integration
   - Key features implemented:
     - BkoiGlMap class: Extended Map class with Barikoi integration
     - Barikoi attribution: Custom logo and attribution controls
     - Drawing tools: Polygon/line/point drawing using Mapbox GL Draw
     - Configuration: Access token and API URL management
   - Exports the complete bkoi-gl-js API for use in applications

2. **CSS Styles** (`src/index.css`)

   - **Purpose**: Contains CSS styles for the bkoi-gl-js library, a wrapper around Maplibre GL JS with Barikoi-specific features
   - Key components styled:
     - Barikoi logo control: Custom logo displayed on the map
     - Draw tools: Styles for polygon drawing controls using Mapbox GL Draw
     - Map interactions: Cursor styles for various map interaction modes
   - Imports base Maplibre GL CSS and extends it with Barikoi-specific customizations

3. **Configuration System** (`src/utils/config.js`)

   - **Purpose**: Contains default configuration settings for the bkoi-gl-js library
   - Stores Barikoi access tokens and default map style URLs
   - Provides centralized configuration management used throughout the library

4. **Validation Utilities** (`src/utils/validator.js`)
   - **Purpose**: Contains utility functions for validating Barikoi-specific inputs
   - Includes functions like checking if a map style URL is a Barikoi style
   - Helps ensure proper integration with Barikoi services

### Build System

- **Rollup**: Bundles ES modules to multiple formats (ESM, CJS, IIFE)
- **Babel**: Transpiles modern JavaScript for browser compatibility
- **External Dependencies**: MapLibre GL and maplibre-gl-draw are not bundled
- **CSS Processing**: Includes style bundling and minification

## Getting Started

### Prerequisites

- Node.js ^24.11.0
- npm

### Installation

```bash
npm install
```

### Development Setup

```bash
# Start development server
npm start

# Build for production
npm run build

# Prepare husky hooks
npm run prepare
```

### Project Structure

```
bkoi-gl-js/
├── src/
│   ├── index.js          # Main library code
│   ├── index.css         # Styles
│   └── utils/
│       ├── config.js     # Configuration
│       └── validator.js  # Validation helpers
├── examples/             # Usage examples
├── dist/                 # Built outputs
├── rollup.config.js      # Build configuration
├── package.json
└── README.md
```

## Key Features & APIs

### Map Initialization

```javascript
import { Map } from "bkoi-gl";

// Basic usage
const map = new Map({
  container: "map",
  center: [90.39, 23.72], // Dhaka coordinates
  zoom: 10,
  accessToken: "YOUR_BARIKOI_API_KEY_HERE",
});
```

### Constructor Options

- `accessToken`: Required for Barikoi styles
- `polygon`: Enable drawing tools
- `drawOptions`: Configure drawing controls

### Barikoi Attribution

Automatically adds Barikoi logo and attribution on map load. The logo resizes responsively and links to barikoi.com.

### Drawing Tools

When `polygon: true` is set:

```javascript
const map = new Map({
  container: "map",
  // ... other options
  polygon: true,
  drawOptions: {
    controls: {
      polygon: true,
      trash: true,
    },
  },
});
```

## Configuration Management

### Access Tokens

```javascript
import { accessToken } from "bkoi-gl";

// Set globally
accessToken = "YOUR_BARIKOI_API_KEY_HERE";

// Or per instance
const map = new Map({
  accessToken: "YOUR_BARIKOI_API_KEY_HERE",
});
```

## Contributing

### Code Style

The project uses ESLint with a custom Mourner config. Run linting:

```bash
npx eslint src/
```

### Commit Conventions

Uses conventional commits with commitlint:

```bash
<type>[optional scope]: <description>

# Examples
feat: add polygon drawing support
fix: resolve attribution positioning bug
docs: update API documentation
```

### Development Workflow

1. Create a feature branch
2. Make changes with tests
3. Run build and linting
4. Do NOT push other branch
5. Ask maintainer for review


## Local Testing

**Do NOT use `npm link` for local testing.**
Instead, use the `.tgz` tarball method for reliable, isolated testing:

1. **Build the package:**
   ```bash
   npm run build
   ```
   
2. **Generate a tarball:**
   ```bash
   npm pack
   ```
   This creates a file like `bkoi-gl-3.0.0.tgz` in your project root.

3. **Test in another project:**
   ```bash
   npm install /absolute/path/to/bkoi-gl-3.0.0.tgz
   ```
   This simulates a real npm install, ensuring all dependencies and peer dependencies are resolved as they would be for end users.

4. **Update and retest:**
   After making changes, repeat the build and pack steps, then reinstall the new `.tgz` in your test project.

## Maintenance Tasks

### Upgrading Dependencies

#### MapLibre GL Updates

1. Check [MapLibre GL JS releases](https://github.com/maplibre/maplibre-gl-js/releases)
2. Update version in `package.json`:

```json
{
  "dependencies": {
    "maplibre-gl": "^5.14.0"
  }
}
```

3. Install and test: `npm install && npm run build`
4. Check for breaking changes in:

   - API signatures
   - Event handling
   - CSS class names
   - Control implementations

5. Update peerDependencies if needed
6. Test examples and update if required

#### Other Dependencies

- **maplibre-gl-draw**: Keep in sync with MapLibre version
- **Build tools** (Rollup, Babel): Update minor versions first, test builds
- **ESLint**: Update plugins carefully to avoid config conflicts

### Leveraging MapLibre GL APIs

Since bkoi-gl re-exports all MapLibre APIs, new features are automatically available. To add custom integrations:

1. Import from 'maplibre-gl' in `src/index.js`
2. Add to the `exported` object
3. Update documentation
4. Test in examples

Example adding a new control:

```javascript
// In src/index.js
import { TerrainControl } from 'maplibre-gl';

// Add to destructuring
const { TerrainControl, ... } = maplibre;

// Add to exported object
exported.TerrainControl = TerrainControl;
```

### Building Custom Features

#### Extending BkoiGlMap

Add new methods to the `BkoiGlMap` class:

```javascript
class BkoiGlMap extends Map {
  // ... existing code

  customFeature(options) {
    // Implementation
    this.on("load", () => {
      // DOM manipulation or API calls
    });
  }
}
```

#### Adding Configuration

Extend `bkoiConfig` in `src/utils/config.js`:

```javascript
export const bkoiConfig = {
  ACCESS_TOKEN: null,
  DEFAULT_STYLE: "https://map.barikoi.com/styles/osm-liberty/style.json",
  NEW_FEATURE_ENABLED: false,
};
```

#### Constructor Options

Add new options to map initialization:

```javascript
constructor(mapOptions) {
  // ... existing validation

  if (mapOptions.customFeature) {
    this._initializeCustomFeature(mapOptions.customFeature);
  }
}
```

#### Utility Functions

Add helpers in `src/utils/`:

```javascript
// src/utils/custom-helpers.js
export function customValidator(input) {
  // Validation logic
}
```

## Build & Deployment

### Development Build

```bash
npm run build
```

Generates outputs in `dist/`:

- `esm/`: ES modules
- `cjs/`: CommonJS
- `iife/`: Browser-ready bundle

### Production Deployment

1. Build: `npm run build`
2. Test dist files
3. Publish: `npm publish`
4. Update CDN if applicable

### CDN Usage

The IIFE build can be used directly:

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://unpkg.com/bkoi-gl@latest/dist/style/bkoi-gl.css"
/>
<script src="https://unpkg.com/bkoi-gl@latest/dist/iife/bkoi-gl.js"></script>
<script>
  const map = new bkoigl.Map({
    /* options */
  });
</script>
```

## Support Resources

- [Barikoi Documentation](https://docs.barikoi.com/docs/maps-api)
- [MapLibre GL JS Docs](https://maplibre.org/maplibre-gl-js-docs/)
- [GitHub Issues](https://github.com/barikoi/bkoi-gl-js/issues)
- [Barikoi Support](mailto:support@barikoi.com)

## License

MIT License - see package.json for details.
