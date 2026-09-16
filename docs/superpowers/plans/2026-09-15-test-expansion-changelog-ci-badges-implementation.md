# Implementation Plan: test expansion, CHANGELOG rewrite, public badges + CI

Spec: `docs/superpowers/specs/2026-09-15-test-expansion-changelog-ci-badges-design.md`
Sequencing: A (tests) → B (changelog) → C (CI/badges). One commit per phase task.

**Progress: A1 11/11 ✅ · A2 implemented + Feedback round AC1–AC6 landed (⚠️ full-suite re-verify PENDING) · B ⬜ · C 🟡 (design change pending — no GitHub secrets)**

Session note: e2e/browser tooling — ask the user before running or integrating.
Work is UNCOMMITTED in the tree (maintainer holds commits). Do not `git add`
until the feedback round below is done.

## Feedback round (2026-09-16) — ACCEPTANCE CRITERIA (source: react-bkoi-gl shipped implementation; do NOT invent alternatives)

Maintainer reviewed headed output of the A2 run and found defects the headless
suite could not see. Nothing below counts as done until its artifact proves it.

- **AC1 — Attribution: exactly one Barikoi copyright, always expanded, survives
  every rebuild.** Port react-bkoi-gl's `attribution-control.ts` pattern:
  `AttributionControl({ compact: false })` bottom-right + a MutationObserver on
  the control container that, after EVERY maplibre rebuild (styledata/sourcedata/
  terrain/setStyle), replaces the inner content with the exact Barikoi markup
  (links to barikoi.com / openmaptiles.org / openstreetmap.org) and clears
  `maplibregl-attrib-empty`. The `customAttribution` approach landed in A2
  DUPLICATES the copyright next to style-derived attributions — revert it.
  Prove: e2e asserts exactly one `a[href*="barikoi.com"]` set in the attribution
  before AND after setStyle; unit tests updated to the ported pattern.
  **✅ LANDED** — `src/index.ts` Observer + `controls/attribution` counts; e2e
  `controls/attribution-off` + `styles/setstyle` assert the count; review runner
  records `barikoiAttribCount` per case.
- **AC2 — Logo byte-identical to react-bkoi-gl.** Copy the shipped CSS rule
  (`a.maplibregl-ctrl-logo`): 88×23, `margin:0 0 -4px -4px`, inline SVG
  data-URI, `.maplibregl-compact` variant — from
  `react-bkoi-gl/dist/styles/react-bkoi-gl.css` into `src/index.css`; markup
  matches their logo-control.ts (aria-label, rel noopener nofollow).
  **✅ LANDED** — `src/index.css` 88×23 + `margin:0 0 -4px -4px`; review
  runner measures the rendered box (66×17 at DPR 1) and logo-dark pixel count.
- **AC3 — Logo anchored bottom-left; other bottom-left controls stack ABOVE it.**
  Same visual outcome as react-bkoi-gl (e.g. ScaleControl renders above the
  logo). Verify their mechanism (add-order/margins), port it, and prove with an
  e2e case asserting vertical order (logo bottom edge < control bottom edge).
  **✅ LANDED** — add-order puts the logo first; `controls/navigation` review
  evidence shows `scale="200 m"` rendered above the logo.
- **AC4 — White-map gate.** gotoCase must require `idle` (tiles parsed &
  painted), not just `isStyleLoaded()` — a white canvas passes today's suite.
  Reproduce the maintainer's white maps in the review flow; root-cause and fix
  (dist/worker/style or headed-occlusion artifact — screenshots decide).
  **✅ LANDED** — pixel-sample gate in the review runner (`paintedFromPng`:
  luma mean/std over the canvas + logo-region dark-pixel count); a uniform
  canvas is reported as `PROBLEM (canvas appears unpainted)`. **NOT** an `idle`
  wait in `gotoCase`: `idle` only fires after NEW work, so it burned its full
  timeout per case with no dwell (the "stuck on 1/13" bug).
- **AC5 — Draw visible.** Review screenshots show the drawn polygon after UI
  draw and the API-added polygon (draw cases).
  **✅ LANDED** — review runner drives real `page.mouse` clicks + `dblclick` for
  `draw/all` and `draw.add` + `triggerRepaint` for `draw/api`; screenshots are
  retained per run.
