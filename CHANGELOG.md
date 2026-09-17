# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.0.0] - Unreleased

Major release: the underlying engine migrates to **MapLibre GL JS v6** (bundled — maplibre is no longer a peer you install or configure) and the package ships a self-contained Web Worker, making map rendering zero-config in every bundler.

### Added
- **Zero-config map rendering in every bundler.** The package ships a self-contained Web Worker and registers it automatically before the first map is constructed — no `setWorkerUrl()` call, no bundler worker rules, no files to copy. New `bkoi-gl/worker` export for strict-CSP environments that need the worker as a separate file.
- **Per-framework integration guides** (`docs/frameworks/`) for React, CRA, Next.js, Vue, Nuxt, Svelte, SvelteKit, and Angular — each a reflection of the validated compatibility matrix, linked from the README's new Framework Integration section.

### Breaking (relative to 3.3.0)
- **MapLibre GL JS v6 bundled.** WebGL2 is required (unsupported browsers throw `GPUInitializationError` and cannot render). Check event-payload fields your code relies on against the v6 event contracts when upgrading.
- **Manual worker setups removed (and no longer needed)** — consumers who hosted or intercepted the maplibre worker themselves must switch to the bundled worker or the `bkoi-gl/worker` export.
- **Jest replaced by Vitest** (dev-facing): unit (jsdom, mocked engine) + browser (real WebGL in Chromium) projects.

### Changed
- **Attribution renders exactly once and stays expanded**, surviving every style/source rebuild instead of duplicating copyright text.
- **Barikoi logo matches the sibling `react-bkoi-gl` styling** (88×23, bottom-left, other bottom-left controls stack above it).
- All `npm audit` vulnerabilities resolved (13 → 0); unused dependencies removed.
- The stale `DEVELOPER_GUIDE.md` (and duplicate `env.example`) replaced by `CONTRIBUTING.md`.

### Testing
- **End-to-end suite runs against the built package** (`dist/`, not sources): map init/style, controls, drawing, markers/popups, and UMD script-tag usage.
- **README examples are executable contracts** — every fenced example runs automatically against the built artifact; a documented example that stops working fails CI (`npm run check:readme`).
- **Framework compatibility suite** — real consumer apps (React 18+19, Vue 2+3, Svelte 4+5, Next.js 15+16 in Turbopack and webpack modes, CRA 5, Nuxt 3+4, SvelteKit 2, Angular 20+21) install the packed tarball across npm/pnpm/yarn/bun and are verified for actual tile rendering (worker constructed + 200, engine `load` + `idle`, no page errors). 8 frameworks / 14 apps / 15 build cells.
- **The framework matrix caught a real consumer-breaking bug before release** — maplibre v6's cross-origin worker wrapper uses `new URL(<dynamic>, import.meta.url)`, which Next.js 16 Turbopack treats as an unresolvable asset import once inlined into `bkoi-gl/dist`. The base argument is provably dead on that path, so the build strips it and `test:pack` guards that it stays gone.
- **Headed review flows** — `npm run e2e:review` walks every e2e case and `npm run test:framework:review` walks the full framework matrix, in one visible browser with a HUD; a uniform (white) canvas is reported as a failure.
- **e2e coverage report** (`npm run e2e:coverage`) mapping README claims to cases; showcase screenshot capture (`npm run screenshots`).
- **Pre-publish smoke tests** — pack tarball + package-manager resolution (npm, pnpm, yarn, bun): exports map, `./style.css` and `./worker` subpaths, CJS `require()` support.
- **100% statement/branch/function/line coverage enforced** across the unit + browser projects; README carries a feature matrix mapping every documented feature to its automated verification.
- **CI** — every push to `main` runs a full gate (typecheck, lint, unit coverage → Codecov, build, pack/resolution smoke) with CodeQL in parallel, and a scheduled run exercises the whole framework matrix; publishing stays manual.

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
