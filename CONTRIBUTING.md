# Contributing to bkoi-gl

Single source of truth for working on this library: setup, architecture,
testing pitfalls, gotchas, and release checklist.

For user-facing API docs see [README.md](./README.md). For version history
see [CHANGELOG.md](./CHANGELOG.md).

---

## Quick Start

1. **Setup:** see [Development Environment](#development-environment) below.
2. **Workflow:**
   - Work happens on the `dev` branch.
   - Write tests for new features and bugfixes.
   - Build and test locally using the [tarball method](#local-package-testing).
   - Push to `dev` after hooks pass.
3. **Merges:** maintainers periodically merge `dev` into `main`.

---

## Development Environment

### Prerequisites

- Node.js >= 18.0.0
- npm (latest)
- Git

### Setup

```bash
git clone https://github.com/barikoi/bkoi-gl-js.git
cd bkoi-gl-js
npm install
cp .env.example .env   # then fill in BARIKOI_API_KEY
npx playwright install chromium
```

`BARIKOI_API_KEY` is required by the e2e host app (it throws at config load
without one) and by the framework matrix. Keep it in `.env` — gitignored,
never hardcoded; `.env.example` is the committed template.

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run typecheck` | TypeScript validation (`tsc --noEmit`) |
| `npm run lint` / `lint:fix` | ESLint (flat config, repo-wide) |
| `npm test` / `npm run coverage` | Vitest with coverage (unit + browser projects) |
| `npm run test:unit` / `test:browser` | Vitest projects (jsdom / real Chromium) |
| `npm run test:watch` | Vitest watch mode |
| `npm run build` | Typecheck + Rollup bundle + worker bundle |
| `npm run e2e` | Build, regenerate the README manifest, then Playwright vs built `dist/` |
| `npm run e2e:serve` / `e2e:review` | e2e host app (:5176) / headed review walk |
| `npm run e2e:coverage` | Regenerate `tests/e2e/report/coverage.md` (README claim matrix) |
| `npm run check:readme` | Verify the generated README-example manifest is not stale |
| `npm run screenshots` | Capture showcase JPEGs into `screenshots/` (needs `e2e:serve`) |
| `npm run test:framework` / `test:framework:review` | Framework matrix / its headed review |
| `npm run test:resolution` / `test:pack` | Worker resolution / pack-tarball smoke |
| `npm run playwright:install` | One-time Chromium install for browser tests |
| `npm run prepublishOnly` | Publish gate: typecheck + lint + vitest + build + pack smoke |

### Project Structure

```
src/
  index.ts        # BkoiGlMap (extends maplibre-gl Map) + public exports
  controls/       # Minimap, ToggleButton
  utils/          # config, constants, validator, utils
  types/          # TypeScript type definitions
  index.css       # Library styles (compiled to dist/style/bkoi-gl.css)
  worker-setup.ts # Worker URL resolution + Blob fallback
scripts/          # build-worker.mjs, test-pack.mjs, extract-readme-examples.mjs, …
tests/
  unit/           # Vitest, jsdom, mocked maplibre-gl (mocks/ here too)
  browser/        # Vitest browser mode — real maplibre-gl in Chromium
  e2e/            # Playwright suite vs built dist/ (app/, specs/, fixtures/, review/)
  framework/      # Consumer repro apps: Vite/Next/Nuxt/CRA/Angular + runner
  shared/         # review-banner.mjs — the headed-review HUD
```

### Git Hooks

Hooks are configured automatically by `npm install` via Husky (`.husky/`).

- **pre-commit**: `lint-staged` (eslint --fix, prettier --write), then
  `npm run typecheck`. `npm run build` also runs on `main`.
- **commit-msg**: requires `user.name`/`user.email`, appends a
  `Signed-off-by` trailer, then runs `commitlint`.

Bypassing these checks is not supported — fix the underlying issue instead.
Note the coverage step inside `pre-commit` is commented out; run
`npm test` yourself before pushing.

---

## Architecture

`BkoiGlMap` (exported as `Map`) extends MapLibre GL's `Map` class directly —
there is no React wrapper here (that is the sibling `react-bkoi-gl`).

### Map construction

The constructor validates options, resolves the access token / API URL, sets
the worker URL, then calls `super()`. Barikoi attribution and (when requested)
the draw control are attached on the engine's `load` event.

### Worker Setup (automatic)

Consumers never configure the worker: `worker-setup.ts` probes the
bundler-emitted `dist/bkoi-map-worker.mjs` asset and falls back to a
same-origin Blob worker built from `src/worker-bundle.generated.ts`. That file
is **GENERATED** (worker source inlined for the Blob fallback) and committed so
typecheck works before a build — do not hand-edit it; regenerate with
`node scripts/build-worker.mjs`.

### Public Surface

Everything exported from `src/index.ts` is public. Add new exports there — no
barrel files elsewhere. `BkoiGlMap` is aliased as `Map` for the README
quick-start path.

---

## Testing Workflow

### Framework Compatibility (`tests/framework/`)

One real consumer app per framework — Vite/React 18+19, Vue 2+3, Svelte 4+5,
Next.js 15+16 (Turbopack and webpack), CRA 5, Nuxt 3+4, SvelteKit 2, Angular
20+21 — installed from the packed tarball and verified for actual tile
rendering (worker constructed + 200, engine `load` + `idle`, no uncaught
errors; browser verification is **headed by default**, `--headless` /
`HEADLESS=1` opts out). Covers the README's zero-config claims across
14 apps / 15 cells.

```bash
npm run test:framework                          # full matrix (~30 min; run detached)
node tests/framework/run.mjs --only=next16      # single app
```

Installs are heavy and long — run detached (`nohup … &`) and poll the log, not
inside a tool call that can be aborted mid-run.

### Unit & Browser Tests

- **Projects**: `unit` (jsdom, mocked maplibre-gl) and `browser` (real
  WebGL in headless Chromium via the Vitest Playwright provider).
- **Location**: `tests/unit/`, `tests/browser/` (specs end in `.spec.ts`).
- **Coverage thresholds are 100%** for statements/branches/functions/lines
  over `src/**`. A new untested branch fails `npm test` — that is intentional.
- `tests/unit/mocks/maplibre-gl.js` is load-bearing: keep it in sync whenever
  the MapLibre API surface used by source changes.

```bash
npm run test:unit        # jsdom project only
npm run test:browser     # real maplibre in Chromium
npx vitest run <pattern> # subset
```

### Browser Specs (real maplibre-gl in Chromium)

- Mount into a detached `div` (no `document.body` state leak); use
  `mountMap()`/`unmount()` from `tests/browser/utils.ts`.
- Wait with `waitFor(() => cond)` (polling with a deadline), `mapEvent(map, ev)`
  (one-shot event registration), or `expect.poll` — **never** arbitrary
  `sleep()` values to paper over timing. `sleep` exists for stepping the engine,
  not for "waiting long enough".
- Styles: `emptyStyle` (camera/control tests) or `geojsonStyle` (layer/source
  tests) — both offline. Do not fetch remote styles/tiles in browser tests.
- The setup file pins the maplibre v6 worker URL; without it the worker 404s
  out of Vite's prebundled deps.

### e2e (`tests/e2e/`)

Playwright against the **built `dist/`** — `npm run e2e` chains the build, so
always run it through that script after library changes or you test stale
output. The host app serves one case per URL (`/?case=<id>`) from
`tests/e2e/app/cases.js`; specs only navigate and assert.

**Case registry conventions** (`tests/e2e/app/cases.js`):

- Ids are `<domain>/<action>` kebab-case (`map/basic`, `draw/tools`,
  `config/defaults`, `errors/bad-key`, `markers/popup`…).
- One mount per scenario — if two specs can share a map setup, they share
  the case (the former `draw/all` + `draw/api` duplicate mounts were merged
  into `draw/tools`). Prefer reusing `map/basic` over adding a near-copy.
- `gotoCase` (in `fixtures/map.ts`) mounts the shared indication UI on every
  settled case: a top-left live camera-state + event-ticker panel (ported
  from react-bkoi-gl's e2e app) plus the bottom-center HUD. Nothing to wire
  per case.
- Renaming/merging a case means updating every reference in lockstep:
  specs (`gotoCase(page, '<id>')`), `review/run-review.mjs` demo blocks,
  `scripts/capture-screenshots.mjs`, and the README-claim matrix in
  `tests/e2e/scripts/generate-coverage.mjs` (`npm run e2e:coverage`
  fails/red-flags a case with no spec).
- `README.md` is consumer-only — no `tests/` paths, release/CI process
  notes, or other repo internals; that context lives here.

- **Fixtures**: `tests/e2e/fixtures/map.ts` is the single import point for
  specs — it exports `test`, `expect`, `gotoCase`, `waitForLog`,
  `waitForCameraStable`. It owns the branding contract (logo + attribution
  visible) and the headed HUD. Do not import `playwright/test` directly in a
  spec, or the fixture (and its HUD/hold) silently won't apply.
- **Waits**: poll-based only. `gotoCase` gates on style-loaded + camera-idle +
  the case's `load` log, because `isStyleLoaded()` flips before a case's
  on-load DOM setup runs. No `waitForTimeout`, no `networkidle`.
- **Ports**: the runner starts the dev server on `:5176` itself
  (`webServer`, `reuseExistingServer` locally). Do not also run `e2e:serve` by
  hand against the same run — one server owner. On a failed suite that dies in
  ~250 ms, suspect a zombie server on the port before the app.

```bash
npm run e2e                                          # build + full suite
npx playwright test tests/e2e/specs/map.spec.ts      # one spec (server auto-started)
npx playwright test --headed                         # visible window, per-test HUD hold
npm run e2e:serve                                    # browse http://localhost:5176
```

Artifacts land in a **timestamped** `test-results/<stamp>/` dir: Playwright
empties a static `outputDir` at every run start, which previously wiped the
evidence a maintainer traces by hand.

### Headed Review (`tests/e2e/review/`)

Human walkthrough of every e2e case in one headed browser — a bottom-center HUD
pill per case, per-case demos (draw a polygon, minimap moves, style swap), and
a screenshot + DOM-evidence report under `tests/e2e/report/` (retained between
runs; this dir is gitignored).

```bash
npm run e2e:review                        # HEADED walk, 8s dwell per case (progress bar)
npm run e2e:review -- --headless          # no window, artifacts + summary only
npm run e2e:review -- --dwell=0           # fast evidence pass: NO hold, NO bar
npm run e2e:review -- --dwell 6000        # space-separated form also works
npm run e2e:review -- --pause             # advance on Enter instead of the timer
npm run e2e:review -- --only=draw         # one module or exact case id
```

Headed by default, matching react-bkoi-gl. Dwell precedence: `--dwell` arg >
`DWELL` env > 8000 when headed, 0 otherwise. `--dwell=0` deliberately shows
**no progress bar** — there is no hold to drain; the pill still appears while
the case is on screen. The runner reuses a live server on `:5176` or starts
(and owns) one.

Headed evidence includes a **render gate**: a case whose canvas is still white
is reported as a problem, so a "style loaded" green is never mistaken for a
rendered map. `--dwell` is answered by a timer-driven progress bar, not rAF —
Chromium freezes rAF for occluded windows, which otherwise wedges the walk.

### Testing Pitfalls (read before writing tests)

- **Style-load is not a rendered map.** `isStyleLoaded()` + visible logo + no
  page errors can all pass on a white canvas. A render claim needs the `idle`
  event or a pixel sample (the review runner does the latter).
- **Occluded headed windows freeze rendering.** Chromium pauses rAF and
  compositing for backgrounded/covered windows, so a headed step that "does
  nothing" is usually the harness: bring the window to front or re-run the step
  headless before concluding the app is broken. Same reason the headed HUD hold
  must be timer-driven.
- **One server owner.** A manual dev server plus the runner's `webServer` (with
  `reuseExistingServer`) once made a whole suite fail in ~250 ms. Kill zombies
  with a bracketed pattern (`pkill -f "[v]ite e2e"`) so pkill can't self-match.
- **Trusted input.** The map binds real container-level mouse events and
  ignores synthetic `dispatchEvent`. Drive the map with `page.mouse.*`.
- **Chained camera actions** (zoom ×2, flyTo) need camera-idle between them — a
  click landing mid-ease cancels the animation and re-eases from the
  intermediate zoom, failing a correct assertion.
- **`page.evaluate` cannot resolve bare-specifier imports** — it runs in the
  page, not a bundler. Use IIFEs over already-loaded globals.
- **`isStyleLoaded()` throws when no style is set.** Source guards with
  `map.style && …`; keep that guard.

### Local Package Testing

**Do NOT use `npm link`.** Use the tarball method:

1. **Build and pack:**
   ```bash
   npm run build
   npm pack          # creates bkoi-gl-<version>.tgz
   ```
2. **Install in another project:**
   ```bash
   npm install /absolute/path/to/bkoi-gl-*.tgz
   ```
3. **Iterate:** rebuild, pack, and reinstall after each change.

The tarball simulates a real npm install and ensures dependencies resolve
correctly. `npm link` produces phantom-symbol bugs because of symlink
resolution across `node_modules`.

### CI

The Release workflow (`.github/workflows/`) runs on push to `main` and creates
the GitHub Release from the CHANGELOG; a separate workflow runs LLM code review
on `dev` pushes. The heavy suites (unit + browser coverage, e2e, framework
matrix) are local-only:

- Full gate before release: `npm run typecheck` → `npm run lint` → `npm test`
  → `npm run e2e` → `npm run test:pack`. `prepublishOnly` enforces typecheck +
  lint + vitest + pack smoke before any publish.
- `package-lock.json` is committed; `package.json` version specifiers are exact
  pins (`.npmrc` sets `save-exact=true`), so the lock only pins transitives.

---

## CSS Build

`src/index.css` is the library's stylesheet, emitted to
`dist/style/bkoi-gl.css` and exported at the `./style.css` subpath.

Overrides of vendor CSS (MapLibre, MapLibre Draw) win by source order — later
declarations of equal specificity win. Prefer adding to `src/index.css` over
patching vendor CSS at build time; mutating third-party CSS with regex is
brittle and unauditable.

---

## Gotchas

- **`isStyleLoaded()` throws when no style is set.** Always guard with
  `map.style && map.isStyleLoaded()`.
- **MapLibre GL is bundled as a regular dependency**, not a peer dep — end
  users do not install it separately. It is pinned exactly (`6.9.1`); bumps are
  deliberate, not automatic.
- **MapLibre private fields** (`_container`, `_resizeObserver`, `_update`,
  `_render`, `_frame`) drift across versions. Source accesses them behind
  `typeof` guards — never assume they exist.
- **`worker-bundle.generated.ts` is generated and committed.** Regenerate via
  the build; don't edit it.
- **The e2e host app serves `dist/`**, not `src/`. A change with no visible e2e
  effect is usually an unbuilt `dist/`.
- **Vitest mocks throw on missing-export property access** — any
  `vi.mock('maplibre-gl', …)` factory must expose everything source touches
  (`setWorkerUrl`, `getWorkerUrl`, `getVersion`, …).

---

## Commit Guidelines

This project follows [Conventional Commits](https://www.conventionalcommits.org/),
enforced via Husky + commitlint (`commitlint.config.js`).

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

`feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`

### Scopes (optional)

`map`, `controls`, `minimap`, `draw`, `worker`, `utils`, `types`, `build`,
`tests`

### Examples

Good:

```
feat(controls): add scale control option to minimap
fix(worker): resolve bundled worker URL under Vite prebundling
test(e2e): assert attribution survives style swap
docs: document the tarball testing method
refactor(utils): collapse duplicate validator branches
```

Bad:

```
update                       # no type
fixed bug                    # wrong tense
FEAT: new feature            # wrong case
```

### Validation

Commits are checked at two points: `pre-commit` (lint-staged + typecheck) and
`commit-msg` (identity check + commitlint + `Signed-off-by`). Failures must be
fixed, not bypassed.

---

## Release Process

### Pre-Release Checklist

1. **Verify tests pass:**
   ```bash
   npm run typecheck
   npm run lint
   npm test
   npm run e2e
   ```
2. **Lint the package config:**
   ```bash
   npm run build
   npx publint
   ```
3. **Verify TypeScript types resolve correctly:**
   ```bash
   npx @arethetypeswrong/cli --pack .
   ```
   The `/worker` subpath may be flagged under node10 / CJS — expected for a
   library shipping a browser-only worker script.
4. **Test the tarball locally** — see [Local Package Testing](#local-package-testing).

### Publishing Steps

Publishing is **manual** — CI never publishes.

1. Prepare the release on a branch:
   - `package.json` `version` matches the top `## [x.y.z] - <date>` entry in
     `CHANGELOG.md` (real date, not `unreleased`).
2. Merge into `main` — the Release workflow reads the CHANGELOG, tags
   `vX.Y.Z`, and creates the GitHub Release with that section as notes.
3. Publish from your machine (requires `npm login` + 2FA):
   ```bash
   npm publish --access public   # prepublishOnly gate runs automatically
   ```
4. **Verify publication:**
   - [npm package page](https://www.npmjs.com/package/bkoi-gl)
   - `npm install bkoi-gl@latest` in a fresh project.

---

## Resources

- [README.md](./README.md) — user-facing API docs and examples
- [CHANGELOG.md](./CHANGELOG.md) — version history
- [Barikoi API docs](https://docs.barikoi.com/docs/maps-api)
- [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Issues](https://github.com/barikoi/bkoi-gl-js/issues)
- `tests/framework/README.md` — framework matrix details
