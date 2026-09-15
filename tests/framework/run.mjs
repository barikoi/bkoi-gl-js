#!/usr/bin/env node
/**
 * Framework compatibility runner — see tests/framework/README.md.
 *
 * Usage:
 *   node tests/framework/run.mjs [--only=react-vite,vue-vite,...] [--pm=npm|pnpm|yarn|bun]
 *   npm run test:framework
 *
 * Per app: install base deps with the chosen PM, install the packed tarball,
 * build, serve, headlessly verify map rendering.
 * Long installs are expected; run this script detached and poll its log.
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import {
  APPS,
  ensureTarball,
  fixTarballDep,
  here,
  installPm,
  installTarball,
  loadEnvKey,
  serveApp,
  shAsync,
} from './lib.mjs'

// ---------- args ----------
const args = process.argv.slice(2)
const getArg = (k, d) => {
  const p = args.find(a => a.startsWith(`--${k}=`))
  return p ? p.slice(k.length + 3) : d
}
const allKeys = Object.keys(APPS).join(',')
const only = getArg('only', allKeys).split(',')
const pmList = getArg('pm', 'npm').split(',')
const pmSubset = args.includes('--pm-subset')
const apiKey = loadEnvKey()

// Canonical PM subset (spec A1): representative apps × non-npm PMs.
const SUBSET_PMS = ['pnpm', 'yarn', 'bun']
const SUBSET_APPS = ['react19-vite', 'vue-vite', 'next16']

// Odd Node majors are non-LTS; several framework tools (Nuxt 4+, newer
// Angular) exclude them via engines. Warn — installs usually still work.
const nodeMajor = Number(process.versions.node.split('.')[0])
if (nodeMajor % 2 === 1)
  console.warn(
    `[run] Node ${nodeMajor} is an odd (non-LTS) major — some matrix tools exclude odd majors; prefer Node 22/24 for the full run.`
  )

// ---------- build lib + pack ----------
console.log(`[run] building library + packing tarball (${pmSubset ? 'PM subset' : pmList.join(',')})...`)
const tarball = ensureTarball()
const tarballName = path.basename(tarball)

// ---------- run matrix ----------
// --pm accepts a comma list (each PM runs the full --only selection);
// --pm-subset overrides with the canonical PM×app subset above.
const plan = pmSubset
  ? SUBSET_PMS.flatMap(pm => SUBSET_APPS.map(key => ({ key, pm })))
  : pmList.flatMap(pm => only.map(key => ({ key, pm })))

// A PM whose binary is missing locally is loudly skipped (not failed).
const missingPms = [...new Set(plan.map(c => c.pm))].filter(pm => {
  try {
    execSync(`command -v ${pm}`, { stdio: 'pipe' })
    return false
  } catch {
    return true
  }
})
for (const pm of missingPms) console.warn(`SKIP pm=${pm} — binary not installed locally`)
const cells = plan.filter(c => !missingPms.includes(c.pm))

const results = []
for (const { key, pm } of cells) {
  const app = APPS[key]
  if (!app) {
    console.error(`[run] unknown app "${key}" (known: ${allKeys})`)
    process.exit(2)
  }
  const cwd = path.join(here, app.dir)
  const res = { app: key, pm, label: app.label, cells: [], ok: false }
  console.log(`\n=== ${key} (${app.label}) pm=${pm} ===`)

  fixTarballDep(cwd, tarballName)
  console.log(`[${key}] install base deps + tarball...`)
  installPm(cwd, pm)
  installTarball(cwd, tarball, pm)

  if (app.prepare) app.prepare(cwd, apiKey)

  let overall = true
  for (const cell of app.buildCells) {
    console.log(`[${key}] ${cell.name}...`)
    let status = 'pass'
    let note = ''
    try {
      const env = { ...process.env }
      if (app.envPrefix) env[`${app.envPrefix}BARIKOI_API_KEY`] = apiKey
      execSync(cell.cmd, { cwd, stdio: 'inherit', timeout: 420_000, env })
    } catch (e) {
      const errText = String(e)
      if (/unknown option/i.test(errText)) {
        status = 'skipped'
        note = 'flag unsupported in this version'
      } else {
        status = 'fail'
      }
    }
    if (status === 'pass') {
      let stop = null
      let url = null
      try {
        ;({ url, stop } = await serveApp(app))
      } catch {
        status = 'fail'
        note = 'server did not start'
      }
      if (url) {
        const out = path.join(here, `result-${key}.json`)
        try {
          const fail = await shAsync(
            `node ${[
              'verify.mjs',
              '--name',
              `${key}/${cell.name} pm=${pm}`,
              '--url',
              url,
              '--out',
              out,
            ]
              .map(a => `"${a}"`)
              .join(' ')}`,
            here,
            240_000
          )
          if (fail) throw fail
        } catch {
          status = 'fail'
          note = 'verification failed'
        }
      }
      if (stop) await stop()
    }
    res.cells.push({ cell: cell.name, status, note })
    if (status === 'fail') overall = false
  }

  res.ok = overall
  results.push(res)
}

// ---------- summary ----------
console.log('\n===== SUMMARY =====')
let allOk = true
for (const r of results) {
  const cells = r.cells.map(c => `${c.cell}:${c.status}${c.note ? ` (${c.note})` : ''}`).join(', ')
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.app} (pm=${r.pm}) — ${cells}`)
  if (!r.ok) allOk = false
}
fs.writeFileSync(path.join(here, 'results.json'), JSON.stringify(results, null, 2))
console.log(
  `\n[run] results written to tests/framework/results.json — overall: ${allOk ? 'PASS' : 'FAIL'}`
)
process.exit(allOk ? 0 : 1)
