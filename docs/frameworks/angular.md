# Angular

Validated by `tests/framework/angular20-app` (Angular 20, zone-based) and `tests/framework/angular21-app` (Angular 21, zoneless).

## Styles — angular.json

Angular has no JS-side stylesheet import path here; add the library CSS to the build's global styles. **Also disable `inlineCritical`** — Angular's critical-CSS inliner (Beasties) defers the whole stylesheet behind `media="print" onload="this.media='all'"`, and the map mounts before the deferred sheet applies, so the logo/attribution flash unstyled. Worse: a deferred stylesheet whose `@import`s fail to load never fires `load` on the `<link>` at all (Chrome fires `error` instead), so `media` never flips and the styles **never** apply — an unstyled map forever, not a flash. bkoi-gl ships its CSS self-contained for exactly this reason, but keep `inlineCritical` disabled anyway to avoid the flash:

```json
"options": {
  "styles": ["src/styles.css", "node_modules/bkoi-gl/dist/style/bkoi-gl.css"],
  "optimization": {
    "scripts": true,
    "styles": { "minify": true, "inlineCritical": false },
    "fonts": false
  }
}
```

**Clear the production size budgets** — the scaffold's default `initial` budget (500 kB warning / 1 MB error) rejects the ~2 MB bundle and `ng build` fails with `bundle initial exceeded maximum budget`. This is the one build-target change the guide requires (matching `tests/framework/angular20-app/angular.json`):

```json
"configurations": {
  "production": {
    "budgets": [],
    "outputHashing": "all"
  }
}
```

(Raise the `initial` `maximumError` instead if you want to keep budgets for your own code.)

Reset the page in `src/styles.css` so the 100vw/100vh map does not overflow:

```css
html,
body {
  margin: 0;
}
```

## API key — no build-time env prefix

Angular has no framework env-var mechanism; generate a key module and import it (the validated pattern — same idea as Angular's environments file):

```ts
// src/env.generated.ts (generate in a prebuild step; gitignore it)
export const BARIKOI_API_KEY = 'your_key'
```

## Component

```ts
// src/app/app.ts
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core'
import { Map } from 'bkoi-gl'
import { BARIKOI_API_KEY } from '../env.generated'

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements AfterViewInit, OnDestroy {
  @ViewChild('mapEl', { static: true }) mapEl!: ElementRef<HTMLDivElement>
  private map?: InstanceType<typeof Map>

  ngAfterViewInit(): void {
    this.map = new Map({
      container: this.mapEl.nativeElement,
      accessToken: BARIKOI_API_KEY,
      center: [90.3938, 23.8216],
      zoom: 12,
    })
  }

  ngOnDestroy(): void {
    this.map?.remove()
  }
}
```

```html
<!-- src/app/app.html -->
<div #mapEl style="width: 100vw; height: 100vh"></div>
```

> **Container sizing:** keep the explicit inline height (or a dedicated CSS rule) on the map container. maplibre applies `.maplibregl-map { position: relative }` to it and can override positioning utility classes (e.g. Tailwind's `absolute inset-0`), collapsing the container to height 0 — blank map with zero console errors.

Angular 20 needs `zone.js` in the build `polyfills` (the v21 app is zoneless). No worker configuration is needed in either version — Angular's esbuild builder does not emit the worker asset, and the library falls back to its self-contained worker automatically.
