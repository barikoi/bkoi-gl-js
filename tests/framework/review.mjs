#!/usr/bin/env node
/**
 * Framework review mode — headed human walkthrough of every framework app,
 * mirroring the e2e review UX (one browser, one app at a time, bottom-center
 * HUD pill with a draining hold bar, evidence screenshots, summary).
 *
 * Per app: install the packed tarball, build, serve the production output,
 * show it headed with a dwell, then move on. Ported from react-bkoi-gl's
 * tests/framework/review.mjs; bkoi-gl's `serveApp` serves each app's build
 * output directly (no snapshot slots), so this walks app-by-app instead of
 * pre-snapshotting every cell.
 *
 * Usage:
 *   npm run test:framework:review                  # 10s dwell per app build
 *                                                    (default: every app in APPS)
 *   DWELL=20000 npm run test:framework:review      # longer dwell
 *   PAUSE=1 npm run test:framework:review          # wait for Enter between apps
 *   ONLY=next16 npm run test:framework:review      # one app (or comma list)
 *   PM=pnpm npm run test:framework:review          # install with another PM
 *   SKIP_BUILD=1 ...                               # reuse existing builds
 *
 * Evidence lands in tests/framework/review-report/.
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'
import {
  APPS,
  ensureTarball,
  here,
  installPm,
  installTarball,
  loadEnvKey,
  fixTarballDep,
  serveApp,
} from './lib.mjs'
import {
  headedContext,
  headedLaunch,
  hudHoldScript,
  mountHudScript,
} from '../shared/review-banner.mjs'

const args = process.argv.slice(2)
const getArg = (k, d) => {
  const p = args.find(a => a.startsWith(`--${k}=`))
  return p ? p.slice(k.length + 3) : d
}
// Default: the full APPS matrix (order of declaration). The earlier hard-
// coded react-only default silently skipped 8 apps after the A1 expansion.
const only = (getArg('only') || process.env.ONLY || Object.keys(APPS).join(',')).split(',')
const pm = getArg('pm', process.env.PM || 'npm')
const DWELL = Number(process.env.DWELL ?? 10_000)
const PAUSE = process.env.PAUSE === '1'
const SKIP_BUILD = process.env.SKIP_BUILD === '1'
const apiKey = loadEnvKey()

const reportDir = path.join(here, 'review-report')
fs.mkdirSync(reportDir, { recursive: true })

const waitForEnter = label => {
  if (!PAUSE) return Promise.resolve()
  return new Promise(resolve => {
    process.stdout.write(`  ⏸  press ENTER to continue to ${label} … `)
    const onData = d => {
      if (d.toString().includes('\n')) {
        process.stdin.removeListener('data', onData)
        process.stdin.setRawMode?.(false)
        resolve()
      }
    }
    process.stdin.setRawMode?.(true)
    process.stdin.resume()
    process.stdin.on('data', onData)
  })
}

console.log('[review] building library + packing tarball...')
const tarball = ensureTarball()
const tarballName = path.basename(tarball)

// ---------- plan cells ----------
const cells = []
for (const key of only) {
  const app = APPS[key]
  if (!app) {
    console.error(`[review] unknown app "${key}" (known: ${Object.keys(APPS).join(', ')})`)
    process.exit(2)
  }
  for (const cell of app.buildCells) {
    cells.push({ key, app, cell, cwd: path.join(here, app.dir), slug: cell.name.replace(/[^a-z0-9]+/gi, '-') })
  }
}
const total = cells.length

// ---------- phase 1: prepare (install + build every selected app) ----------
if (!SKIP_BUILD) {
  const seenApps = new Set()
  for (const { key, app, cwd } of cells) {
    if (seenApps.has(key)) continue
    seenApps.add(key)
    fixTarballDep(cwd, tarballName)
    console.log(`\n[prepare] ${key}: install base deps + tarball...`)
    installPm(cwd, pm)
    installTarball(cwd, tarball, pm)
    if (app.prepare) app.prepare(cwd, apiKey)
  }
  for (const { key, app, cell, cwd } of cells) {
    console.log(`[prepare] ${key}: ${cell.name}...`)
    const env = { ...process.env }
    if (app.envPrefix) env[`${app.envPrefix}BARIKOI_API_KEY`] = apiKey
    execSync(cell.cmd, { cwd, stdio: 'inherit', timeout: 420_000, env })
  }
}

// ---------- phase 2: headed walkthrough ----------
const browser = await chromium.launch(headedLaunch)
const context = await browser.newContext(headedContext)
const page = await context.newPage()

const results = []
let n = 0

for (const { key, app, cell } of cells) {
  n += 1
  console.log(`\n━━ ${key} — ${cell.name}`)
  const errors = []
  page.removeAllListeners('pageerror')
  page.on('pageerror', e => errors.push(String(e)))

  process.stdout.write(`  ▶ ${key} … `)
  let url
  let stop
  try {
    ;({ url, stop } = await serveApp(app))
  } catch {
    results.push({ app: key, cell: cell.name, pm, ok: false, errors: ['server did not start'] })
    console.log('FAIL (server did not start)')
    continue
  }

  await page.goto(url, { waitUntil: 'domcontentloaded' })
  let ready = false
  try {
    // __IDLE = tiles parsed by the worker and painted; __READY = engine load.
    await page.waitForFunction(() => window.__IDLE === true || window.__READY === true, null, {
      timeout: 45_000,
    })
    ready = true
  } catch {
    errors.push('map did not render within 45s')
  }

  // Bottom-center HUD pill, same visual as the e2e review hold.
  const label = `${key} · ${cell.name}`
  await page
    .evaluate(mountHudScript({ label: ready ? label : `${label} — DID NOT RENDER` }))
    .catch(() => {})
  await page
    .evaluate(t => {
      document.title = t
    }, `▶ ${label} (${n}/${total})`)
    .catch(() => {})

  const shot = path.join(reportDir, `${key}-${slug(cell.name)}.png`)
  await page.screenshot({ path: shot }).catch(() => {})

  if (ready && DWELL > 0) await page.evaluate(hudHoldScript(DWELL)).catch(() => {})

  await waitForEnter(`${key} next cell`)

  const ok = ready && errors.length === 0
  results.push({
    app: key,
    cell: cell.name,
    pm,
    ok,
    url,
    screenshot: path.relative(here, shot),
    errors,
  })
  console.log(ok ? 'OK' : `FAIL (${errors.join('; ')})`)
  await stop()
}

await browser.close()

console.log('\n===== REVIEW SUMMARY =====')
for (const r of results) {
  console.log(
    `${r.ok ? '✓' : '✗'} ${r.app} — ${r.cell} (pm=${r.pm})${r.errors.length ? ` — ${r.errors.join('; ')}` : ''}`
  )
}
fs.writeFileSync(path.join(reportDir, 'summary.json'), JSON.stringify(results, null, 2))
console.log(
  `\n[review] evidence in tests/framework/review-report/ — overall: ${results.every(r => r.ok) ? 'PASS' : 'FAIL'}`
)
process.exit(results.every(r => r.ok) ? 0 : 1)

function slug(s) {
  return s.replace(/[^a-z0-9]+/gi, '-')
}
