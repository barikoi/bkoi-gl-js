# bkoi-gl 4.0.x — test expansion, CHANGELOG rewrite, public badges + CI

Date: 2026-09-15
Status: Approved design — **A1 in progress (10/11 tasks ✅)**; §C revision pending (no GitHub secrets)
Sequencing: A (tests) → B (changelog) → C (CI/badges). C consumes A's suites.
Live tracking: `docs/superpowers/plans/2026-09-15-test-expansion-changelog-ci-badges-implementation.md`
(includes the actual-approach ledger of deviations found during A1).

## Goals

1. **Framework matrix to 13 apps / 14 build cells** — add Next.js 15/16, CRA 5,
   and a second major for React, Nuxt, Svelte, and Angular; npm across all
   cells, pnpm/yarn/bun on a representative subset.
2. **+6 e2e specs** — event payload contracts, minimap sync, API-driven draw
   ops, error paths, `setStyle`/attribution persistence, UMD worker fetch.
3. **CHANGELOG.md fully rewritten** in the react-bkoi-gl pattern
   (Keep a Changelog + SemVer header, `DD-MM-YYYY` dates, bold-led entries,
   no attribution lines, no `---` separators).
4. **Public-repo CI + badges** — gate+release workflow on push to `main`
   (no PR events), CodeQL parallel job, weekly matrix workflow, README badge
   block in the react-bkoi-gl layout.

## Non-goals

- No Vue 2 / Svelte 3 cells (EOL). No bundler permutations beyond Next 16's
  two build modes (Turbopack default + webpack compat).
- No react-bkoi-gl-as-consumer cell — react-bkoi-gl depends on `maplibre-gl`
  directly, not on `bkoi-gl`.
- No local badge SVG generation (`scripts/make-badges.mjs`); shields.io +
  workflow badges only.
- No npm publish automation — `npm publish` stays manual behind
  `prepublishOnly`.
- No PR-triggered CI (maintainer works via direct pushes).

## A1. Framework matrix — 13 apps / 14 build cells (12/13 apps verified ✅)

| App dir (⭐ = new) | Stack | Build cell(s) | State |
|---|---|---|---|
| `react18-vite-app` ⭐ | React 18.3 + Vite 7 | `vite build` | ✅ |
| `react19-vite-app` (rename of `react-vite-app`) | React 19 + Vite 7 | `vite build` | ✅ |
| `next15-app` ⭐ | Next.js 15 (webpack default) | `next build` | ✅ |
| `next16-app` ⭐ | Next.js 16 | `next build` (Turbopack) + `next build --webpack` | ✅ |
| `cra5-app` ⭐ | react-scripts 5, React 18.3 | `react-scripts build` | ✅ |
| `nuxt3-app` (existing, renamed) | Nuxt 3.21 | `nuxi generate` | ✅ pre-existing |
| `nuxt4-app` ⭐ | Nuxt 4 | `nuxi generate` | ✅ |
| `svelte4-vite-app` ⭐ | Svelte 4.2 + vite-plugin-svelte 3 **+ Vite 5** | `vite build` | ✅ |
| `svelte5-vite-app` (rename of `svelte-vite-app`) | Svelte 5 + Vite 7 | `vite build` | ✅ |
| `angular20-app` ⭐ | Angular 20 (**+ zone.js**) | `ng build` | ✅ |
| `angular21-app` (rename of `angular-app`) | Angular 21 | `ng build` | ✅ |
| `vue-vite-app` (existing) | Vue 3 + Vite 7 | `vite build` | ✅ npm/pnpm/bun |
| `sveltekit-app` (existing) | SvelteKit 2 + adapter-static | `vite build` | ⬜ re-verify in full run |

Rules:

