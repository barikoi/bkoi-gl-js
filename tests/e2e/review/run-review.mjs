/**
 * Headed review walker — steps through every e2e case in ONE visible browser,
 * captures per-case screenshots + DOM evidence into a retained report, and
 * prints per-case PASS/PROBLEM lines. Headed by default, matching
 * react-bkoi-gl.
 *
 * Usage:
 *   npm run e2e:review                        # HEADED walk, 8s dwell per case
 *   npm run e2e:review -- --headless          # no window, artifacts + summary
 *   npm run e2e:review -- --dwell=0           # walk with no per-case hold
 *   npm run e2e:review -- --dwell 6000        # space-separated form also works
 *   npm run e2e:review -- --pause             # wait for Enter per case
 *   npm run e2e:review -- --only=draw         # one module or exact case id
 *   node run-review.mjs --only=draw --dwell=6000
 *
 * Dwell precedence: --dwell arg > DWELL env > 8000 when headed, 0 when headless.
 * --dwell=0 means no hold, so no progress bar is drawn (the pill still shows).
 * --pause (or PAUSE=1) ignores the dwell and advances on Enter instead.
 *
 * Output: tests/e2e/report/review-<stamp>.json + screenshots-<stamp>/*.png
 * (retained between runs — never wiped; the playwright outputDir is not used).
 */
import { chromium } from 'playwright'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import {
  headedContext,
  headedLaunch,
  hudHoldScript,
  mountHudScript,
} from '../../shared/review-banner.mjs'
import { PNG } from 'pngjs'

const PORT = process.env.E2E_PORT || '5176'
const argv = process.argv.slice(2)
// Supports both `--dwell=5000` and `--dwell 5000` (the usage header promises
// both; only the `=` form worked, so `--dwell 5000` silently kept the default).
const flag = (name, fallback = undefined) => {
  const eq = argv.find(a => a.startsWith(`--${name}=`))
  if (eq) return eq.split('=').slice(1).join('=')
  const i = argv.indexOf(`--${name}`)
  if (i !== -1 && argv[i + 1] && !argv[i + 1].startsWith('--')) return argv[i + 1]
  return fallback
}
const HEADED = !argv.includes('--headless')
// Dwell precedence: --dwell arg > DWELL env > 8s when headed, 0 when headless.
const DWELL = (() => {
  const raw = flag('dwell', process.env.DWELL ?? (HEADED ? 8000 : 0))
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 0) {
    console.error(`[review] invalid --dwell=${raw} (expected ms ≥ 0)`)
    process.exit(1)
  }
  return n
})()
const ONLY = flag('only') ?? process.env.ONLY
// --pause waits for Enter between cases instead of the timer (reference parity).
const PAUSE = argv.includes('--pause') || process.env.PAUSE === '1'
const base = `http://localhost:${PORT}`

// Case registry — parsed from the app's CASES map (same source the specs use).
// Anchored to the registry's 2-space top-level keys so string literals inside
// case bodies ('bkoi-gl': … import-target maps) are never mistaken for cases.
const registrySrc = readFileSync(new URL('../app/cases.js', import.meta.url), 'utf8')
const CASES = [...registrySrc.matchAll(/^ {2}'([\w/-]+)':/gm)].map(m => m[1])
const planned = CASES.filter(id => !ONLY || id.startsWith(ONLY))

// Cases that mount no settled map: error paths assert their error contract
// instead (map-error log / constructor throw), and paint/branding checks
// are meaningless there.
const NO_MAP = new Set(['errors/bad-key', 'errors/bad-style', 'errors/bad-container'])

/** Sample a screenshot buffer: canvas-painted? + logo-region glyph pixels. */
function paintedFromPng(buffer) {
  try {
    const png = PNG.sync.read(buffer)
    const step = Math.max(1, Math.floor(png.width / 64))
    let sum = 0
    let sumSq = 0
    let n = 0
    for (let y = 8; y < png.height - 8; y += step) {
      for (let x = 8; x < png.width - 8; x += step) {
        const i = (png.width * y + x) << 2
        // Luma — a blank canvas is uniform; rendered tiles vary widely.
        const l = 0.299 * png.data[i] + 0.587 * png.data[i + 1] + 0.114 * png.data[i + 2]
        sum += l
        sumSq += l * l
        n++
      }
    }
    const mean = sum / n
    const std = Math.sqrt(Math.max(0, sumSq / n - mean * mean))
    // Bottom-left 88×27 px (logo: 88×23 at −4px margins): count glyph-dark
    // pixels. A computed-style check passes while the SVG fails to paint —
    // only pixels prove visibility (bkoi-gl-js postmortem 2026-09-16).
    let logoDark = 0
    for (let y = png.height - 27; y < png.height - 4; y++) {
      for (let x = 0; x < 88; x++) {
        const i = (png.width * y + x) << 2
        const l = 0.299 * png.data[i] + 0.587 * png.data[i + 1] + 0.114 * png.data[i + 2]
        if (l < 160) logoDark++
      }
    }
    return {
      painted: std > 4,
      mean: Math.round(mean),
      std: Math.round(std * 10) / 10,
      logoDarkPx: logoDark,
      logoVisible: logoDark > 50,
      n,
    }
  } catch (e) {
    return { painted: null, error: String(e).slice(0, 80) }
  }
}

