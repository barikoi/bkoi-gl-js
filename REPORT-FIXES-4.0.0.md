# bkoi-gl v4.0.0 — Validation & Fix Report

**Scope:** Independent validation of every issue in the incoming review rounds
(Vue/Nuxt/Svelte/SvelteKit/Angular + CRA 5), followed by fixes for all confirmed
issues plus a self-audit that surfaced additional gaps the reviews missed.

**Base:** `bkoi-gl` 4.0.0 source tree (repo `package.json` version 4.0.0; **not yet
published to npm** — latest on the registry is 3.3.0, so the tarball under test is
`npm pack` of this repo, the same artifact the `tests/framework/*` reference apps
consume as `file:../bkoi-gl-4.0.0.tgz`).

**Validation environment:** Node v26.10.0, npm 11.19.1, Playwright/Chromium 1.63.0.
All framework scaffolds were created fresh from public registries (no reuse of the
reviewer's projects). Per-fix evidence is inline below.

---

## 1 · Verdict on the incoming reports

**Every checkable claim reproduced. No false positives were found.**

| ID (their ref) | Claim | Validation verdict |
|---|---|---|
| M1 | Shipped CSS `@import`s a broken unpkg URL | ✅ Confirmed — `maplibre-gl@5.13.0/.../maplibre-gl.css` → HTTP 200, `maplibre-gl-draw@1.6.9/.../maplibre-gl-draw.css` → **HTTP 404**; both present in shipped `dist/style/bkoi-gl.css` |
| M4 | Tarball sourcemaps reference unshipped `src/` | ✅ Confirmed — 4 `.map` files; `sources` include 9 `../src/*.ts` entries with **NULL `sourcesContent`**; tarball had no `src/`; CRA emitted exactly **9** `Failed to parse source map` warnings (matching the 9 files by name) |
| D13 | Svelte guide names nonexistent `@vitejs/vite-plugin-svelte@3` | ✅ Confirmed — `npm view @vitejs/vite-plugin-svelte` → 404; real package is `@sveltejs/vite-plugin-svelte`; peer pairings verified (v3→Vite 5/Svelte 4, v5→Vite 6, v6→Vite 6.3/7) |
| D14 | `svelte.md` is the only guide missing the body-margin reset | ✅ Confirmed — vue/sveltekit/nuxt guides have it; create-vite's svelte template `index.html` has no reset and the guide's `main.js` drops the template's `app.css` import |
| D15 | Guide-verbatim `ng build` fails on the default 1 MB budget | ✅ Confirmed — reproduced on a fresh Angular 20.3 app: `✘ bundle initial exceeded maximum budget. Budget 1.00 MB was not met by 1.14 MB with a total of 2.14 MB`, **exit 1**; CLI defaults (500 kB warn / 1 MB error) verified in v20.3.32 and v21.2.24 schematics; reference app sets `"budgets": []`, doc omitted it |
| D16-2a | "Build without `CI=true`" note describes an impossible failure | ✅ Confirmed — webpack 5 resolves the worker `new URL(..., import.meta.url)` silently (no "Critical dependency" warning ever occurs); react-scripts 5.0.1 `build.js:187–190` explicitly filters `/Failed to parse source map/` from CI promotion; `CI=true npm run build` → **exit 0** |
| D16-2b | Jest mock note misdiagnoses the failure and is insufficient | ✅ Confirmed — real failure is `ReferenceError: TextDecoder is not defined`; root `__mocks__/bkoi-gl.js` is silently ignored (CRA jest `roots` = `src/`); full recipe (`src/__mocks__/` ×2 + `moduleNameMapper` + `jest.mock('bkoi-gl')`) makes the suite run |
| CRA Issue 3 | `create-react-app@5.0.1` refuses and exits 0 | ✅ Confirmed — refusal message, **exit 0**, no project created; `@5.1.0` scaffolds react-scripts 5.0.1 + React 19.3 |
| Angular note 4 | `inlineCritical` failure is permanent, not a flash | ✅ Confirmed — mechanism proven in Chromium with the exact Beasties deferral pattern: a stylesheet whose `@import` fails keeps `media="print"` and its rules never apply (5 s+); control with a working `@import` flips to `all`; default-optimization build emits `media="print" onload=…` **plus** `<link rel="preload">`s for both unpkg URLs |

Numeric drift vs. the reports (immaterial): Angular budget overrun measured 1.14 MB/2.14 MB
here vs 937.50 kB/1.94 MB in the report — Angular minor/template version difference,
identical failure mode and exit code.

---

## 2 · Fixes applied — package

### 2.1 M1 — Shipped CSS now fully self-contained (no remote `@import`s)

**Root cause (deeper than reported):** `dist/style/bkoi-gl.css` was a verbatim copy of
`src/index.css` (via `rollup-plugin-copy`). Its draw import pointed at
`maplibre-gl-draw.css` — **a filename that does not exist** in maplibre-gl-draw@1.6.9
(the package ships `mapbox-gl-draw.css`), hence the permanent 404. The maplibre import
additionally pinned CSS `@5.13.0` against the bundled JS dependency `6.9.1`.

**Changes**

- `rollup.config.js` — new `bundleStyles()` plugin (in the browser-build config, after
  `clear`) concatenates `node_modules/maplibre-gl/dist/maplibre-gl.css` +
  `node_modules/maplibre-gl-draw/dist/mapbox-gl-draw.css` + `src/index.css` into
  `dist/style/bkoi-gl.css`. Vendor order preserved so the Barikoi override cascade
  (documented at the top of `src/index.css`) is unchanged. The old CSS copy target was
  removed from the `copy` plugin.
- `src/index.css` — the two `@import url('https://unpkg.com/…')` lines removed, replaced
  by a header comment explaining the build-time inlining and why remote imports were
  harmful.

**Safety checks performed**

- All `url()` references in both vendor sheets are inline `data:` URIs — no relative
  asset paths that concatenation could break (the `img/` dir in maplibre-gl-draw/dist is
  not referenced by the CSS).
- No `@charset`/BOM conflicts across the concatenated files.
- Consumed-by list audited: every consumer (`package.json` exports, `examples/`,
  `tests/e2e/app`, reference apps) reads `dist/style/bkoi-gl.css` — none reads
  `src/index.css` directly.

**Result:** shipped CSS is 101,880 bytes (was ~12.8 KB) with **zero `@import`
statements**. This also removes: the Nuxt double-fetch of the broken URL, the Angular
Beasties `<link rel="preload">`s for unpkg, the CSS/JS version skew, and the
runtime dependence on unpkg availability.

### 2.2 M4 — Tarball now ships `src/` so sourcemaps resolve

**Root cause:** the maps' `sourcesContent` is NULL for exactly the 9 `../src/*.ts`
entries (node_modules sources are embedded), so consumer tools fall back to disk and
fail — hence exactly 9 CRA warnings.

**Change:** `package.json` `files` now includes `"src"` (tarball: 24 → 35 files,
11 of them `src/`; size 5.9 MB → 6.1 MB packed).

**Result:** CRA dev/build source-map warnings attributable to bkoi-gl: **9 → 0**.
Chosen over dropping the maps (keeps in-consumer debugging) and over regenerating maps
(smallest, deterministic change).

---

## 3 · Fixes applied — documentation

### 3.1 `docs/frameworks/svelte.md` (D13, D14)

- Corrected **both** occurrences of `@vitejs/vite-plugin-svelte@3` →
  `@sveltejs/vite-plugin-svelte@3`, with an explicit warning that the `@vitejs/` name
  does not exist.
- Added per-stack install lines: Svelte 5/Vite 7 → plugin@6; Svelte 5/Vite 6 →
  plugin@5; Svelte 4/Vite 5 → **`npm i -D svelte@4 @sveltejs/vite-plugin-svelte@3
  vite@5`** (the `svelte@4` downgrade is included — see §4.4).
- Added the body-margin reset note (mirrors `vue.md`), plus why it bites here:
  the Vite Svelte template does not reset it and the guide's `main.js` replaces the
  template's, dropping the only `app.css` import.
- Added the `.env` key-setup line (`VITE_BARIKOI_API_KEY`).

### 3.2 `docs/frameworks/angular.md` (D15, issue 4)

- Added the missing build-target change with its own snippet:
  `"configurations": { "production": { "budgets": [], "outputHashing": "all" } }`,
  matching the reference app, with one sentence of explanation (default 500 kB/1 MB
  initial budget rejects the ~2 MB bundle) and the raise-instead alternative.
- Rewrote the `inlineCritical` note to state the consequence accurately: the deferral
  pattern is `media="print" onload="this.media='all'"`; a deferred stylesheet whose
  `@import`s fail never fires `load` (Chrome fires `error`), so `media` never flips and
  the styles **never** apply — permanent, not a flash. Notes that bkoi-gl now ships its
  CSS self-contained for exactly this reason, and to keep `inlineCritical` disabled
  regardless to avoid the unstyled flash.

### 3.3 `docs/frameworks/react.md` (D16, CRA issue 3)

- Added the working scaffold line: `npx create-react-app@5.1.0 my-app` (with the
  why: `@5.0.1` prints a refusal and **exits 0**, dead-ending scripted setups).
- Replaced the two wrong CRA notes:
  - ~~"Build without `CI=true`"~~ → "No special build flags: `npm run build` and
    `CI=true npm run build` both pass with bkoi-gl 4.0.0" (with the mechanism).
  - ~~"mock `bkoi-gl` — CRA's 2022 babel preset cannot parse ES2022 static class
    blocks"~~ → the verified three-piece jest recipe (`src/__mocks__/bkoi-gl.js`,
    `src/__mocks__/bkoi-gl-style.js`, `package.json` jest `moduleNameMapper` for
    `^bkoi-gl/style.css$`, plus `jest.mock('bkoi-gl')` in the test), stating the real
    failure is jsdom's missing `TextDecoder` and that root-level `__mocks__/` is
    silently ignored.
