# bkoi-gl-js Developer Guide

## Overview

**bkoi-gl-js** is a JavaScript library built on top of MapLibre GL JS, specifically built for seamless integration with Barikoi Maps and location services. It provides a thin wrapper around MapLibre GL v5.13.0 with Barikoi-specific enhancements including automatic attribution, drawing tools, and style management.

The package is maintained as an npm module with ES module support, targeting modern web applications including React, Next.js, and vanilla JavaScript projects.

## Architecture

### Core Components

1. **BkoiGlMap Class** (`src/index.js`)
   - Extends MapLibre's `Map` class
   - Handles Barikoi-specific initialization
   - Manages attribution, drawing, and styling features

2. **Configuration System** (`src/util/config.js`)
   - Stores access tokens and default styles
   - Provides centralized configuration management

3. **Validation Utilities** (`src/util/validator.js`)
   - Contains helper functions for style validation
   - Detects Barikoi vs. custom map styles

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
│   └── util/
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
import { Map } from 'bkoi-gl';

// Basic usage
const map = new Map({
  container: 'map',
  center: [90.39, 23.72], // Dhaka coordinates
  zoom: 10,
  accessToken: 'BARIKOI_API_KEY'
});
```

### Constructor Options

- `accessToken`: Required for Barikoi styles
- `polygon`: Enable drawing tools
- `drawOptions`: Configure drawing controls
- `styles`: Array of style objects for style drawer

### Barikoi Attribution

Automatically adds Barikoi logo and attribution on map load. The logo resizes responsively and links to barikoi.com.

### Drawing Tools

When `polygon: true` is set:

```javascript
const map = new Map({
  container: 'map',
  // ... other options
  polygon: true,
  drawOptions: {
    controls: {
      polygon: true,
      trash: true
    }
  }
});
```

### Style Drawer

Allows users to switch between map styles:

```javascript
const map = new Map({
  container: 'map',
  // ... other options
  styles: [
    {
      name: 'Light',
      style: 'https://map.barikoi.com/styles/light/style.json',
      image: 'preview-light.png'
    },
    {
      name: 'Dark',
      style: 'https://map.barikoi.com/styles/dark/style.json',
      image: 'preview-dark.png'
    }
  ]
});
```

## Configuration Management

### Access Tokens

```javascript
import { accessToken } from 'bkoi-gl';

// Set globally
accessToken = 'BARIKOI_API_KEY';

// Or per instance
const map = new Map({
  accessToken: 'BARIKOI_API_KEY'
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

### Testing

- Test in `examples/index.html`
- Verify builds work: `npm run build`
- Check browser console for errors
- Test React/Next.js integration

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
    this.on('load', () => {
      // DOM manipulation or API calls
    });
  }
}
```

#### Adding Configuration

Extend `bkoiConfig` in `src/util/config.js`:

```javascript
export const bkoiConfig = {
  ACCESS_TOKEN: null,
  DEFAULT_STYLE: 'https://map.barikoi.com/styles/osm-liberty/style.json',
  NEW_FEATURE_ENABLED: false
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

Add helpers in `src/util/`:

```javascript
// src/util/custom-helpers.js
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
<script src="https://cdn.barikoi.com/bkoi-gl-js/dist/bkoi-gl.js"></script>
<script>
  const map = new bkoigl.Map({ /* options */ });
</script>
```

## Troubleshooting

### Common Issues

#### API Key Errors
- Ensure `accessToken` is set for Barikoi styles
- Check API key validity on Barikoi dashboard

#### Map Not Loading
- Check container element exists
- Verify center/zoom values are valid
- Check browser console for MapLibre errors

#### Attribution Issues
- Ensure map container has proper dimensions
- Check for CSS conflicts with `.maplibregl-*` classes
- Verify ResizeObserver support in target browsers

#### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
- Verify external dependencies are available

### Debug Tips

- Enable MapLibre debug mode: `localStorage.setItem('maplibre:debug', 'true')`
- Check network tab for failed asset requests
- Use browser dev tools to inspect map container DOM
- Test with minimal example first

## Support Resources

- [Barikoi Documentation](https://docs.barikoi.com/docs/maps-api)
- [MapLibre GL JS Docs](https://maplibre.org/maplibre-gl-js-docs/)
- [GitHub Issues](https://github.com/barikoi/bkoi-gl-js/issues)
- [Barikoi Support](mailto:support@barikoi.com)

## License

MIT License - see package.json for details.
