# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.0.0] - 05-10-2026

Major release: the underlying engine migrates to **MapLibre GL JS v6** (bundled — maplibre is no longer a peer you install or configure; WebGL2 required) and the package ships a self-contained Web Worker, making map rendering zero-config in every bundler.

### Added
- **Zero-config map rendering in every bundler** — the self-contained Web Worker registers automatically before the first map is constructed; no `setWorkerUrl()` call, no bundler worker rules, no files to copy. New `bkoi-gl/worker` export for strict-CSP environments.
- **Typed `draw.*` events** — all nine maplibre-gl-draw events carry typed payloads on `Map.on/once/off`.
- **Per-framework integration guides** (`docs/frameworks/`) for React, CRA, Next.js, Vue, Nuxt, Svelte, SvelteKit, and Angular, each backed by a validated compatibility matrix.

### Breaking (relative to 3.3.0)
- **Remove any manual worker setup** — `maplibregl.workerUrl` assignments, hosted worker files, and bundler worker rules are obsolete; the bundled worker registers itself. Only strict-CSP environments need the `bkoi-gl/worker` export.
- **WebGL2 is required** — unsupported browsers throw `GPUInitializationError` and cannot render.
- **Check event payloads** your code reads (`Map.on` handlers) against the MapLibre v6 event contracts.

### Fixed
- **Minimap no longer crashes after `setStyle`** — a style swap wiped the parent-rectangle source; the next parent move hit a non-null assertion. The overlay is now re-created on the new style's `style.load` (maplibre fires `load` only once per map).

## [3.3.0] - 18-02-2026

### Added
- **Minimap Control** - Synchronized overview map with parent map
  - Bidirectional movement sync between parent and minimap
  - Optional parent rectangle overlay showing viewport boundaries
  - Automatic style inheritance from parent map
  - Custom styles, zoom levels, and positioning
  - Toggle button to minimize/maximize the minimap
  - Configurable interactions control
  - Full API access for style and layer manipulation
- **Minimap Responsive Sizing** - Dynamic sizing based on window dimensions
  - Viewport-relative width/height (vw, vh units)
  - Min/max size constraints
  - Automatic resize on window change
- Minimap feature documentation
- Test cases for the minimap feature
- Button for polygon rotation draw mode
- Branding & Attribution section in README

## [3.2.0] - 16-02-2026

### Changed
- Refactored README with section and codeblock styling
- Included events, options details at README for map and draw features
- Updated minimap test cases with responsive sizing tests

### Fixed
- Renamed `licence` to `license` for correct spelling
- Minimap style issue
- Draw polygon cursor issue
- Toggle button tooltip in minimap
- Barikoi logo CSS to properly override MapLibre default logo

## [3.1.0] - 18-12-2025

### Added
- Features test cases
- Format specific test cases
- Sourcemap in output

### Changed
- Updated package.json, rollup config, docs, test cases
- Refactored rollup config and fixed type declaration issues
- Migrated to modern rollup config
- Upgraded rollup and plugins
- Updated developer guide and TypeScript migration guide for new build outputs

### Fixed
- Resolved linting and config issues
- Test import paths updated to new dist structure

## [3.0.0] - 18-12-2025

Major release: full TypeScript migration — source converted from JavaScript to TypeScript, with shipped type definitions.

### Breaking (relative to 2.0.4)
- Full TypeScript migration - source files converted from JavaScript to TypeScript

### Added
- **TypeScript Support** - Full TypeScript migration with type definitions
  - TypeScript configuration and dependencies
  - JSDoc type annotations for TypeScript support
  - TypeScript definitions added
  - Source converted to TypeScript
- **ESLint v9+ Migration** - Modern ESLint configuration with Prettier
- Husky pre-commit hooks with lint-staged
- Examples, updated docs
- Enhanced local testing instructions and polygon drawing event listeners

### Changed
- Finalized build and lint configuration
- Updated configuration for TypeScript migration
- Updated README for TypeScript migration
- Included TypeScript migration guide
- Updated developer guide, README, and folder structure
- Overrode CSS, examples, utils

### Fixed
- Resolved type errors and removed old JavaScript source files
- Refactored exports to support TypeScript declarations
- Style drawer issue
- Resolved 5 npm vulnerabilities issue
- Logo and attribution styles

## [2.0.4] - 22-01-2025

### Added
- **Styles Layer** - Switchable map styles feature

### Changed
- Updated the package versions

## [2.0.3] - 21-01-2025

### Fixed
- Polygon CSS issue
- Extra icon for each component

## [2.0.2] - 20-01-2025

### Added
- **Polygon Drawing** - Added polygon layer for drawing functionality

## [2.0.1] - 19-01-2025

### Changed
- Production ready for version 2

## [2.0.0] - 16-01-2025

### Added
- Polygon drawing support with maplibre-gl-draw integration

### Changed
- Upgraded CDN v2
- Updated package.json files directive

### Fixed
- Updated Barikoi logo and attribution

## [1.1.1] - 11-09-2024

### Added
- Husky for git hooks

### Changed
- Updated dependency package versions

## [1.1.0] - 16-11-2023

### Added
- README.md file

### Changed
- Updated MapLibre version

### Fixed
- Fixed Barikoi logo visibility issue
- Updated docs homepage URL

## [1.0.10] - 16-03-2022

### Changed
- Updated Rollup Build Config
- Updated NPM build

### Fixed
- Removed package.json files prop

## [1.0.9] - 16-03-2022

### Fixed
- Updated package.json main/module path

## [1.0.3] - 31-10-2021

### Changed
- Bumped License to "BSD-3-Clause" from "ISC"
- Updated for NPM package

## [1.0.2] - 24-10-2021

### Added
- Barikoi Map accessToken Validation

### Changed
- Bumped maplibre-gl from v1.14.0 to v2.0.0-pre.1

## [1.0.1] - 04-07-2021

### Changed
- Separated Bkoi GL Draw

## [1.0.0] - 12-04-2021

Initial release.

### Added
- Map, Navigation, GeoLocate controls
- Popup, Marker
- Bkoi-gl-draw
- Switchable Map Styles & GL Draw
- Mapbox accessToken option
- Exported LngLatBounds

### Fixed
- Fixed switchable style types
