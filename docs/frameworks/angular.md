# Angular

Validated by `tests/framework/angular20-app` (Angular 20, zone-based) and `tests/framework/angular21-app` (Angular 21, zoneless).

## Styles — angular.json

Angular has no JS-side stylesheet import path here; add the library CSS to the build's global styles. **Also disable `inlineCritical`** — Angular's critical-CSS inliner (Beasties) defers the whole stylesheet behind `media="print" onload=…`, the map mounts before it applies, and the logo/attribution render unstyled:

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

Angular 20 needs `zone.js` in the build `polyfills` (the v21 app is zoneless). No worker configuration is needed in either version — Angular's esbuild builder does not emit the worker asset, and the library falls back to its self-contained worker automatically.