- **AC6 — Review flow + retained artifacts.** Port react-bkoi-gl's
  `e2e:review` (tests/e2e/review/run-review.mjs): headed HUD stepping cases
  with per-case PASS/FAIL surfaced, per-case screenshots written to a retained
  dir; playwright outputDir timestamped (no wiping between runs). The maintainer
  judges pass/fail from artifacts alone — no manual clicking.
  **✅ LANDED** — one headed browser stepping every case with a bottom-center
  HUD (dot + label + draining hold bar), per-case PASS/PROBLEM, screenshots +
  `review-<stamp>.json` retained under `tests/e2e/report/` (gitignored);
  playwright `outputDir` timestamped per run.

## Feedback round 2 (2026-09-16, post-AC6 headed review) — tooling defects found

Maintainer reported (a) no progress bar and (b) walk stuck on 1/13. Root causes
and fixes, all verified live:

- **HUD was runner-only.** `npx playwright test --headed` showed NO HUD because
  every spec imported `test` from `playwright/test` and there was no spec-side
  fixture. Fixed by porting react-bkoi-gl's `tests/e2e/fixtures/map.ts` (owns
  `mountHud` + the headed 10s hold) and repointing all specs at it; the flat
  `tests/e2e/specs/helpers.ts` was folded into it.
- **Hold was rAF-driven.** Chromium freezes rAF for occluded/backgrounded
  windows, so the drain never resolved and the walk wedged until the browser was
  closed by hand. Now timer-driven (`setInterval`), with the bar given its
  initial width immediately so the fill is visible on the first paint.
- **Render gate waited on a future event.** The gate polled for `idle`, which
  only fires after NEW work — with `--dwell=0` nothing repaints, so it burned its
  45s timeout per case ("stuck on 1/13"). Replaced with a forced `triggerRepaint`
  + one rAF past the frame, with the pixel sample as the real verdict.
- **HUD mount held a stale label / hid failures.** `mountHudScript` early-returned
  when a pill existed (stale label between cases), and the runner swallowed mount
  and hold errors with `.catch(() => {})` — a "green" run with no HUD on screen.
  Now re-labels and surfaces failures as `PROBLEM`.
- **`--dwell` ignored the space form.** `--dwell 6000` silently kept the default;
  `flag()` now handles both forms and validates the value.
- **`e2e:review` was headless-by-default**, diverging from react-bkoi-gl. Now
  **headed by default**, `--headless` opts out; `--pause`/`PAUSE=1` added.
- **Screenshot took the pill but not the bar.** Capture happened before the hold
  started, so the draining bar was never in an artifact. Hold now starts before
  capture.

## Phase 0 — prerequisites — 🔄 REVISED (maintainer decision 2026-09-15)

- [ ] ~~Add `BARIKOI_API_KEY` to GitHub secrets~~ — **rejected: zero GitHub secrets.**
      Consequence (spec §C amendment pending user choice): CI gate drops the
      e2e step, `matrix.yaml` verifies install+build+worker-emission only
      (render checks stay local). Codecov upload stays — tokenless on public
      repos. **Open decision: (a) e2e local-only [recommended] vs (b) keyless
      demotiles e2e mode in CI.**

## Phase A1 — framework matrix to 13 apps / 14 build cells — ✅ 11/11

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
9. ✅ **Docs finalization** — README table now lists all 13 apps/14 cells
   (+ `--pm-subset` docs, Node note rewritten for the Node-24 target);
   `.gitignore` sweep had already landed with task 8's runner commit
   (`tests/framework/.gitignore`: locks, `pnpm-workspace.yaml`,
   `env.generated.ts` per app).
10. ✅ **Phase gate** — 2026-09-16: full 13-app npm run **PASS** (14/14 cells,
       incl. sveltekit re-verify) + `--pm-subset` **PASS** (pnpm ×3, bun ×3;
       yarn loud-skip locally, CI covers it).
11. ✅ **(unplanned, needed) dist Turbopack fix** — see task 3 ledger; guard
    in `scripts/test-pack.mjs`.

## Phase A2 — +6 e2e specs — 🔄 implemented; reopened under Feedback round (visual AC 1–6)

