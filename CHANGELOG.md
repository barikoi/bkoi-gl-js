# Changelog

All notable changes to this project will be documented in this file.

---

## [3.3.0] - February 18, 2026

### Added

- **Minimap Control** - Synchronized overview map with parent map
  by [@sarikamahboob](https://github.com/sarikamahboob) in [`bb68ee9`](https://github.com/barikoi/bkoi-gl-js/commit/bb68ee9)
  - Bidirectional movement sync between parent and minimap
  - Optional parent rectangle overlay showing viewport boundaries
  - Automatic style inheritance from parent map
  - Custom styles, zoom levels, and positioning
  - Toggle button to minimize/maximize the minimap
  - Configurable interactions control
  - Full API access for style and layer manipulation
- **Minimap Responsive Sizing** - Dynamic sizing based on window dimensions
  by [@sarikamahboob](https://github.com/sarikamahboob) in [`51b9cfb`](https://github.com/barikoi/bkoi-gl-js/commit/51b9cfb)
  - Viewport-relative width/height (vw, vh units)
  - Min/max size constraints
  - Automatic resize on window change
- Minimap feature documentation
  by [@sarikamahboob](https://github.com/sarikamahboob) in [`35460b0`](https://github.com/barikoi/bkoi-gl-js/commit/35460b0)
- Test cases for the minimap feature
  by [@sarikamahboob](https://github.com/sarikamahboob) in [`2410dea`](https://github.com/barikoi/bkoi-gl-js/commit/2410dea)
- Button for polygon rotation draw mode
  by [@sarikamahboob](https://github.com/sarikamahboob) in [`b0bc3ab`](https://github.com/barikoi/bkoi-gl-js/commit/b0bc3ab)
- Branding & Attribution section in README
  by [@sarikamahboob](https://github.com/sarikamahboob) in [`51b9cfb`](https://github.com/barikoi/bkoi-gl-js/commit/51b9cfb)

## [3.2.0] - February 16, 2026

### Changed

- Refactored README with section and codeblock styling
  by [@nurmdrafi](https://github.com/nurmdrafi) in [`6fac503`](https://github.com/barikoi/bkoi-gl-js/commit/6fac503)
- Included events, options details at README for map and draw features
  by [@nurmdrafi](https://github.com/nurmdrafi) in [`0229d2d`](https://github.com/barikoi/bkoi-gl-js/commit/0229d2d)
- Updated minimap test cases with responsive sizing tests
  by [@sarikamahboob](https://github.com/sarikamahboob) in [`51b9cfb`](https://github.com/barikoi/bkoi-gl-js/commit/51b9cfb)

### Fixed

- Renamed `licence` to `license` for correct spelling
  by [@nurmdrafi](https://github.com/nurmdrafi) in [`a25434f`](https://github.com/barikoi/bkoi-gl-js/commit/a25434f)
- Minimap style issue
  by [@sarikamahboob](https://github.com/sarikamahboob) in [`b65ed13`](https://github.com/barikoi/bkoi-gl-js/commit/b65ed13)
- Draw polygon cursor issue
  by [@sarikamahboob](https://github.com/sarikamahboob) in [`6c1c806`](https://github.com/barikoi/bkoi-gl-js/commit/6c1c806)
- Toggle button tooltip in minimap
  by [@sarikamahboob](https://github.com/sarikamahboob) in [`fc8ca18`](https://github.com/barikoi/bkoi-gl-js/commit/fc8ca18)
- Barikoi logo CSS to properly override MapLibre default logo
  by [@sarikamahboob](https://github.com/sarikamahboob) in [`51b9cfb`](https://github.com/barikoi/bkoi-gl-js/commit/51b9cfb)

---

## [3.1.0] - December 18, 2025

### Added

- Features test cases
  by [@sarikamahboob](https://github.com/sarikamahboob) in [`a8b5c5f`](https://github.com/barikoi/bkoi-gl-js/commit/a8b5c5f)
- Format specific test cases
  by [@nurmdrafi](https://github.com/nurmdrafi) in [`59035ee`](https://github.com/barikoi/bkoi-gl-js/commit/59035ee)
- Sourcemap in output
  by [@ArafatHossan](https://github.com/ArafatHossan) in [`d2e28ba`](https://github.com/barikoi/bkoi-gl-js/commit/d2e28ba)

### Changed

- Updated package.json, rollup config, docs, test cases
  by [@nurmdrafi](https://github.com/nurmdrafi) in [`6dd276c`](https://github.com/barikoi/bkoi-gl-js/commit/6dd276c)
- Refactored rollup config and fixed type declaration issues
  by [@nurmdrafi](https://github.com/nurmdrafi) in [`0642828`](https://github.com/barikoi/bkoi-gl-js/commit/0642828)
- Migrated to modern rollup config
  by [@ArafatHossan](https://github.com/ArafatHossan) in [`77b228a`](https://github.com/barikoi/bkoi-gl-js/commit/77b228a)
- Upgraded rollup and plugins
  by [@ArafatHossan](https://github.com/ArafatHossan) in [`c0ed3fd`](https://github.com/barikoi/bkoi-gl-js/commit/c0ed3fd)
- Updated developer guide and TypeScript migration guide for new build outputs
  by [@ArafatHossan](https://github.com/ArafatHossan) in [`9758a63`](https://github.com/barikoi/bkoi-gl-js/commit/9758a63)

### Fixed

- Resolved linting and config issues
  by [@ArafatHossan](https://github.com/ArafatHossan) in [`ca5a794`](https://github.com/barikoi/bkoi-gl-js/commit/ca5a794)
- Test import paths updated to new dist structure
  by [@ArafatHossan](https://github.com/ArafatHossan) in [`f2cb891`](https://github.com/barikoi/bkoi-gl-js/commit/f2cb891)

---

## [3.0.0] - December 18, 2025

### Breaking Changes

- Full TypeScript migration - source files converted from JavaScript to TypeScript

### Added

- **TypeScript Support** - Full TypeScript migration with type definitions
  - TypeScript configuration and dependencies
    by [@ArafatHossan](https://github.com/ArafatHossan) in [`243d10f`](https://github.com/barikoi/bkoi-gl-js/commit/243d10f)
  - JSDoc type annotations for TypeScript support
    by [@ArafatHossan](https://github.com/ArafatHossan) in [`336bcaa`](https://github.com/barikoi/bkoi-gl-js/commit/336bcaa)
  - TypeScript definitions added
    by [@ArafatHossan](https://github.com/ArafatHossan) in [`a884012`](https://github.com/barikoi/bkoi-gl-js/commit/a884012)
  - Source converted to TypeScript
    by [@ArafatHossan](https://github.com/ArafatHossan) in [`57644b9`](https://github.com/barikoi/bkoi-gl-js/commit/57644b9)
- **ESLint v9+ Migration** - Modern ESLint configuration with Prettier
  by [@sarikamahboob](https://github.com/sarikamahboob) in [`d8cedf8`](https://github.com/barikoi/bkoi-gl-js/commit/d8cedf8)
- Husky pre-commit hooks with lint-staged
  by [@sarikamahboob](https://github.com/sarikamahboob) in [`d8cedf8`](https://github.com/barikoi/bkoi-gl-js/commit/d8cedf8)
- Examples, updated docs
  by [@nurmdrafi](https://github.com/nurmdrafi) in [`49fc933`](https://github.com/barikoi/bkoi-gl-js/commit/49fc933)
- Enhanced local testing instructions and polygon drawing event listeners
  by [@nurmdrafi](https://github.com/nurmdrafi) in [`93c9ec6`](https://github.com/barikoi/bkoi-gl-js/commit/93c9ec6)

### Changed

- Finalized build and lint configuration
  by [@ArafatHossan](https://github.com/ArafatHossan) in [`134a2c1`](https://github.com/barikoi/bkoi-gl-js/commit/134a2c1)
- Updated configuration for TypeScript migration
  by [@ArafatHossan](https://github.com/ArafatHossan) in [`e352cff`](https://github.com/barikoi/bkoi-gl-js/commit/e352cff)
- Updated README for TypeScript migration
  by [@ArafatHossan](https://github.com/ArafatHossan) in [`f2814ee`](https://github.com/barikoi/bkoi-gl-js/commit/f2814ee)
- Included TypeScript migration guide
  by [@nurmdrafi](https://github.com/nurmdrafi) in [`29e6be6`](https://github.com/barikoi/bkoi-gl-js/commit/29e6be6)
- Updated developer guide, README, and folder structure
  by [@nurmdrafi](https://github.com/nurmdrafi) in [`9d20fc8`](https://github.com/barikoi/bkoi-gl-js/commit/9d20fc8)
- Overrode CSS, examples, utils
  by [@nurmdrafi](https://github.com/nurmdrafi) in [`fa3cf31`](https://github.com/barikoi/bkoi-gl-js/commit/fa3cf31)

### Fixed

- Resolved type errors and removed old JavaScript source files
  by [@ArafatHossan](https://github.com/ArafatHossan) in [`d493c1d`](https://github.com/barikoi/bkoi-gl-js/commit/d493c1d)
- Refactored exports to support TypeScript declarations
  by [@ArafatHossan](https://github.com/ArafatHossan) in [`02c8709`](https://github.com/barikoi/bkoi-gl-js/commit/02c8709)
- Style drawer issue
  by [@nurmdrafi](https://github.com/nurmdrafi) in [`49fc933`](https://github.com/barikoi/bkoi-gl-js/commit/49fc933)
- Resolved 5 npm vulnerabilities issue
  by [@nurmdrafi](https://github.com/nurmdrafi) in [`7cc1491`](https://github.com/barikoi/bkoi-gl-js/commit/7cc1491)
- Logo and attribution styles
  by [@nurmdrafi](https://github.com/nurmdrafi) in [`720f74a`](https://github.com/barikoi/bkoi-gl-js/commit/720f74a)

---

## [2.0.4] - January 22, 2025

### Added

- **Styles Layer** - Switchable map styles feature
  by [@faiazhossain](https://github.com/faiazhossain) in [`75fb12b`](https://github.com/barikoi/bkoi-gl-js/commit/75fb12b)

### Changed

- Updated the package versions
  by [@sarikamahboob](https://github.com/sarikamahboob) in [`dcaee5e`](https://github.com/barikoi/bkoi-gl-js/commit/dcaee5e)

---

## [2.0.3] - January 21, 2025

### Fixed

- Polygon CSS issue
  by [@faiazhossain](https://github.com/faiazhossain) in [`65c071d`](https://github.com/barikoi/bkoi-gl-js/commit/65c071d)
- Extra icon for each component
  by [@faiazhossain](https://github.com/faiazhossain) in [`63eed40`](https://github.com/barikoi/bkoi-gl-js/commit/63eed40)

---

## [2.0.2] - January 20, 2025

### Added

- **Polygon Drawing** - Added polygon layer for drawing functionality
  by [@faiazhossain](https://github.com/faiazhossain) in [`fea00f8`](https://github.com/barikoi/bkoi-gl-js/commit/fea00f8)

---

## [2.0.1] - January 19, 2025

### Changed

- Production ready for version 2
  by [@nurmdrafi](https://github.com/nurmdrafi) in [`6838254`](https://github.com/barikoi/bkoi-gl-js/commit/6838254)

---

## [2.0.0] - January 16, 2025

### Added

- Polygon drawing support with maplibre-gl-draw integration

### Changed

- Upgraded CDN v2
  by [@nurmdrafi](https://github.com/nurmdrafi) in [`c1d729c`](https://github.com/barikoi/bkoi-gl-js/commit/c1d729c)
- Updated package.json files directive
  by [@nurmdrafi](https://github.com/nurmdrafi) in [`4b8ac4b`](https://github.com/barikoi/bkoi-gl-js/commit/4b8ac4b)

### Fixed

- Updated Barikoi logo and attribution
  by [@nurmdrafi](https://github.com/nurmdrafi) in [`baaea49`](https://github.com/barikoi/bkoi-gl-js/commit/baaea49)

---

## [1.1.1] - September 11, 2024

### Added

- Husky for git hooks
  by [@nurmdrafi](https://github.com/nurmdrafi) in [`38dc51f`](https://github.com/barikoi/bkoi-gl-js/commit/38dc51f)

### Changed

- Updated dependency package versions
  by [@nurmdrafi](https://github.com/nurmdrafi) in [`ecc5993`](https://github.com/barikoi/bkoi-gl-js/commit/ecc5993)

---

## [1.1.0] - November 16, 2023

### Added

- README.md file
  by [@RubelBiswasDH](https://github.com/RubelBiswasDH) in [`1ad91ce`](https://github.com/barikoi/bkoi-gl-js/commit/1ad91ce)

### Changed

- Updated MapLibre version
  by [@RubelBiswasDH](https://github.com/RubelBiswasDH) in [`a39e756`](https://github.com/barikoi/bkoi-gl-js/commit/a39e756)

### Fixed

- Fixed Barikoi logo visibility issue
  by [@RubelBiswasDH](https://github.com/RubelBiswasDH) in [`346248e`](https://github.com/barikoi/bkoi-gl-js/commit/346248e)
- Updated docs homepage URL
  by [@RubelBiswasDH](https://github.com/RubelBiswasDH) in [`596fb30`](https://github.com/barikoi/bkoi-gl-js/commit/596fb30)

---

## [1.0.10] - March 16, 2022

### Changed

- Updated Rollup Build Config
  by [@scarecrow-11](https://github.com/scarecrow-11) in [`03bfdea`](https://github.com/barikoi/bkoi-gl-js/commit/03bfdea)
- Updated NPM build
  by [@scarecrow-11](https://github.com/scarecrow-11) in [`c0fccd0`](https://github.com/barikoi/bkoi-gl-js/commit/c0fccd0)

### Fixed

- Removed package.json files prop
  by [@scarecrow-11](https://github.com/scarecrow-11) in [`1da54f4`](https://github.com/barikoi/bkoi-gl-js/commit/1da54f4)

---

## [1.0.9] - March 16, 2022

### Fixed

- Updated package.json main/module path
  by [@scarecrow-11](https://github.com/scarecrow-11) in [`5015585`](https://github.com/barikoi/bkoi-gl-js/commit/5015585)

---

## [1.0.3] - October 31, 2021

### Changed

- Bumped License to "BSD-3-Clause" from "ISC"
  by [@scarecrow-11](https://github.com/scarecrow-11) in [`5c2d88a`](https://github.com/barikoi/bkoi-gl-js/commit/5c2d88a)
- Updated for NPM package
  by [@scarecrow-11](https://github.com/scarecrow-11) in [`ecb82a2`](https://github.com/barikoi/bkoi-gl-js/commit/ecb82a2)

---

## [1.0.2] - October 24, 2021

### Added

- Barikoi Map accessToken Validation
  by [@scarecrow-11](https://github.com/scarecrow-11) in [`e37cec3`](https://github.com/barikoi/bkoi-gl-js/commit/e37cec3)

### Changed

- Bumped maplibre-gl from v1.14.0 to v2.0.0-pre.1
  by [@scarecrow-11](https://github.com/scarecrow-11) in [`c76e7e2`](https://github.com/barikoi/bkoi-gl-js/commit/c76e7e2)

---

## [1.0.1] - July 4, 2021

### Changed

- Separated Bkoi GL Draw
  by [@scarecrow-11](https://github.com/scarecrow-11) in [`e619237`](https://github.com/barikoi/bkoi-gl-js/commit/e619237)

---

## [1.0.0] - April 12, 2021

### Initial Release

- Map, Navigation, GeoLocate controls
  by [@scarecrow-11](https://github.com/scarecrow-11) in [`89f81a3`](https://github.com/barikoi/bkoi-gl-js/commit/89f81a3)
- Popup, Marker
  by [@scarecrow-11](https://github.com/scarecrow-11) in [`a433df7`](https://github.com/barikoi/bkoi-gl-js/commit/a433df7)
- Bkoi-gl-draw
  by [@scarecrow-11](https://github.com/scarecrow-11) in [`d92e3b2`](https://github.com/barikoi/bkoi-gl-js/commit/d92e3b2)
- Switchable Map Styles & GL Draw
  by [@scarecrow-11](https://github.com/scarecrow-11) in [`7e06c8d`](https://github.com/barikoi/bkoi-gl-js/commit/7e06c8d)
- Mapbox accessToken option
  by [@scarecrow-11](https://github.com/scarecrow-11) in [`b6ad35a`](https://github.com/barikoi/bkoi-gl-js/commit/b6ad35a)
- Exported LngLatBounds
  by [@scarecrow-11](https://github.com/scarecrow-11) in [`40d9b20`](https://github.com/barikoi/bkoi-gl-js/commit/40d9b20)

### Fixed

- Fixed switchable style types
  by [@scarecrow-11](https://github.com/scarecrow-11) in [`c911d5f`](https://github.com/barikoi/bkoi-gl-js/commit/c911d5f)

---

## Version History

| Version | Published Date | Highlights |
| :------ | :------------- | :--------- |
| [3.2.0] | Feb 16, 2026 | Minimap control with responsive sizing, polygon rotation button, Barikoi logo fix |
| [3.1.0] | Dec 18, 2025 | Rollup migration, test cases, sourcemap |
| [3.0.0] | Dec 18, 2025 | TypeScript migration, ESLint v9+ |
| [2.0.4] | Jan 22, 2025 | Styles layer |
| [2.0.3] | Jan 21, 2025 | Polygon CSS fix |
| [2.0.2] | Jan 20, 2025 | Polygon drawing |
| [2.0.1] | Jan 19, 2025 | Production ready v2 |
| [2.0.0] | Jan 16, 2025 | Maplibre-gl-draw integration |
| [1.1.1] | Sep 11, 2024 | Husky, dependency updates |
| [1.1.0] | Nov 16, 2023 | Barikoi logo, MapLibre update |
| [1.0.10] | Mar 16, 2022 | Rollup config update |
| [1.0.9] | Mar 16, 2022 | Package.json path fix |
| [1.0.3] | Oct 31, 2021 | License update |
| [1.0.2] | Oct 24, 2021 | MapLibre v2, accessToken validation |
| [1.0.1] | Jul 4, 2021 | Separated GL Draw |
| [1.0.0] | Apr 12, 2021 | Initial release |

---

<p align="center">
  Made with &#10084; by <a href="https://barikoi.com">Barikoi</a>
</p>
