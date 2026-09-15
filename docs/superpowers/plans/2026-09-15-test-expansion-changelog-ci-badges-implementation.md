# Implementation Plan: test expansion, CHANGELOG rewrite, public badges + CI

Spec: `docs/superpowers/specs/2026-09-15-test-expansion-changelog-ci-badges-design.md`
Sequencing: A (tests) → B (changelog) → C (CI/badges). One commit per phase task.

**Progress: A1 10/11 tasks ✅ · A2 ⬜ · B ⬜ · C 🟡 (design change pending — no GitHub secrets)**

## Phase 0 — prerequisites — 🔄 REVISED (maintainer decision 2026-09-15)

- [ ] ~~Add `BARIKOI_API_KEY` to GitHub secrets~~ — **rejected: zero GitHub secrets.**
      Consequence (spec §C amendment pending user choice): CI gate drops the
      e2e step, `matrix.yaml` verifies install+build+worker-emission only
      (render checks stay local). Codecov upload stays — tokenless on public
      repos. **Open decision: (a) e2e local-only [recommended] vs (b) keyless
      demotiles e2e mode in CI.**

## Phase A1 — framework matrix to 13 apps / 14 build cells — ✅ 10/11

1. ✅ **Renames + harness keys** — `git mv` react19/svelte5/angular21 (+
   `nuxt` → `nuxt3`); `APPS` keys, `angular.json` project name (3 refs),
   `serve.dir`, app package names, README table. Verified: 4-app run PASS.
2. ✅ **`react18-vite-app`** — React 18.3.1 pins, Vite 7, same `main.jsx`
   (createRoot path is 18-compatible). Verified PASS.