- Kept the (unchallenged, accurate) `DISABLE_ESLINT_PLUGIN` monorepo note.

### 3.4 `docs/frameworks/vue.md`

- Added the `.env` key-setup line (`VITE_BARIKOI_API_KEY`) — see §4.3.

---

## 4 · Additional issues found & fixed during the bulletproof audit (not in the reviews)

### 4.1 N1 — React+Vite guide mounted to a nonexistent element (blank page)

The guide's `main.jsx` ended with `createRoot(document.getElementById('app'))`, but the
stock `create-vite` React template ships `<div id="root">`. Guide-verbatim on a fresh
scaffold throws `Target container is not a DOM element` → **blank page**. The reference
apps pass only because their `index.html` was silently edited to `id="app"` — the same
validation-blind-spot pattern that hid D14.
**Fix:** mount to `'root'` + an explanatory sentence. Verified with a fresh scaffold:
build exit 0.

### 4.2 N2 — React+Vite missing body-margin reset

Replacing `main.jsx` drops the template's `index.css` import (the only margin reset),
so the 100vw/100vh map overflows — the D14 class of bug in the one guide the reviews
didn't audit for it. **Fix:** reset note added. (CRA confirmed immune: its template's
`src/index.css` already sets `body { margin: 0 }`.)

### 4.3 N3 — Guides used env vars they never told you to create