1. ✅ `events/contract` case + `events.spec.ts` (payload key table)
2. ✅ `controls.spec.ts` extend — minimap bidirectional sync + collapse
3. ✅ `draw.spec.ts` extend — API-driven add/changeMode/trash + payloads
4. ✅ `errors/*` cases + `errors.spec.ts` — bad key/style/container
5. ✅ `styles/setstyle` case + `styles.spec.ts` — style.load + attribution
   survives `setStyle` (**required a real dist fix** — see ledger)
6. ✅ `formats.spec.ts` extend — UMD global shape + worker fetch 200
7. ✅ **Matrix rows — relocated (maintainer decision 2026-09-16): README.md
       is consumer-only; the Feature Verification Matrix does NOT belong
       there.** Section removed from README (incl. TOC entry); matrix now
       lives in `tests/e2e/README.md` beside the case registry. Spec A2
       "README matrix rows" amended accordingly.
8. ✅ **Spec-side fixtures (Feedback round 2)** — added `tests/e2e/fixtures/map.ts`
       (ported from react-bkoi-gl) owning the HUD + brand contract +
       wait helpers; all specs re-pointed from `playwright/test`/`helpers.ts`
       to it. `tests/e2e/specs/helpers.ts` deleted.

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

- **Docs consolidation (2026-09-16, maintainer request)**: `DEVELOPER_GUIDE.md`
  was stale (claimed MapLibre v5.13.0 while `package.json` pins 6.9.1;
  documented an `index.css` bundle and class layout that no longer match
  `src/`) and nothing linked to it. Replaced by `CONTRIBUTING.md` ported from
  react-bkoi-gl (setup, architecture, testing, pitfalls, commit/release
  process) and the old guide **deleted** — it is not referenced anywhere.
- **Script parity with react-bkoi-gl (2026-09-16)**: added `e2e:coverage`
  (`tests/e2e/scripts/generate-coverage.mjs`), `screenshots`
  (`scripts/capture-screenshots.mjs`), and `test:framework:review`
  (`tests/framework/review.mjs`). The coverage matrix was **rewritten**, not
  copied: the reference's matrix targets React-component cases that do not
  exist here, so this one maps bkoi-gl's real 13 cases / README sections and
  attributes specs via both `gotoCase(...)` and the direct
  `page.goto('/?case=...')` that error specs use. `e2e:review` is now **headed
  by default** (`--headless` opts out), matching the reference.
- **`--headed` CLI flag does not reach `testInfo.project.use`** (confirmed in
  the reference repo too): the fixtures detect a headed run via
  `process.argv.includes('--headed')` as the second signal.

- **Library dist fix #2 (A2, unplanned)**: the styles/setstyle spec exposed
  that maplibre v6's AttributionControl rebuilds its inner HTML on every
  `styledata` — the post-load innerHTML injection was wiped by `setStyle`,
  losing the Barikoi attribution. Root-cause fix: attribution ships as
  `customAttribution` at construction (re-applied by every rebuild); the
  deferred-injection block and its unit tests were replaced (unit mock
  updated to mirror the real customAttribution rendering).
- **draw API semantics (verified in maplibre-gl-draw source + live probe)**:
  public `draw.changeMode` is always silent (no `draw.modechange` — that
  fires only on UI toolbar clicks); `draw.add` fires no events and its
  hot/cold source update needs a render frame (`triggerRepaint()` on an
  idle map); trash deletes only from `simple_select` with an active
  selection. `draw.update` has no deterministic API path (UI drag only) —
  excluded per the no-synthetic-drags rule.
- **draw/all cold-source flake fixed**: after UI create, draw auto-selects
  the feature and hot/cold routing moves it between sources mid-render —
  the old cold-only assertion raced the transition; now polls hot+cold
  combined (maplibre v6 `getData()` is async — evaluate callbacks must
  await it).
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
      ⚠️ **PENDING RE-VERIFY** — last full run after the fixtures refactor:
      13 failed / 7 passed. The failure set was not yet triaged (session
      stopped for commit prep). Run `npm run e2e` and triage before treating
      A2/AC as closed; `e2e:review -- --headless --dwell=0` was green 13/13
      and `controls.spec.ts` green 5/5 in isolation, so suspect the fixture
      refactor's per-spec applicability or the shared server lifecycle.
- [ ] CHANGELOG rewritten, top version = package.json version
- [ ] Both workflows valid; first push to main runs the gate green
