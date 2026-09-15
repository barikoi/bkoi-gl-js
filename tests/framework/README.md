# Framework compatibility tests

Reproduces the **real consumer environments** the README documents — one
minimal app per framework, each installed from the **packed tarball** (tarball
method, never `npm link`) and verified headlessly for basic map rendering.

| App | Bundler | What is validated |
|---|---|---|
| `react18-vite-app` | React 18 + Vite 7 | zero-config worker, ESM bundle |
| `react19-vite-app` | React 19 + Vite 7 | same |
| `vue-vite-app` | Vue 3 + Vite 7 | same |
| `svelte5-vite-app` | Svelte 5 + Vite 7 | same |
| `nuxt-app` | Nuxt 3 (`nuxi generate`, SPA) | same, static output |
| `sveltekit-app` | SvelteKit 2 + `adapter-static` | same, prerendered SPA shell |
| `angular21-app` | Angular 21 (application builder / esbuild) | same, no bundler-emitted worker asset |

Node 25 notes: Nuxt 4 and Angular 22 exclude odd Node majors (`^22 || ^24 || >=26`),
so this matrix pins **Nuxt 3.21** and **Angular 21** (both accept `>=24`).

## What "map renders" means here

`verify.mjs` (Playwright, headless Chromium) asserts per app:

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
node tests/framework/run.mjs --only=react-vite,vue-vite --pm=yarn
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