- One **committed app dir per cell** (react-bkoi-gl's proven pattern). Scaffolds
  for `next15-app`, `next16-app`, `cra5-app` are adapted from the local
  `~/Barikoi/react-bkoi-gl/tests/framework/` equivalents; app code rewritten to
  consume `bkoi-gl` (vanilla API) instead of `react-bkoi-gl`.
- **Svelte 4 requires `@sveltejs/vite-plugin-svelte@3`** (v4/v5 target Svelte
  5). Pin per-app toolchains to the major that supports the framework major.
- Harness (`run.mjs`/`lib.mjs`/`verify.mjs`) keeps its verification contract:
  a `Worker` was constructed, every worker URL fetches, `window.__READY`
  (style load), `window.__IDLE` (tiles parsed + rendered), no page errors.
- `run.mjs` additions: `--pm=npm,pnpm,yarn,bun` accepts a comma list and loops
  the matrix per PM (default npm-only, all apps); PM subset = pnpm, yarn, bun
  on `react19-vite`, `vue-vite`, `next16` (webpack cell). Results printed as a
  table and written to `tests/framework/results.json`.
- Node: matrix targets Node 24 (even LTS) — this unlocks Nuxt 4. `run.mjs`
  warns when the active Node major is odd and an app's engines exclude it.
- `tests/framework/README.md` table updated to the new matrix.

## A2. New e2e specs (+6)

| Spec | Type | Asserts |
|---|---|---|
| `events.spec.ts` | new | Table-driven payload contract per documented event (`load`, `move`, `moveend`, `zoomend`, `click`, `draw.create`) — required key fields present |
| `controls.spec.ts` | extend | Minimap parent↔child sync (parent `flyTo` → minimap center follows; minimap click → parent jumps) + collapse toggle |
| `draw.spec.ts` | extend | API-driven ops: `draw.add`, `changeMode`, trash selection → `draw.create`/`draw.update`/`draw.delete` payloads. No synthetic canvas drags (flaky) |
| `errors.spec.ts` | new | Invalid API key → map `error` event, no uncaught throw; bad style URL → `error` event; nonexistent container id → descriptive thrown `Error` |
| `styles.spec.ts` | new | `setStyle` Barikoi → Barikoi → custom URL: `style.load` fires; Barikoi attribution survives `setStyle` |
| `formats.spec.ts` | extend | UMD global shape + the worker asset URL actually fetched (200) |

- New cases registered in `tests/e2e/app/cases.js` (`events/contract`,
  `styles/setstyle`, `errors/*`); existing cases extended in place.
- README **Feature Verification Matrix** gains one row per new spec.

## B. CHANGELOG.md — full rewrite (react-bkoi-gl pattern)

Header (exact):

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
```

- All 19 releases (`[1.0.0]` … `[4.0.0]`) rewritten: `## [x.y.z] - DD-MM-YYYY`
  headings (dates converted from "February 18, 2026" → "18-02-2026"),
  sections `### Added / Changed / Fixed / Breaking / Removed / Security /
  Testing` as applicable, **bold-led** prose entries, no `by @user`
  attribution lines, no `---` separators between releases. Facts preserved.
- `[4.0.0]` gains a `### Testing` section describing the 13-app matrix, the
  new e2e specs, pack/resolution gates, and CI. Stays `- Unreleased` until
  publish day.
- Compatibility: the release flow extracts the top `## [` heading — unchanged
  — and CI (C) adds a CHANGELOG ⇄ `package.json` version-match failure.

## C. CI + badges

### C1. `release.yml` → gate + release (push to `main` only)

- Triggers: `push` (branches: main) + `workflow_dispatch`. **No `pull_request`.**
- `codeql` job (parallel): javascript-typescript init + analyze.
- `gate` job, Node 24 + npm cache: `npm ci` → `typecheck` + `lint` →
  `vitest run --project unit --coverage` + Codecov upload (token optional;
  upload must not fail the gate) → `build` → `npx playwright install chromium
  --with-deps` + `npm run e2e` (env `BARIKOI_API_KEY` from secrets) →
  `npm run test:pack` → `npm run test:resolution`.
- Push-only steps: CHANGELOG version ⇄ `package.json` version match (fail on
  mismatch) → GitHub Release from top CHANGELOG section (existing
  softprops/action-gh-release behavior kept: draft false, prerelease on `-`).

### C2. `matrix.yaml` (new)

- Triggers: weekly `schedule` (cron Mon ~05:00 UTC) + `workflow_dispatch`.
  `timeout-minutes: 90`, concurrency group, Node 24.
- Steps: `npm ci` → `node tests/framework/run.mjs` (all 13 apps, npm) →
  `node tests/framework/run.mjs --only=react19-vite,vue-vite,next16
  --pm=pnpm,yarn,bun`. Upload `tests/framework/results.json` as artifact.

### C3. README badge block (react-bkoi-gl layout)

CI workflow badge → Codecov → npm version / weekly downloads / license →
node → GitHub release → GitHub stars → TypeScript → MapLibre v6 → WebGL2 →
framework badges (React 18|19, Next 15|16, Nuxt 3|4, Svelte 4|5, Angular
20|21, Vue 3) → PM ✓ badges (npm, pnpm, yarn classic, bun). **Bundlephobia
dropped** (stale metric for a bundled package).

### C4. Prerequisites (maintainer, one-time) — ❌ REVISED 2026-09-15

**Maintainer decision: zero GitHub secrets.** The `BARIKOI_API_KEY` secret
is out; Codecov stays **tokenless** (works on public repos without secrets).
Consequence (final composition pending user choice):

- **(a) recommended:** CI gate drops the e2e step; `matrix.yaml` verifies
  install + build + worker-emission only (render checks stay local).
- **(b):** e2e gains a keyless demotiles-style mode for CI (Barikoi-style /
  key-dependent cases skip).

## Verification strategy (the work itself)

- A1: each new app verified locally via `node tests/framework/run.mjs
  --only=<app>` as it lands; full 15-app + PM-subset run before finishing A.
- A2: `npm run e2e` fully green; new specs deterministic across 3 runs.
- B: top-of-file extraction dry-run matches `package.json` version.
- C: workflow YAML validated (actionlint if available, else `node --eval` YAML
  parse); first push to main exercises the real workflows.

## Risks

- **CRA 5**: react-scripts install prints deprecation warnings; lockfile
  resolution of its old webpack tree is the likely friction — pin exactly what
  react-bkoi-gl's `cra-app` uses (proven locally).
- **Next 16 webpack cell**: `--webpack` flag availability; fallback is
  Turbopack-only for 16 (14 build cells → 13).
- **Nuxt 4 on odd Node majors**: engines exclude them; matrix runs on Node 24
  (CI) and `run.mjs` warns locally.
- **E2e in CI without the API key secret**: gate fails loudly by design until
  `BARIKOI_API_KEY` is added.