3. ✅ **`next15-app` + `next16-app`** — scaffolds adapted from react-bkoi-gl,
   map code rewritten to vanilla `bkoi-gl` (`'use client'` + useEffect);
   `serveApp` gained a `type: 'next'` branch (detached `next start`,
   process-group kill). **Required a real dist fix** (see ledger):
   maplibre v6's cross-origin worker wrapper `new URL(<dynamic>,
   import.meta.url)` hard-fails Next 16 Turbopack when inlined — rollup now
   strips the dead base arg (`stripDynamicImportMetaUrlBase`) and
   `test:pack` guards its return. Verified: next15 PASS; next16 both cells
   (Turbopack default **and** `--webpack`) PASS — no fallback needed.
4. ✅ **`cra5-app`** — react-scripts 5.0.1 + React 18.3.1, jest
   `transformIgnorePatterns` for `bkoi-gl`, `@babel/plugin-transform-class-
   static-block` (maplibre v6 syntax vs CRA5's older preset). Verified PASS.
5. ✅ **`nuxt4-app`** — `nuxt ^4`, idiomatic `app/app.vue` dir; runs on local
   Node 25 despite odd-major engines (warning only). Verified PASS.
6. ✅ **`svelte4-vite-app`** — corrected pins vs plan: **Svelte 4.2.19 +
   `@sveltejs/vite-plugin-svelte@^3.1.2` + Vite 5** (3.x peer is `vite ^5`;
   plugin 3.2 does not exist — line ends at 3.1.2). Verified PASS.
7. ✅ **`angular20-app`** — `@angular/* ^20.3`, TS ~5.8 (v20's range);
   **added `zone.js` polyfill + dep** (the v21 app is zoneless; v20 defaults
   to zone-based CD). Verified PASS.
8. ✅ **`run.mjs` multi-PM + results** — `--pm` comma list, `--pm-subset`
   (pnpm/yarn/bun × react19-vite, vue-vite, next16), odd-Node warning,
   loud skip for missing PM binaries. Two environment fixes landed (ledger):
   pnpm ≥11 `minimumReleaseAgeExclude` blanket for maplibre-gl + fresh
   lockfile per run; bun `file:../<tarball>` relative spec (absolute path +
   package.json spec = DependencyLoop). Verified: pnpm + bun cells PASS
   (yarn not installed locally — loud SKIP; CI covers it).
9. ⬜ **Docs finalization** — `tests/framework/README.md` table rows for the
   7 new apps; `.gitignore` sweep for runner artifacts (bun.lock,
   pnpm-lock.yaml, pnpm-workspace.yaml, env.generated.ts in renamed dirs).
10. ⬜ **Phase gate** — full 13-app npm run green ×1 + `--pm-subset` green.
11. ✅ **(unplanned, needed) dist Turbopack fix** — see task 3 ledger; guard
    in `scripts/test-pack.mjs`.

## Phase A2 — +6 e2e specs — ⬜

1. ⬜ `events/contract` case + `events.spec.ts` (payload key table)
2. ⬜ `controls.spec.ts` extend — minimap bidirectional sync + collapse
3. ⬜ `draw.spec.ts` extend — API-driven add/changeMode/trash + payloads
4. ⬜ `errors/*` cases + `errors.spec.ts` — bad key/style/container
5. ⬜ `styles/setstyle` case + `styles.spec.ts` — style.load + attribution
   survives `setStyle`
6. ⬜ `formats.spec.ts` extend — UMD global shape + worker fetch 200
7. ⬜ README Feature Verification Matrix rows

## Phase B — CHANGELOG full rewrite — ⬜

1. ⬜ All 19 releases → react-bkoi-gl format (header block, `DD-MM-YYYY`,
   bold-led, sections, no attribution, no `---`); `[4.0.0]` gains Testing
   section incl. the Turbopack dist fix. Verify top version = package.json.

## Phase C — CI + badges — 🟡 blocked on Phase 0 decision

1. ⬜ `release.yml` → gate + release, push-to-main only, CodeQL parallel
   (gate composition depends on the (a)/(b) decision)
2. ⬜ `matrix.yaml` — weekly + dispatch, Node 24, 13-app run + PM subset,
   results artifact
3. ⬜ README badge block (CI, Codecov, release, stars, framework/PM/engine
   badges; drop bundlephobia)

## Actual-approach ledger (what differed from the spec and why)

- **Library dist fix (bigger than the spec)**: the matrix immediately caught
  a real consumer-breaking bug — maplibre v6's cross-origin worker wrapper
  uses `new URL(<dynamic>, import.meta.url)`; Turbopack (Next 16) treats that
  shape as an unresolvable asset import and fails the build when the code is
  inlined into `bkoi-gl/dist/index.js` (it tolerates the same code inside the
  `maplibre-gl` package). The base arg is provably dead on that path (only
  absolute URLs reach it), so the rollup build strips it and `test:pack`
  asserts it stays gone. react-bkoi-gl never hit this because it keeps
  maplibre external.
- **pnpm ≥11 supply-chain policy**: default `minimumReleaseAge` rejects both
  fresh `file:` tarballs (no publish time) and freshly released maplibre
  majors. Harness writes `minimumReleaseAgeExclude: [maplibre-gl]` +
  deletes `pnpm-lock.yaml` per run (deterministic cells).
- **bun tarball spec**: must be the same relative `file:../x.tgz` spec as
  package.json, or bun resolves the tarball twice (DependencyLoop).
- **Svelte 4 toolchain**: Vite 5 (not 6/7) — `vite-plugin-svelte@3` (last
  Svelte-4 plugin line, ends at 3.1.2) peers `vite ^5`.
- **Angular 20 vs 21**: v21 app is zoneless; v20 copy needed `zone.js`
  polyfill + dependency added back.
- **Nuxt 4 on Node 25**: engines exclude odd majors but installs/builds fine
  (warning only); CI uses Node 24 anyway.
- **`serveApp` next-branch**: Next builds are node-server builds; served via
  detached `next start` + process-group kill (react-bkoi-gl pattern), shared
  port 6180 sequential like the static apps.

## Definition of done

- [ ] `npm run test:framework` green across 13 apps (npm) + `--pm-subset` green
- [ ] `npm run e2e` green; new specs deterministic
- [ ] CHANGELOG rewritten, top version = package.json version
- [ ] Both workflows valid; first push to main runs the gate green
