# Barikoi GL JS Developer Guide

## Overview

**bkoi-gl-js** is a JavaScript library built on top of MapLibre GL JS, specifically built for seamless integration with Barikoi Maps and location services. It provides a thin wrapper around MapLibre GL v5.13.0 with Barikoi-specific enhancements including automatic attribution, drawing tools, and style management.

The package is maintained as an npm module with ES module support, targeting modern web applications including React, Next.js, and vanilla JavaScript projects.

## Architecture

### Core Components

1. **BkoiGlMap Class** (`src/index.ts`)

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

3. **Configuration System** (`src/utils/config.ts`)

   - **Purpose**: Contains default configuration settings for the bkoi-gl-js library
   - Stores Barikoi access tokens and default map style URLs
   - Provides centralized configuration management used throughout the library

4. **Validation Utilities** (`src/utils/validator.ts`)
   - **Purpose**: Contains utility functions for validating Barikoi-specific inputs
   - Includes functions like checking if a map style URL is a Barikoi style
   - Helps ensure proper integration with Barikoi services

### Build System

- **Rollup**: Bundles TypeScript to multiple formats (ESM, CJS, IIFE, UMD)
- **TypeScript**: Compiles TypeScript source code and generates type definitions (.d.ts, .d.cts)
- **Dependencies**: All dependencies (including MapLibre GL and maplibre-gl-draw) are bundled in all formats
- **CSS Processing**: Source styles are copied to distribution folders

## Getting Started

### Prerequisites

- Node.js >=18.0.0
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
```

### Project Structure

```
bkoi-gl-js/
├── src/                          # Source code
│   ├── index.ts                  # Main library entry point
│   ├── index.css                 # Library styles
│   ├── types/                    # TypeScript type definitions
│   │   └── index.ts
│   └── utils/                    # Helper functions
│       ├── config.ts
│       └── validator.ts
├── test/                         # Comprehensive test suite (333 tests)
│   ├── accessibility/            # Accessibility compliance tests
│   │   └── accessibility.test.js
│   ├── build/                    # Build output verification tests
│   │   ├── cjs.test.js          # CommonJS build tests
│   │   ├── esm.test.js          # ES module build tests
│   │   ├── iife.test.js         # IIFE build tests
│   │   └── umd.test.js          # UMD build tests
│   ├── features/                 # Feature-specific tests
│   │   ├── attribution-control.test.js
│   │   ├── fullscreen-control.test.js
│   │   ├── geolocate-control.test.js
│   │   ├── navigation-control.test.js
│   │   ├── polygon-drawing.test.js
│   │   ├── scale-control.test.js
│   │   └── style-drawer.test.js
│   ├── integration/              # Integration test suite
│   │   └── integration.test.js
│   ├── performance/              # Performance test suite
│   │   └── performance.test.js
│   ├── accessibility/            # Accessibility compliance tests
│   │   └── accessibility.test.js
│   ├── docs/                     # Test documentation
│   │   └── TEST_ANALYSIS.md
│   └── config/                   # Test configuration files
│       ├── babel-setup.js
│       ├── browser-env.js
│       └── setup.js
├── dist/                         # Built outputs (generated)
│   ├── index.js                  # ES module bundle
│   ├── index.cjs                 # CommonJS bundle
│   ├── index.d.ts                # TypeScript definitions (ESM)
│   ├── index.d.cts               # TypeScript definitions (CJS)
│   ├── iife/                     # Browser IIFE bundle
│   │   └── bkoi-gl.js
│   ├── umd/                      # UMD bundle
│   │   └── bkoi-gl.js
│   └── style/                    # CSS styles
│       └── bkoi-gl.css
├── examples/                     # Integration demos
│   └── index.html
├── coverage/                     # Test coverage reports (generated)
├── .vscode/                      # VS Code configuration
├── bkoi-gl-*.tgz                 # Packaged releases (generated)
└── Config files                 # package.json, rollup.config.js, etc.
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

### Commit Conventions

Uses conventional commits with commitlint:

```bash
<type>[optional scope]: <description>

# Examples
feat: add polygon drawing support
feat(map): add new control types
fix: resolve attribution positioning bug
fix(draw): fix polygon deletion event
docs: update API documentation
docs(examples): add Next.js integration example
refactor: simplify map initialization logic
```

### Development Workflow

1. **Fork the repository** to your GitHub account
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/bkoi-gl-js.git
   cd bkoi-gl-js
   ```
3. **Create a feature branch** from `dev`:
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/your-feature-name
   ```
4. Make changes following existing code patterns
5. Build and test locally:
   ```bash
   npm run build
   ```
6. Test in separate projects (see Testing & Local Development section)
7. Commit your changes and push to your fork:
   ```bash
   git add .
   git commit -m "feat: description of your changes"
   git push origin feature/your-feature-name
   ```
8. **Create a pull request** from your fork's branch to the main repository's `dev` branch

**Note:** Do NOT push to main branch directly. All changes should go through pull requests for review.

### Code Review Guidelines

**Before submitting PR:**