// One server owner: reuse a live e2e server, otherwise start one and own
// its lifetime (never mix with the playwright webServer).
const portOpen = async () => {
  try {
    const res = await fetch(base)
    return res.ok
  } catch {
    return false
  }
}
let serverProc = null
if (!(await portOpen())) {
  console.log('[review] starting e2e server (owned by this run)…')
  serverProc = spawn('npx', ['vite', 'tests/e2e/app', '--port', PORT, '--strictPort'], {
    stdio: 'ignore',
    detached: false,
  })
  for (let i = 0; i < 60 && !(await portOpen()); i++) {
    await new Promise(r => setTimeout(r, 1000))
  }
  if (!(await portOpen())) {
    console.error(
      '[review] e2e server failed to start (needs BARIKOI_API_KEY in .env + a fresh `npm run build`)'
    )
    serverProc?.kill()
    process.exit(1)
  }
}

const browser = await chromium.launch(HEADED ? headedLaunch : { headless: true })
const context = await browser.newContext(HEADED ? headedContext : {})
await context.grantPermissions(['geolocation'], { origin: base }).catch(() => {})
await context.setGeolocation({ latitude: 23.82, longitude: 90.39, accuracy: 30 })
const page = await context.newPage()
await page.bringToFront().catch(() => {})

const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const shotDir = new URL(`../report/screenshots-${stamp}/`, import.meta.url).pathname
mkdirSync(shotDir, { recursive: true })

// Cases with a DIFFERENT expected attribution count (branding variants).
const ATTRIB_EXPECTED = new Map([['controls/attribution-off', 0]])

const results = []
let n = 0

