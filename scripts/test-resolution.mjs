#!/usr/bin/env node
/**
 * Package-manager resolution test — proves the packed tarball INSTALLS and
 * RESOLVES under every supported package manager (npm, pnpm, yarn, bun),
 * WITHOUT building a framework app or rendering a map.
 *
 * Per PM, in an isolated temp sandbox:
 *   1. minimal package.json
 *   2. install the packed tarball with that PM (bkoi-gl has no peers —
 *      maplibre-gl is fully bundled)
 *   3. run a node smoke that imports 'bkoi-gl' BY NAME (exercises the
 *      exports map through the PM's node_modules layout) and resolves the
 *      './style.css' and './worker' subpaths to real files
 *
 * A PM whose binary is missing locally is loudly SKIPPED (not silently
 * passed) — run the script where that PM is installed.
 *
 * Usage: npm run test:resolution [-- --pm=npm,pnpm,yarn,bun] [--keep]
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(fileURLToPath(import.meta.url), '../..')
const args = process.argv.slice(2)
const getArg = (k, d) => {
  const a = args.find(x => x.startsWith(`--${k}=`))
  return a ? a.split('=').slice(1).join('=') : d
}
const pms = getArg('pm', 'npm,pnpm,yarn,bun').split(',')
const keep = args.includes('--keep')

const run = (cmd, cmdArgs, opts = {}) => execFileSync(cmd, cmdArgs, { encoding: 'utf-8', ...opts })

const expectedVersion = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'))).version

// Install commands per PM: the tarball in one transaction (no peers).
const installCmd = (pm, tarball) =>
  ({
    npm: `npm install --no-audit --no-fund "${tarball}"`,
    pnpm: `pnpm add "${tarball}"`,
    yarn: `yarn add "file:${tarball}"`,
    bun: `bun add "${tarball}"`,
  })[pm]

// Runs INSIDE the sandbox. Import by name (exports map via the PM's layout),
// resolve subpaths via createRequire (css/mjs are not node-importable).
const SMOKE = `import { createRequire } from 'node:module'
import * as lib from 'bkoi-gl'

const required = ['Map', 'BkoiGlMap', 'Minimap', 'bkoiConfig', 'DEFAULT_CENTER', 'isBarikoiStyle']
const missing = required.filter((k) => !(k in lib))
if (missing.length) { console.error('missing exports: ' + missing.join(', ')); process.exit(1) }
if (lib.Map !== lib.BkoiGlMap) { console.error('Map is not an alias of BkoiGlMap'); process.exit(1) }
if (typeof lib.Map !== 'function') { console.error('Map is not a class'); process.exit(1) }

const require = createRequire(import.meta.url)
for (const sub of ['bkoi-gl/style.css', 'bkoi-gl/worker']) {
  const file = require.resolve(sub)
  if (!require('node:fs').statSync(file).size) { console.error('empty subpath: ' + sub); process.exit(1) }
  console.log(sub, '->', file)
}
console.log('exports + subpaths OK')
`

console.log('[test:resolution] building dist + packing tarball...')
run('npm', ['run', 'build'], { cwd: repoRoot, stdio: 'inherit' })
const tarballName = JSON.parse(run('npm', ['pack', '--json'], { cwd: repoRoot }))[0].filename
const tarball = path.join(repoRoot, tarballName)

const sandboxes = []
let failed = 0
let skipped = 0
for (const pm of pms) {
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), `bkoi-res-${pm}-`))
  sandboxes.push(sandbox)
  try {
    if (!run('bash', ['-c', `command -v ${pm} || true`]).trim()) {
      skipped++
      console.warn(
        `\nSKIP ${pm} — binary not installed; run test:resolution on a machine with ${pm}`
      )
      continue
    }
    fs.writeFileSync(
      path.join(sandbox, 'package.json'),
      JSON.stringify({ name: `bkoi-res-${pm}`, private: true, type: 'module' }, null, 2) + '\n'
    )
    console.log(`\n[test:resolution] ${pm}: installing tarball...`)
    run('bash', ['-c', installCmd(pm, tarball)], {
      cwd: sandbox,
      stdio: 'inherit',
      timeout: 300_000,
    })

    fs.writeFileSync(path.join(sandbox, 'smoke.mjs'), SMOKE)
    console.log(`[test:resolution] ${pm}: resolving...`)
    console.log(run('node', ['smoke.mjs'], { cwd: sandbox }).trim())
    const installed = JSON.parse(
      fs.readFileSync(path.join(sandbox, 'node_modules', 'bkoi-gl', 'package.json'), 'utf8')
    ).version
    if (installed !== expectedVersion)
      throw new Error(`installed ${installed}, expected ${expectedVersion}`)
    console.log(`PASS ${pm} — install + exports map + subpaths + version`)
  } catch (e) {
    failed++
    console.error(`FAIL ${pm}: ${String(e.message || e).split('\n')[0]}`)
  }
}

if (!keep) {
  for (const s of sandboxes) fs.rmSync(s, { recursive: true, force: true })
  fs.rmSync(tarball, { force: true })
} else {
  console.log('sandboxes kept:', sandboxes.join(' '), 'tarball:', tarball)
}

if (failed) {
  console.error(`\n[test:resolution] ${failed} package manager(s) FAILED`)
  process.exit(1)
}
if (skipped) {
  console.warn(`\n[test:resolution] ${skipped} package manager(s) SKIPPED (not installed locally)`)
}
console.log(
  `\n[test:resolution] ${pms.length - skipped - failed}/${pms.length} package manager(s) PASS`
)