- [ ] Code follows existing patterns in the codebase
- [ ] No console.log statements in production code
- [ ] MapLibre GL APIs used correctly
- [ ] Barikoi integration maintained
- [ ] Build passes: `npm run build`

**PR Description should include:**

- What feature/fix was implemented
- Which frameworks were tested
- Screenshots if UI changes
- Breaking changes noted

## Testing & Local Development

**Do NOT use `npm link` for testing.** Instead, use the `.tgz` tarball method for reliable, isolated testing across all supported frameworks.

### Development Testing Workflow

1. **Make changes** to the library code in `src/`
2. **Build the package:**
   ```bash
   npm run build
   ```
3. **Generate a tarball:**

   ```bash
   npm pack
   ```

   This creates `bkoi-gl-3.0.0.tgz` in your project root.

4. **Test in separate projects:**
   Copy the generated `.tgz` file to a separate test project or install it using a relative/absolute path:

   ```bash
   # Option 1: Copy file to existing test project
   cp bkoi-gl-3.0.0.tgz ../test-project/
   cd ../test-project
   npm install ./bkoi-gl-3.0.0.tgz

   # Option 2: Install using relative path
   cd ../test-project
   npm install ../bkoi-gl-js/bkoi-gl-3.0.0.tgz

   # Option 3: Install using absolute path
   cd /path/to/test/project
   npm install /absolute/path/to/bkoi-gl-js/bkoi-gl-3.0.0.tgz
   ```

  **Note:** The `examples/` folder contains pre-built integration demos for documentation purposes. For actual testing during development, always create separate test projects that install the `.tgz` file to ensure proper dependency resolution and isolation.

### Testing Checklist

Before committing changes, verify:

- [ ] **Vanilla JS**: Map renders, controls work, drawing tools function
- [ ] **React**: Component mounts, hooks work, no React warnings
- [ ] **Next.js**: SSR compatible, dynamic imports work
- [ ] **Vite**: Builds successfully, HMR works
- [ ] **Barikoi**: Attribution displays, API key handling works

### Troubleshooting Tests

- **Build fails**: Check for TypeScript errors or missing dependencies
- **Import errors**: Verify `npm run build` completed successfully
- **Map not rendering**: Check container div has dimensions, API key is set
- **Drawing tools broken**: Ensure `polygon: true` in map options
- **Version conflicts**: Clear `node_modules` and reinstall tarball

## Release Process

### Pre-Publishing Checklist

Run these commands before publishing to ensure package quality:

```bash
# 1. Check package configuration
npx publint

# 2. Verify TypeScript types
npx @arethetypeswrong/cli --pack .

# 3. Build the project
npm run build

# 4. Generate and verify tarball
npm pack

# 5. Check package size
# Look for "package size:" in the npm pack output above
# Ensure it's reasonable for your library (typically < 5MB for bundled libs)
```

## 📝 Understanding the Tool Outputs

**publint**: Should show "All good!" for a properly configured package.

**@arethetypeswrong/cli**: May show resolution failures for CSS files and subpaths. These are expected and can be ignored - the tool can't resolve non-JavaScript files, which is normal for library packages. The important thing is that the main package resolution works.

**npm pack**: Look for "package size:" in the output. Ensure it's reasonable for your library (typically < 5MB for bundled libraries). The current package is 4.0 MB which is acceptable.

### Publishing Steps

1. **Update version** in `package.json`
2. **Run the pre-publishing checklist** (above)
3. **Test the build** in separate projects using the tarball method
4. **Generate final tarball**: `npm pack`
5. **Test tarball installation** in a separate project
6. **Publish to npm**: `npm publish`
7. **Update CDN** if applicable
8. **Create GitHub release** with changelog

### CDN Usage (After Publication)

After publishing to npm, the IIFE build can be used directly from CDN:

```html
<link
  rel="stylesheet"
  href="https://unpkg.com/bkoi-gl@latest/dist/style/bkoi-gl.css"
/>
<script src="https://unpkg.com/bkoi-gl@latest/dist/iife/bkoi-gl.js"></script>
<script>
  const map = new bkoigl.Map({
    /* options */
  });
</script>
```

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

- `index.js`: ES module (bundled single file)
- `index.cjs`: CommonJS (bundled single file)
- `index.d.ts`: TypeScript type definitions for ESM
- `index.d.cts`: TypeScript type definitions for CJS
- `iife/bkoi-gl.js`: Browser-ready IIFE bundle with all dependencies (with sourcemap)
- `umd/bkoi-gl.js`: UMD bundle with all dependencies (with sourcemap)
- `style/bkoi-gl.css`: Stylesheet for map components

### Production Deployment

1. Build: `npm run build`
2. Test dist files
3. Publish: `npm publish`
4. Update CDN if applicable

## Support Resources

- [Barikoi Documentation](https://docs.barikoi.com/docs/maps-api)
- [MapLibre GL JS Docs](https://maplibre.org/maplibre-gl-js-docs/)
- [GitHub Issues](https://github.com/barikoi/bkoi-gl-js/issues)
- [Barikoi Support](mailto:support@barikoi.com)

## License

MIT License - see package.json for details.