for (const id of planned) {
  n += 1
  process.stdout.write(`  ▶ ${id} … `)
  const errors = []
  page.removeAllListeners('pageerror')
  page.on('pageerror', e => errors.push(String(e)))

  await page.goto(`${base}/?case=${id}`, { waitUntil: 'domcontentloaded' })

  let mapReady = false
  let errorContractMet = false
  if (NO_MAP.has(id)) {
    // Error cases: their contract IS the failure — a logged map-error event
    // or the constructor-error record.
    try {
      await page.waitForFunction(
        () => window.__LOG__.some(l => l.type === 'map-error' || l.type === 'constructor-error'),
        null,
        { timeout: 45000 }
      )
      errorContractMet = true
    } catch {
      errors.push('error case produced no map-error/constructor-error log')
    }
    mapReady = true // page is in its expected state; skip map-specific checks below
  } else {
    try {
      await page.waitForFunction(
        () => {
          const m = window.__MAP__
          return Boolean(m && m.isStyleLoaded() && !m.isMoving())
        },
        null,
        { timeout: 45000 }
      )
      mapReady = true
    } catch {
      errors.push('map did not settle within 45s')
    }
  }

  if (HEADED) {
    // Fail loud: a swallowed error here once meant the run reported green with
    // no HUD on screen (the mount "worked" but nothing was ever injected).
    try {
      await page.evaluate(mountHudScript({ label: id }))
    } catch (e) {
      errors.push(`HUD mount failed: ${String(e.message || e).slice(0, 80)}`)
    }
    await page
      .evaluate(t => {
        document.title = t
      }, `▶ ${id} (${n}/${planned.length})`)
      .catch(() => {})
  }

  // Small visible demos for the cases where a still shot is not enough.
  if (mapReady && id === 'controls/minimap') {
    await page
      .evaluate(() => window.__MINIMAP__?.map?.jumpTo({ center: [91.2, 23.6] }))
      .catch(() => {})
  }
  if (mapReady && id === 'draw/all') {
    await page.evaluate(() => window.__MAP__.doubleClickZoom.disable()).catch(() => {})
    const tool = page.locator('.mapbox-gl-draw_polygon')
    await tool.click().catch(() => {})
    const box = await page.locator('canvas').first().boundingBox()
    if (box) {
      const cx = box.x + box.width / 2
      const cy = box.y + box.height / 2
      for (const [x, y] of [
        [cx - 100, cy - 100],
        [cx + 100, cy - 100],
        [cx, cy + 100],
      ]) {
        await page.mouse.click(x, y)
      }
      await page.mouse.dblclick(cx, cy + 100)
    }
  }
  if (mapReady && id === 'draw/api') {
    await page
      .evaluate(() => {
        const draw = window.__MAP__.draw
        draw.add({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [90.38, 23.81],
                [90.4, 23.81],
                [90.4, 23.83],
                [90.38, 23.81],
              ],
            ],
          },
        })
        window.__MAP__.triggerRepaint()
      })
      .catch(() => {})
  }
  if (mapReady && id === 'styles/setstyle') {
    await page
      .evaluate(() =>
        window.__SETSTYLE__(
          'barikoi-dark',
          'https://map.barikoi.com/styles/barikoi-dark/style.json'
        )
      )
      .catch(() => {})
    // Wait for the NEW style to load, not a fixed sleep: setStyle is async and
    // a sleep either flakes (style slower than the guess) or wastes time.
    await page
      .waitForFunction(
        () => {
          const m = window.__MAP__
          return Boolean(m && m.isStyleLoaded() && !m.isMoving())
        },
        null,
        { timeout: 45000 }
      )
      .catch(() => {})
  }
  if (mapReady && id === 'controls/navigation') {
    await page
      .locator('button.maplibregl-ctrl-geolocate:not([disabled])')
      .click()
      .catch(() => {})
  }

  // Render gate: force a repaint and wait for it to actually land, so the
  // screenshot samples painted pixels rather than a blank canvas mid-paint.
  //
  // Deliberately NOT waiting for the engine's 'idle' event: that only fires
  // after NEW work (tiles/paint), so with no dwell (--dwell=0) nothing repaints
  // and the wait burned its full timeout on every case — the walk appeared
  // "stuck on 1/13". The white-canvas verdict still comes from the pixel
  // sample below.
  //
  // Resident pixels are read back after the frame: `once('render')` fires when
  // the frame starts, so an immediate screenshot could still catch a blank
  // canvas (seen as a false "unpainted" problem on a style swap).
  if (mapReady && !NO_MAP.has(id)) {
    await page
      .evaluate(
        () =>
          new Promise(resolve => {
            const m = window.__MAP__
            if (!m) return resolve()
            let done = false
            const finish = () => {
              if (done) return
              done = true
              // One rAF past the frame so compositing has the new pixels.
              requestAnimationFrame(() => requestAnimationFrame(resolve))
            }
            m.once('render', finish)
            m.triggerRepaint()
            // Occluded windows may never deliver a frame; the pixel sample is
            // the real gate, so don't hang here.
            setTimeout(finish, 2000)
          })
      )
      .catch(() => {})
  }

  // Start the HUD hold BEFORE capturing: the progress bar is drawn by
  // hudHoldScript, so capturing first (the old order) meant the bar never
  // appeared in a screenshot or on screen before the case advanced.
  // The promise resolves when the drain finishes; we capture mid-drain.
  //
  // NO wait on the animated width here: Playwright's waitForFunction polls on
  // rAF, and Chromium throttles rAF for an occluded/headed window — a gate on
  // "width changed" measured 5s for a 5s drain and blocked the run behind it
  // (the drain only started once the gate gave up). The bar is inserted
  // synchronously by the script below, so its presence needs no wait.
  let holdDone = null
  if (HEADED && DWELL > 0) {
    holdDone = page.evaluate(hudHoldScript(DWELL)).catch(e => {
      errors.push(`HUD hold failed: ${String(e.message || e).slice(0, 80)}`)
    })
  }

  const evidence = await page
    .evaluate(() => {
      const logo = document.querySelector('a.maplibregl-ctrl-logo')
      const attrib = document.querySelector('.maplibregl-ctrl-attrib')
      const inner = document.querySelector('.maplibregl-ctrl-attrib-inner')
      const scale = document.querySelector('.maplibregl-ctrl-scale')
      const minimap = document.querySelector('.maplibregl-ctrl-minimap')
      return {
        canvas: !!document.querySelector('canvas'),
        hud: (() => {
          const h = document.getElementById('e2e-hud')
          if (!h) return null
          const r = h.getBoundingClientRect()
          return {
            // Bottom-center = horizontally centred on the viewport, with its
            // bottom edge in the lower portion (28px gap + pill height).
            centerDx: Math.round(Math.abs(r.left + r.width / 2 - window.innerWidth / 2)),
            bottomGap: Math.round(window.innerHeight - r.bottom),
            label: (h.querySelector('.label')?.textContent || '').slice(0, 60),
          }
        })(),
        logo: logo
          ? {
              painted: getComputedStyle(logo).backgroundImage !== 'none',
              box: `${logo.offsetWidth}x${logo.offsetHeight}`,
            }
          : null,
        attributionText: attrib
          ? (attrib.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120)
          : null,
        barikoiAttribCount: inner ? inner.querySelectorAll('a[href*="barikoi.com"]').length : 0,
        scale: scale ? scale.textContent.trim() : null,
        minimap: minimap ? `${minimap.offsetWidth}x${minimap.offsetHeight}` : null,
        pageErrors: window.__pageErrors__ || [],
      }
    })
    .catch(() => null)

  const shot = await page.screenshot({ fullPage: false }).catch(() => null)
  const paint = shot ? paintedFromPng(shot) : { painted: null }
  if (shot) writeFileSync(`${shotDir}${id.replace(/\//g, '_')}.png`, shot)

  const probs = [...errors, ...(evidence?.pageErrors || [])]
  if (!NO_MAP.has(id)) {
    if (mapReady && paint.painted === false) probs.push('canvas appears unpainted (uniform pixels)')
    if (mapReady && paint.logoVisible === false)
      probs.push(`logo not visible in bottom-left pixels (darkPx=${paint.logoDarkPx})`)
    if (mapReady && evidence) {
      const want = ATTRIB_EXPECTED.has(id) ? ATTRIB_EXPECTED.get(id) : 1
      if (evidence.barikoiAttribCount !== want)
        probs.push(`attribution Barikoi links = ${evidence?.barikoiAttribCount} (want ${want})`)
    }
  }
  // HUD geometry is a headed-only contract: the pill must be bottom-center
  // (framework-test and e2e review share one HUD). Asserted, not eyeballed.
  if (HEADED && evidence) {
    if (!evidence.hud) probs.push('HUD pill (#e2e-hud) missing')
    else if (evidence.hud.centerDx > 2)
      probs.push(`HUD not horizontally centred (off by ${evidence.hud.centerDx}px)`)
    else if (evidence.hud.bottomGap < 8 || evidence.hud.bottomGap > 80)
      probs.push(`HUD not bottom-anchored (gap ${evidence.hud.bottomGap}px)`)
  }
  const ok = mapReady && probs.length === 0
  results.push({ id, ok, evidence, paint, errors: probs, shot: shot ? `${id}.png` : null })
  console.log(ok ? 'OK' : `PROBLEM (${probs.join('; ')})`)
  const e = evidence || {}
  if (HEADED && e.hud) {
    console.log(`     hud=${JSON.stringify(e.hud)} (bottom-center: centerDx≤2, gap 8..80)`)
  }
  if (!NO_MAP.has(id)) {
    console.log(
      `     logo=${JSON.stringify(e.logo)} attrib="${e.attributionText}" scale=${JSON.stringify(e.scale)}` +
        ` minimap=${JSON.stringify(e.minimap)} paint=${JSON.stringify(paint)}`
    )
  } else {
    console.log(`     error-case contract: ${errorContractMet ? 'met' : 'NOT MET'}`)
  }

  // Wait out the rest of the hold so the dwell is real wall-clock time on
  // screen (the bar drains, the maintainer sees the case) before advancing.
  // Hard-capped: a stalled page must never wedge the walk (the drain is
  // timer-driven now, but a destroyed context would still leave the promise
  // pending and block every later case).
  if (holdDone) {
    await Promise.race([holdDone, new Promise(r => setTimeout(r, DWELL + 5000))])
  }

  // --pause: wait for Enter instead of advancing on the dwell timer, so the
  // maintainer can inspect a case for as long as it takes.
  if (PAUSE) {
    await new Promise(resolve => {
      process.stdout.write('     (press Enter for the next case) ')
      process.stdin.resume()
      process.stdin.once('data', () => {
        process.stdin.pause()
        resolve()
      })
    })
  }
}

await browser.close()
serverProc?.kill()
serverProc = null

mkdirSync(new URL('../report/', import.meta.url).pathname, { recursive: true })
const out = new URL(`../report/review-${stamp}.json`, import.meta.url).pathname
writeFileSync(
  out,
  JSON.stringify({ ranAt: new Date().toISOString(), headed: HEADED, dwell: DWELL, results }, null, 2)
)

const failed = results.filter(r => r.ok === false)
console.log(
  `\n${results.length} cases reviewed — ${results.filter(r => r.ok).length} OK, ${failed.length} problems`
)
if (failed.length) console.log('Problems:', failed.map(f => f.id).join(', '))
console.log(`Report: ${out}`)
console.log(`Screenshots: ${shotDir}`)
process.exitCode = failed.length ? 1 : 0
