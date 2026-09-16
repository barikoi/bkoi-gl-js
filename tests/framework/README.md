# Framework compatibility tests

Reproduces the **real consumer environments** the README documents — one
minimal app per framework, each installed from the **packed tarball** (tarball
method, never `npm link`) and verified in a real browser (headed by default)
for basic map rendering.

| App | Bundler | What is validated |
|---|---|---|
| `react18-vite-app` | React 18 + Vite 7 | zero-config worker, ESM bundle |
| `react19-vite-app` | React 19 + Vite 7 | same |
| `vue2-vite-app` | Vue 2.7 + Vite 5 | same |
| `vue3-vite-app` | Vue 3 + Vite 7 | same |
| `svelte4-vite-app` | Svelte 4 + Vite 5 | same |
| `svelte5-vite-app` | Svelte 5 + Vite 7 | same |
| `next15-app` | Next.js 15 (webpack) | node-server build served via `next start` |
| `next16-app` | Next.js 16 — **two cells**: Turbopack + `--webpack` | same ×2 |
| `cra5-app` | react-scripts 5 (React 18) | CRA's webpack 5 path |
| `nuxt3-app` | Nuxt 3.21 (`nuxi generate`, SPA) | static output |
| `nuxt4-app` | Nuxt 4 (`nuxi generate`) | same |
| `sveltekit-app` | SvelteKit 2 + `adapter-static` | prerendered SPA shell |
| `angular20-app` | Angular 20 (zone-based) | esbuild application builder |
| `angular21-app` | Angular 21 (zoneless) | same, no bundler-emitted worker asset |

13 apps / 14 build cells → **14 apps / 15 build cells** (Vue now spans two
majors: 2.7 and 3, mirroring the React 18/19 split). Toolchains are pinned per
framework major (e.g. Vue 2.7 needs `@vitejs/plugin-vue2` → Vite 5; Svelte 4
pairs with `vite-plugin-svelte@3` → Vite 5; Angular 20 re-adds `zone.js`).

Node: the matrix targets Node 24 (even LTS) — this unlocks Nuxt 4. `run.mjs`
warns when the active Node major is odd and an app's engines exclude it, but
the run proceeds (warning only).

## What "map renders" means here

`verify.mjs` (Playwright Chromium — **headed by default**; `--headless` or
`HEADLESS=1` opts out for CI) asserts per app:

1. a `Worker` was actually constructed (URL captured via an init-script shim),
2. every constructed worker URL fetches successfully,
3. `window.__READY` — the map `load` event fired (style fetched and applied),
4. `window.__IDLE` — the engine `idle` event fired (**vector tiles parsed by
   the worker and rendered** — the exact thing that silently fails when the
   worker URL is broken),
5. no uncaught page errors.

`serveStatic` deliberately returns 404 for missing files with an extension, so
a broken worker asset can't be masked by an SPA `index.html` fallback.

## Run

```bash
# default matrix: npm for every app (builds lib + packs tarball first)
node tests/framework/run.mjs
npm run test:framework            # same thing

# single app
node tests/framework/run.mjs --only=angular

# package-manager matrix (apps share the same source; PM changes the layout)
node tests/framework/run.mjs --only=angular --pm=pnpm
node tests/framework/run.mjs --only=react19-vite,vue3-vite --pm=yarn

# canonical PM subset (pnpm/yarn/bun × react19-vite, vue3-vite, next16-webpack)
node tests/framework/run.mjs --pm-subset
```

Headed review walkthrough (one app at a time, HUD pill, screenshots —
default: every app):

```bash
npm run test:framework:review            # DWELL / PAUSE / ONLY / SKIP_BUILD envs
```

Requires `BARIKOI_API_KEY` in the repo `.env` (matching `.env.example`) — real
Barikoi style + tiles are the contract under test.

## Layout notes

- Apps read the key through their own standard env mechanism
  (`VITE_` / `NUXT_PUBLIC_` / `PUBLIC_`); Angular has none, so the runner
  writes `angular-app/src/env.generated.ts` before the build.
- The worker is registered by the library itself (see `src/worker-setup.ts`):
  no per-app worker configuration.
- The runner writes `results.json` (gitignored). Lockfiles, `node_modules`, and
  build output are gitignored.
- **SvelteKit**: the app must import `bkoi-gl/style.css` (SvelteKit emits no
  stylesheet otherwise — logo/attribution render unstyled).
- **Angular**: the esbuild builder's default critical-CSS inliner (Beasties)
  defers the whole stylesheet behind `media="print" onload=…`; the map mounts
  before it applies and logo/attribution render unstyled. Both apps set
  `optimization.styles.inlineCritical: false`.
- **Nuxt**: Nuxt owns the document HTML — `app.vue` resets `html, body`
  margins or the 100vw/100vh map overflows by 16px on both axes.
- **Every app must import `bkoi-gl/style.css`** — forgetting it produces a
  rendering map with an unstyled attribution that overflows the viewport by
  ~40px (page scrolls; caught in `vue2-vite-app`).
