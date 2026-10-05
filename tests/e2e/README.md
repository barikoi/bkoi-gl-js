# E2E — built-artifact verification

Playwright suite that verifies the **built package** (`dist/`, never sources) in a
real Chromium browser. One case registry (`app/cases.js`) mounts one full-viewport
map per documented feature at `?case=<id>`; specs navigate + assert.

```bash
npm run e2e          # build + full suite (headless, the release gate)
npx playwright test --headed   # same specs in a visible browser, per-test HUD hold
npm run e2e:serve    # browsable index of every case, for clicking through by hand
npm run e2e:review   # headed walk of every case: HUD, per-case verdict + screenshots
npm run e2e:coverage # regenerate report/coverage.md (README-claim matrix)
```

Requires `BARIKOI_API_KEY` in the repo `.env` (see `.env.example`) — real Barikoi
style + tiles are the contract under test.

## Feature Verification Matrix

Internal, developer-facing view (consumers see `README.md` only — this table
does not ship there). Every documented feature must have a case; a feature
that stops working fails CI.

| Feature | Status | Verified by |
| --- | --- | --- |
| Map init, Barikoi style load, branded attribution | ✅ | e2e `map/basic` |
| Map events (lifecycle, camera, pointer, data) with payload fields | ✅ | e2e `map/basic`, `controls/*` |
| Event payload contract (move/moveend/zoomend, click lngLat+point, draw.create features) | ✅ | e2e `events/contract` |
| Navigation / Scale / Fullscreen / Geolocate controls | ✅ | e2e `controls/navigation` |
| Minimap control (toggle, responsive, parent rect, bidirectional sync, collapse) | ✅ | e2e `controls/minimap` |
| Drawing tools (polygon, line, point) + draw events | ✅ | e2e `draw/tools` (toolbar) |
| Draw API-driven ops (`add`, `changeMode`, `trash`) with event payloads | ✅ | e2e `draw/tools` (API ops) |
| Error paths: invalid API key, bad style URL, missing container | ✅ | e2e `errors/*` |
| `setStyle` swaps (Barikoi → Barikoi → custom) keep attribution | ✅ | e2e `styles/switch` |
| UMD global surface; registered worker URL fetches 200 | ✅ | e2e `formats` |
| Markers & popups | ✅ | e2e `markers/popup` |
| Camera methods (flyTo, easeTo, jumpTo, fitBounds, …) | ✅ | `camera.spec.ts` on `map/basic` |
| Custom GeoJSON sources & layers | ✅ | e2e `layers/sources` |
| Every fenced README example executes | ✅ | e2e `readme/examples` |
| Build formats: ESM, CJS, IIFE, UMD | ✅ | e2e `formats`, `test:pack` |
| Install/resolution: npm, pnpm, yarn, bun | ✅ | `test:resolution` |
| Framework apps: React, Vue, Nuxt, Angular, Svelte, SvelteKit | ✅ | `test:framework` |

## Harness rules

- Specs import `test`/`expect`/helpers from `fixtures/map.ts` — **never**
  `playwright/test` directly, or the branding contract and the headed HUD
  silently won't apply to that spec.
- Specs poll (`expect.poll` / `waitForLog`) — no one-shot event registration
  that can race a condition already true, and no fixed sleeps standing in for
  a condition.
- Native canvas/gesture interactions (draw clicks, map clicks) use real
  `page.mouse` events; synthetic `dispatchEvent` is ignored by the engine.
- `gotoCase` enforces the branding contract (Barikoi logo + attribution) for
  every case that mounts a settled map. Error specs bypass it deliberately and
  wait on their error log instead.
- `window.__pageErrors__` records uncaught exceptions — specs assert it empty.
- Style-loaded is **not** a rendered map: a white canvas can pass every DOM
  assertion. Rendering claims come from `e2e:review`'s pixel sample.

## Review flow (`npm run e2e:review`)

One headed browser stepping every case, with a bottom-center HUD (label + a
hold progress bar that drains over the dwell). Per case it prints OK/PROBLEM,
writes a screenshot and records `review-<stamp>.json` under `report/` (retained
between runs). Headed by default; `--headless`, `--dwell=<ms>` (`0` = no hold,
no bar), `--pause`, `--only=<case>` are the knobs. The window is a separate
Chromium from your own browser — `http://localhost:5176/?case=…` opened by hand
shows the map without a HUD, since the pill is test-side chrome.