`vue.md`, `react.md` (Vite + CRA sections) and `svelte.md` reference
`VITE_BARIKOI_API_KEY` / `REACT_APP_BARIKOI_API_KEY` with no setup instruction
(nuxt/sveltekit/angular already had theirs). **Fix:** one `.env` line each, with the
restart-the-dev-server caveat.

### 4.4 N4 — Svelte-4 install line incomplete for fresh scaffolds

The corrected install line originally read `npm i -D @sveltejs/vite-plugin-svelte@3
vite@5`, which leaves Svelte 5 installed from the template. **Fix:** line now includes
`svelte@4`.

### 4.5 Forward-compatibility check (no fix needed)

The current `create-vite@latest` scaffolds **Vite 8 + rolldown + plugin-svelte 7** —
newer than any stack the guides or reviews cover. Verified bkoi-gl 4.0.0 builds clean
on it as-scaffolded (exit 0), so the release is forward-compatible there.

---

## 5 · Verification matrix (all executed after the final fix set)

| Check | Command / method | Result |
|---|---|---|
| Repo lint | `npm run lint` | ✅ exit 0 |
| Repo unit tests | `npx vitest run` | ✅ 121/121 (11 files) |
| Release gate | `npm run test:pack` (build + pack + publint --strict + arethetypeswrong + smoke) | ✅ all pass |
| Shipped CSS purity | `grep '^@import' dist/style/bkoi-gl.css` | ✅ 0 statements; vendor rules present (102 KB) |
| Browser smoke (M1) | Playwright/Chromium: IIFE build + bundled CSS, dummy key | ✅ attribution/logo chrome rendered **and styled**, canvas present, **0 unpkg network requests**, 0 page errors |
| `inlineCritical` mechanism | Playwright: exact Beasties pattern, failing vs working `@import` | ✅ failing sheet stays `media="print"`/unstyled (5 s+); working sheet flips to `all` |
| CRA 5 fresh scaffold (React 19.3 / react-scripts 5.0.1) | `npm run build` | ✅ **0** source-map warnings (was 9); exit 0 |
| CRA CI build | `CI=true npm run build` | ✅ exit 0 |
| CRA jest | `CI=true npm test -- --watchAll=false` with documented recipe | ✅ suite runs; fails only on the scaffold's stale "learn react" assertion (template churn) |
| CRA scaffolder | `npx create-react-app@5.0.1` / `@5.1.0` | ✅ 5.0.1 refuses + exit 0 (doc now pins 5.1.0); 5.1.0 scaffolds fine |
| Angular 20.3 fresh app | guide-verbatim `ng build` (styles + `inlineCritical:false` + `budgets: []`) | ✅ exit 0 |
| Angular default optimization (control) | `ng build` without the override | ✅ exit 0; dist has **0 unpkg refs** (was 2 preloads + 2 `@import`s); draw CSS inlined in the styles bundle |
| Svelte 5 guide-verbatim | fresh scaffold + plugin@6/vite@7 + guide files → `vite build` | ✅ exit 0 |
| Svelte 4 guide-verbatim | fresh scaffold + `svelte@4`/plugin@3/vite@5 + guide files → `vite build` | ✅ exit 0 |
| React Vite guide-verbatim (post-N1 fix) | fresh scaffold + guide `main.jsx` → `vite build` | ✅ exit 0 (mounts to template's `#root`) |
| Vite 8 / rolldown forward-compat | as-scaffolded template + bkoi-gl → build | ✅ exit 0 |
| Vue template id sanity | `create-vite` template-vue `index.html` | ✅ `id="app"` matches guide's `mount('#app')` |
| Repo-wide stragglers | grep for `@vitejs/vite-plugin-svelte`, stale claims | ✅ none (only the intentional warning mention in svelte.md) |

---

## 6 · Files changed

```
docs/frameworks/angular.md  | +14 −1   (D15 budgets snippet, inlineCritical rewording)
docs/frameworks/react.md    | +20 −4   (D16 notes, scaffold line, N1/N2/N3)
docs/frameworks/svelte.md   | +20 −2   (D13 pkg name + install lines, D14, N3, N4)
docs/frameworks/vue.md      | +2       (N3)
package.json                | +1       (M4: files += "src")
rollup.config.js            | +30 −1   (M1: bundleStyles plugin, copy target removed)
src/index.css               | +12 −6   (M1: remote @imports removed, header comment)
----------------------------------------------------------------------
7 files changed, 95 insertions(+), 14 deletions(-)
```

Tarball: 24 → 35 files (11 × `src/`), 5.9 → 6.1 MB packed.

---

## 7 · Not verified / remaining risks

1. **Next.js companion reports were not provided** (`REPORT-MAP-ISSUES.md` M2/M3,
   `REPORT-DOC-GAPS.md` D1–D12). A red-flag scan of `docs/frameworks/nextjs.md` (wrong
   package names, unpkg refs, mount ids, CI claims) found nothing, but those reports
   should be validated/fixed the same way before release.
2. **Repo e2e suite not run** — `npm run e2e` needs a real `BARIKOI_API_KEY` (`.env`)
   and live tiles. The browser smoke here covered CSS/chrome rendering only. Run it
   with a real key before publishing.
3. **Vue 2/3, Nuxt 3/4, SvelteKit full scaffolds** were cross-checked at doc/template
   level (mount ids, margin resets, stylesheet imports all correct and consistent with
   the reference apps) but not re-scaffolded — consistent with the reviews' clean
   verdicts for those stacks.
4. **Consumers already relying on the remote maplibre CSS being fetched at runtime**
   (e.g. to dedupe against their own maplibre-gl CSS import) will now get the vendor
   rules inlined unconditionally. No such pattern exists in this repo's guides or
   reference apps; equal-specificity overrides by consumers still win by order if
   imported after `bkoi-gl/style.css`.

## 8 · Recommended pre-publish checklist

1. `BARIKOI_API_KEY=… npm run e2e` (real key).
2. Send the Next.js reports (M2/M3, D1–D12) for the same validate-and-fix pass.
3. `npm publish` (prepublishOnly already runs typecheck + lint + vitest + build +
   test:pack).
4. Optional: add a CHANGELOG entry noting the self-contained stylesheet and shipped
   sourcemap sources as 4.0.0 highlights (consumers upgrading from 3.x need no action).
