# TypeScript Migration Guide for bkoi-gl-js

A comprehensive guide to migrate bkoi-gl-js from JavaScript to TypeScript while leveraging maplibre-gl's existing TypeScript definitions.

## Table of Contents

- [Phase 1: Setup & Configuration](#phase-1-setup--configuration)
- [Phase 2: Create TypeScript Type Definitions](#phase-2-create-typescript-type-definitions)
- [Phase 3: Convert Main Files to TypeScript](#phase-3-convert-main-files-to-typescript)
- [Phase 4: Update Rollup Configuration](#phase-4-update-rollup-configuration)
- [Phase 5: Migration Steps](#phase-5-migration-steps)
- [Phase 6: Additional Improvements](#phase-6-additional-improvements)
- [Understanding the Build Output](#understanding-the-build-output)

---

## Phase 1: Setup & Configuration

### 1.1 Install TypeScript Dependencies

```bash
npm install --save-dev typescript @types/node tslib
npm install --save-dev @types/maplibre-gl
npm install --save-dev @rollup/plugin-typescript
```

### 1.2 Create `tsconfig.json`

Create this file in your project root:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 1.3 Update `package.json`

Replace your current package.json with this updated version:

```json
{
  "name": "bkoi-gl",
  "version": "3.0.0",
  "description": "A WebGL interactive maps library to use Barikoi maps and API",
  "type": "module",
  "main": "./dist/cjs/index.js",
  "module": "./dist/esm/index.js",
  "types": "./dist/esm/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/esm/index.d.ts",
        "default": "./dist/esm/index.js"
      },
      "require": {
        "types": "./dist/cjs/index.d.ts",
        "default": "./dist/cjs/index.js"
      }
    },
    "./dist/style/bkoi-gl.css": "./dist/style/bkoi-gl.css"
  },
  "style": "dist/style/bkoi-gl.css",
  "author": "barikoi",
  "readme": "README.md",
  "license": "MIT",
  "homepage": "https://docs.barikoi.com/docs/maps-api",
  "repository": {
    "type": "git",
    "url": "https://github.com/barikoi/bkoi-gl-js.git"
  },
  "engines": {
    "node": "^24.11.0"
  },
  "files": [
    "dist",
    "src",
    "README.md"
  ],
  "scripts": {
    "start": "node index.js",
    "build": "npm run typecheck && rollup --config",
    "build:ts": "tsc --noEmit",
    "prepare": "husky",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "maplibre-gl": "^5.13.0",
    "maplibre-gl-draw": "^1.6.9"
  },
  "devDependencies": {
    "@babel/core": "^7.16.0",
    "@babel/eslint-parser": "^7.16.0",
    "@babel/plugin-transform-runtime": "^7.17.0",
    "@babel/preset-env": "^7.16.0",
    "@commitlint/cli": "^19.4.1",
    "@commitlint/config-conventional": "^19.4.1",
    "@rollup/plugin-babel": "^6.0.4",
    "@rollup/plugin-commonjs": "^26.0.1",
    "@rollup/plugin-image": "^3.0.3",
    "@rollup/plugin-node-resolve": "^15.2.3",
    "@rollup/plugin-typescript": "^11.1.6",
    "@types/maplibre-gl": "latest",
    "@types/node": "latest",
    "eslint-config-mourner": "^3.0.0",
    "eslint-plugin-import": "^2.25.2",
    "husky": "^9.1.5",
    "rollup": "^2.79.1",
    "rollup-plugin-clear": "^2.0.7",
    "rollup-plugin-copy": "^3.5.0",
    "rollup-plugin-terser": "^7.0.2",
    "tslib": "latest",
    "typescript": "latest"
  },
  "keywords": [
    "bkoi-gl",
    "barikoi",
    "bangladesh",
    "location",
    "geocoding",
    "reverse geocoding",
    "autocomplete",
    "API",
    "maps",
    "address",
    "location data",
    "geospatial",
    "address lookup",
    "places",
    "geocoding API",
    "location API"
  ]
}
```

---

## Phase 2: Create TypeScript Type Definitions

### 2.1 Create `src/types/index.ts`

```typescript
import type { MapOptions, Map, ControlPosition } from 'maplibre-gl';
import type MapboxDraw from 'maplibre-gl-draw';

export interface BkoiMapOptions extends Omit<MapOptions, 'style' | 'accessToken'> {
  /**
   * Barikoi API access token for authentication
   */
  accessToken?: string;
  
  /**
   * Mapbox access token (if using Mapbox features)
   */
  mapboxAccessToken?: string;
  
  /**
   * Map style URL or Barikoi style identifier
   */
  style?: string;
  
  /**
   * Enable polygon drawing tools
   */
  polygon?: boolean;
  
  /**
   * Configuration options for maplibre-gl-draw
   */
  drawOptions?: Partial<MapboxDraw.DrawOptions>;
  
  /**
   * Array of style configurations for the style drawer
   */
  styles?: StyleConfig[];
}

export interface StyleConfig {
  /**
   * Style URL or identifier
   */
  style: string;
  
  /**
   * Thumbnail image URL for the style
   */
  image: string;
  
  /**
   * Display name for the style
   */
  name: string;
}

export interface BkoiConfig {
  ACCESS_TOKEN: string | null;
  DEFAULT_STYLE: string;
}

export interface ExportedAPI {
  version: string;
  supported: boolean;
  accessToken: string | null;
  mapboxAccessToken: string | null;
  baseApiUrl: string;
  maxParallelImageRequests: number;
  workerUrl: string;
  Map: typeof BkoiGlMap;
  // ... other maplibre exports
}
```

### 2.2 Create `src/utils/config.ts`

```typescript
export interface BkoiConfig {
  ACCESS_TOKEN: string | null;
  DEFAULT_STYLE: string;
}

export const bkoiConfig: BkoiConfig = {
  ACCESS_TOKEN: null,
  DEFAULT_STYLE: 'https://map.barikoi.com/styles/barikoi-light/style.json'
};
```

### 2.3 Create `src/utils/validator.ts`

```typescript
/**
 * Checks if a style URL is a Barikoi style
 * @param style - The style URL to check
 * @returns True if the style is a Barikoi style
 */
export function isBarikoiStyle(style: string): boolean {
  return style.includes('barikoi.com') || style.includes('map.barikoi');
}
```

---

## Phase 3: Convert Main Files to TypeScript

### 3.1 Create `src/index.ts`

```typescript
import maplibre, {
  Map,
  MapOptions,
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
  IControl
} from 'maplibre-gl';
import MapboxDraw from 'maplibre-gl-draw';
import { bkoiConfig } from './utils/config';
import { isBarikoiStyle } from './utils/validator';
import type { BkoiMapOptions, StyleConfig } from './types';

const {
  version,
  supported,
  setRTLTextPlugin,
  getRTLTextPluginStatus,
  config,
  prewarm,
  clearPrewarmedResources,
} = maplibre;

/**
 * Extended Map class with Barikoi integration
 * 
 * This class extends the base Maplibre GL Map with Barikoi-specific features:
 * - Custom Barikoi map styles with authentication
 * - Barikoi attribution and branding
 * - Drawing tools for polygons, lines, and points
 * - Style drawer for switching between map styles
 * 
 * @example
 * ```typescript
 * const map = new BkoiGlMap({
 *   container: 'map',
 *   accessToken: 'your-barikoi-token',
 *   center: [90.3938, 23.8103],
 *   zoom: 12,
 *   polygon: true
 * });
 * ```
 */
export class BkoiGlMap extends Map {
  private draw?: MapboxDraw;

  constructor(mapOptions: BkoiMapOptions) {
    // Validate access token for Barikoi styles
    if (
      !mapOptions.accessToken &&
      !bkoiConfig.ACCESS_TOKEN &&
      (!mapOptions.style || isBarikoiStyle(mapOptions.style))
    ) {
      console.error(
        'Please provide a valid accessToken to use Barikoi assets.'
      );
    }

    // Build the style URL with access token
    const styleUrl = mapOptions.style
      ? isBarikoiStyle(mapOptions.style)
        ? `${mapOptions.style}?key=${mapOptions.accessToken || bkoiConfig.ACCESS_TOKEN}`
        : mapOptions.style
      : `${bkoiConfig.DEFAULT_STYLE}?key=${mapOptions.accessToken || bkoiConfig.ACCESS_TOKEN}`;

    // Initialize parent Map class
    super({
      ...mapOptions,
      accessToken: mapOptions.mapboxAccessToken || undefined,
      attributionControl: false,
      style: styleUrl,
    } as MapOptions);

    // Setup attribution control
    this.setupAttributionControl();

    // Initialize features on map load
    this.once('load', () => {
      this.addBarikoiAttribution();
      
      if (mapOptions.polygon) {
        this.initializeDraw(mapOptions.drawOptions || {});
      }
      
      if (mapOptions.styles) {
        this.initializeStyleDrawer(mapOptions.styles);
      }
    });
  }

  /**
   * Setup custom attribution control with Barikoi, OpenMapTiles, and OSM links
   * @private
   */
  private setupAttributionControl(): void {
    const attributionControl = new AttributionControl({
      compact: true,
      customAttribution: '',
    });
    this.addControl(attributionControl, 'bottom-right');

    // Make attribution links clickable after control is added
    this.once('load', () => {
      setTimeout(() => {
        const container = this.getContainer();
        const attributionContainer = container.querySelector(
          '.maplibregl-ctrl-attrib'
        );
        
        if (attributionContainer) {
          const inner = attributionContainer.querySelector(
            '.maplibregl-ctrl-attrib-inner'
          );
          
          if (inner) {
            inner.innerHTML =
              '© <a href="https://www.barikoi.com" target="_blank">Barikoi</a> © <a href="https://openmaptiles.org" target="_blank">OpenMapTiles</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>';
          }
        }
      }, 0);
    });
  }

  /**
   * Add Barikoi logo attribution control to the map
   * @private
   */
  private addBarikoiAttribution(): void {
    const logoControl: IControl = {
      onAdd: (): HTMLElement => {
        const container = document.createElement('a');
        container.className = 'maplibregl-ctrl-logo';
        container.setAttribute('href', 'https://www.barikoi.com');
        container.setAttribute('target', '_blank');
        container.setAttribute('alt', 'Barikoi');
        return container;
      },
      onRemove: (): void => {
        // Cleanup if needed
      },
    };

    this.addControl(logoControl, 'bottom-left');
  }

  /**
   * Initialize maplibre-gl-draw for polygon drawing
   * @param drawOptions - Configuration options for the drawing tools
   * @private
   */
  private initializeDraw(drawOptions: Partial<MapboxDraw.DrawOptions>): void {
    const defaultOptions: MapboxDraw.DrawOptions = {
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      ...drawOptions,
    } as MapboxDraw.DrawOptions;

    this.draw = new MapboxDraw(defaultOptions);
    this.addControl(this.draw);
  }

  /**
   * Initialize style drawer UI for switching between map styles
   * @param styles - Array of style configurations
   * @private
   */
  private initializeStyleDrawer(styles: StyleConfig[]): void {
    const mapContainer = this.getContainer();

    // Create drawer container
    const drawer = document.createElement('div');
    drawer.className = 'style-drawer';
    drawer.style.maxHeight = '0';

    // Create toggle button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'style-drawer-toggle-button';
    toggleButton.innerHTML = '☰';

    // Toggle drawer visibility
    toggleButton.addEventListener('click', () => {
      const isOpen = drawer.style.maxHeight !== '0px';
      drawer.style.maxHeight = isOpen ? '0' : '400px';
      toggleButton.innerHTML = isOpen ? '☰' : '▲';
    });

    // Add style items
    styles.forEach(({ style, image, name }) => {
      const styleItem = this.createStyleItem(style, image, name);
      drawer.appendChild(styleItem);
    });

    mapContainer.appendChild(toggleButton);
    mapContainer.appendChild(drawer);
  }

  /**
   * Create a single style item for the drawer
   * @param style - Style URL
   * @param image - Thumbnail image URL
   * @param name - Display name
   * @returns HTML element for the style item
   * @private
   */
  private createStyleItem(style: string, image: string, name: string): HTMLDivElement {
    const styleItem = document.createElement('div');
    styleItem.className = 'style-item';
    styleItem.style.position = 'relative';
    styleItem.style.cursor = 'pointer';
    styleItem.style.marginBottom = '10px';

    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.overflow = 'hidden';

    const thumbnail = document.createElement('img');
    thumbnail.src = image;
    thumbnail.alt = name;
    thumbnail.style.width = '100%';
    thumbnail.style.height = '100%';
    thumbnail.style.objectFit = 'cover';
    thumbnail.style.transition = 'transform 0.3s';

    const nameOverlay = document.createElement('div');
    nameOverlay.innerText = name;
    Object.assign(nameOverlay.style, {
      position: 'absolute',
      top: '50%',
      width: '100%',
      height: '100%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      color: '#fff',
      fontWeight: 'bold',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: '4px',
      display: 'none',
    });

    // Hover effects
    styleItem.addEventListener('mouseenter', () => {
      thumbnail.style.transform = 'scale(1.05)';
      nameOverlay.style.display = 'block';
    });

    styleItem.addEventListener('mouseleave', () => {
      thumbnail.style.transform = 'scale(1)';
      nameOverlay.style.display = 'none';
    });

    // Style change on click
    styleItem.addEventListener('click', () => {
      this.setStyle(style);
    });

    wrapper.appendChild(thumbnail);
    wrapper.appendChild(nameOverlay);
    styleItem.appendChild(wrapper);

    return styleItem;
  }

  /**
   * Get the MapboxDraw instance if initialized
   * @returns The MapboxDraw instance or undefined if not initialized
   * @public
   */
  public getDraw(): MapboxDraw | undefined {
    return this.draw;
  }
}

// Export configuration and utilities
export { bkoiConfig } from './utils/config';
export { isBarikoiStyle } from './utils/validator';
export type * from './types';

// Default export with all Maplibre features + Barikoi extensions
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
  
  get accessToken(): string | null {
    return bkoiConfig.ACCESS_TOKEN;
  },
  set accessToken(token: string | null) {
    bkoiConfig.ACCESS_TOKEN = token;
  },
  
  get mapboxAccessToken(): string | undefined {
    return config.ACCESS_TOKEN;
  },
  set mapboxAccessToken(token: string | undefined) {
    config.ACCESS_TOKEN = token;
  },
  
  get baseApiUrl(): string {
    return config.API_URL;
  },
  set baseApiUrl(url: string) {
    config.API_URL = url;
  },
  
  get maxParallelImageRequests(): number {
    return config.MAX_PARALLEL_IMAGE_REQUESTS;
  },
  set maxParallelImageRequests(numRequests: number) {
    config.MAX_PARALLEL_IMAGE_REQUESTS = numRequests;
  },
  
  workerUrl: '',
};

export default exported;
```

---

## Phase 4: Update Rollup Configuration

### 4.1 Update `rollup.config.js`

Replace your current rollup.config.js with:

```javascript
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import clear from 'rollup-plugin-clear';
import copy from 'rollup-plugin-copy';
import image from '@rollup/plugin-image';

export default [
  // IIFE build for browsers
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/iife/bkoi-gl.js',
      format: 'iife',
      name: 'bkoigl',
      sourcemap: true,
      globals: {
        'maplibre-gl': 'maplibre',
        'maplibre-gl-draw': 'MapboxDraw',
      },
    },
    external: ['maplibre-gl', 'maplibre-gl-draw'],
    plugins: [
      clear({ targets: ['dist'] }),
      image(),
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        sourceMap: true,
      }),
      terser(),
      copy({
        targets: [
          { src: 'src/index.css', dest: 'dist/iife', rename: 'bkoi-gl.css' },
        ],
      }),
    ],
  },
  
  // ESM and CJS builds
  {
    input: 'src/index.ts',
    external: ['maplibre-gl', 'maplibre-gl-draw'],
    output: [
      {
        dir: 'dist/cjs',
        format: 'cjs',
        preserveModules: true,
        exports: 'auto',
        sourcemap: true,
      },
      {
        dir: 'dist/esm',
        format: 'es',
        preserveModules: true,
        exports: 'auto',
        sourcemap: true,
      },
    ],
    plugins: [
      clear({ targets: ['dist/cjs', 'dist/esm', 'dist/style'] }),
      image(),
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist/esm',
        rootDir: './src',
        sourceMap: true,
      }),
      terser(),
      copy({
        targets: [
          { src: 'src/index.css', dest: 'dist/style', rename: 'bkoi-gl.css' },
        ],
      }),
    ],
  },
];
```

---

## Phase 5: Migration Steps

### Step-by-Step Migration Process

Follow these steps in order:

#### Step 1: Backup Your Code

```bash
git checkout -b typescript-migration
git add .
git commit -m "Backup before TypeScript migration"
```

#### Step 2: Install Dependencies

```bash
npm install --save-dev typescript @types/node tslib @types/maplibre-gl @rollup/plugin-typescript
```

#### Step 3: Create Configuration Files

1. Create `tsconfig.json` (see Phase 1.2)
2. Update `package.json` (see Phase 1.3)
3. Update `rollup.config.js` (see Phase 4.1)

#### Step 4: Create Type Definitions

1. Create `src/types/index.ts` (see Phase 2.1)
2. Create `src/utils/config.ts` (see Phase 2.2)
3. Create `src/utils/validator.ts` (see Phase 2.3)

#### Step 5: Rename Files

```bash
# Rename JavaScript files to TypeScript
mv src/index.js src/index.ts
mv src/utils/config.js src/utils/config.ts
mv src/utils/validator.js src/utils/validator.ts
```

#### Step 6: Update Source Code

Replace the content of:
- `src/index.ts` (see Phase 3.1)
- `src/utils/config.ts` (already done in Phase 2.2)
- `src/utils/validator.ts` (already done in Phase 2.3)

#### Step 7: Type Check

```bash
npm run typecheck
```

Fix any type errors that appear.

#### Step 8: Build

```bash
npm run build
```

#### Step 9: Verify Build Output

Check that these files exist:

```
dist/
├── esm/
│   ├── index.js
│   ├── index.d.ts        ← Type definitions
│   ├── index.js.map
│   └── utils/
│       ├── config.js
│       ├── config.d.ts   ← Type definitions
│       └── ...
├── cjs/
│   ├── index.js
│   ├── index.d.ts        ← Type definitions
│   └── ...
└── iife/
    └── bkoi-gl.js
```

#### Step 10: Test in a Sample Project

Create a test project to verify everything works:

```bash
mkdir test-project
cd test-project
npm init -y
npm install ../path-to-your-package

# Create test file
cat > test.ts << 'EOF'
import bkoigl from 'bkoi-gl';

const map = new bkoigl.Map({
  container: 'map',
  accessToken: 'test-token',
  center: [90.3938, 23.8103],
  zoom: 12,
  polygon: true
});
EOF
```

#### Step 11: Commit Changes

```bash
git add .
git commit -m "feat: migrate to TypeScript"
```

---

## Phase 6: Additional Improvements

### 6.1 Add ESLint for TypeScript

Install ESLint with TypeScript support:

```bash
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint
```

Create `.eslintrc.json`:

```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "plugins": ["@typescript-eslint"],
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "rules": {
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { 
      "argsIgnorePattern": "^_" 
    }]
  }
}
```

### 6.2 Add Prettier for Code Formatting

```bash
npm install --save-dev prettier
```

Create `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

### 6.3 Update Package Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "build": "npm run typecheck && rollup --config",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "format:check": "prettier --check \"src/**/*.ts\""
  }
}
```

### 6.4 Add Pre-commit Hooks with Husky

Update your husky configuration to run type checking:

```bash
# Create pre-commit hook
npx husky add .husky/pre-commit "npm run typecheck && npm run lint"
```

### 6.5 Add CI/CD Type Checking

If you're using GitHub Actions, add a workflow file `.github/workflows/typecheck.yml`:

```yaml
name: Type Check

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  typecheck:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '24.11.0'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run type check
      run: npm run typecheck
    
    - name: Run linter
      run: npm run lint
    
    - name: Build
      run: npm run build
```

---

## Understanding the Build Output

### Why JavaScript Output Files?

TypeScript code compiles to JavaScript because:

1. **Browsers execute JavaScript** - Not TypeScript
2. **Node.js executes JavaScript** - Not TypeScript
3. **Universal compatibility** - Works everywhere

### What Gets Generated

```
TypeScript Source (.ts) 
    ↓ TypeScript Compiler
JavaScript (.js) + Type Definitions (.d.ts)
```

**Generated Files:**

- `*.js` - Executable JavaScript code
- `*.d.ts` - Type definitions for TypeScript consumers
- `*.js.map` - Source maps for debugging

### How TypeScript Consumers Benefit

When someone uses your package:

```typescript
// Consumer's TypeScript code
import bkoigl from 'bkoi-gl';  // Imports index.js

// TypeScript reads index.d.ts for type information
const map = new bkoigl.Map({
  accessToken: 'xxx',  // ← TypeScript knows this option exists
  polygon: true        // ← Gets autocomplete and validation
});
```

### The package.json Magic

```json
{
  "main": "./dist/cjs/index.js",      // Runtime code for CommonJS
  "module": "./dist/esm/index.js",    // Runtime code for ES Modules
  "types": "./dist/esm/index.d.ts",   // Type information
  "exports": {
    ".": {
      "import": {
        "types": "./dist/esm/index.d.ts",  // Types for ESM
        "default": "./dist/esm/index.js"   // Runtime for ESM
      },
      "require": {
        "types": "./dist/cjs/index.d.ts",  // Types for CJS
        "default": "./dist/cjs/index.js"   // Runtime for CJS
      }
    }
  }
}
```

This configuration tells:
- **Node.js/Bundlers**: Use the `.js` files
- **TypeScript**: Use the `.d.ts` files for type checking

### Benefits Summary

✅ **You write TypeScript** - Better DX, fewer bugs  
✅ **You publish JavaScript + .d.ts** - Universal compatibility  
✅ **TypeScript users get types** - Autocomplete, validation  
✅ **JavaScript users work normally** - No TS required  

This is the standard approach used by all major libraries (React, Vue, maplibre-gl, etc.).