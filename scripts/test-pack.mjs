#!/usr/bin/env node
/**
 * Pack smoke test — proves the BUILT artifact (not src/) installs and loads.
 *
 * 1. build + `npm pack` the tarball
 * 2. extract it into a temp sandbox
 * 3. symlink `bkoi-gl` -> extracted package (offline; maplibre-gl is fully
 *    bundled, so there are no runtime deps to link)
 * 4. run smoke.mjs inside the sandbox: import 'bkoi-gl' BY NAME so
 *    package.json `exports` resolution is exercised — ESM import AND CJS
 *    require both (the CJS bundle inlines maplibre v6, which is ESM-only
 *    upstream, so require works by construction — this asserts it)
 * 5. contents check: 4 dist formats, style css, worker, README, LICENSE
 *
 * Usage: npm run test:pack
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(fileURLToPath(import.meta.url), '../..')
const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { cwd: repoRoot, encoding: 'utf8', ...opts })

const expectedVersion = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'))).version

let sandbox
let tarballPath
try {
  console.log('[test:pack] building dist...')
  run('npm', ['run', 'build'], { stdio: 'inherit' })

  console.log('[test:pack] npm pack...')
  const tarballName = JSON.parse(run('npm', ['pack', '--json']))[0].filename
  tarballPath = path.join(repoRoot, tarballName)
  console.log(`[test:pack] tarball: ${tarballName}`)

  sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'bkoi-pack-'))
  run('tar', ['-xzf', tarballPath, '-C', sandbox])

  // By-name resolution sandbox (offline)
  const nm = path.join(sandbox, 'node_modules')
  fs.mkdirSync(nm, { recursive: true })
  fs.symlinkSync(path.join(sandbox, 'package'), path.join(nm, 'bkoi-gl'))

  fs.writeFileSync(
    path.join(sandbox, 'smoke.mjs'),
    `import fs from 'node:fs'
import { createRequire } from 'node:module'
import * as lib from 'bkoi-gl'

const required = ['Map', 'BkoiGlMap', 'Minimap', 'bkoiConfig', 'DEFAULT_CENTER', 'isBarikoiStyle']
const missing = required.filter((k) => !(k in lib))
if (missing.length) {
  console.error('missing exports: ' + missing.join(', '))
  process.exit(1)
}
if (lib.Map !== lib.BkoiGlMap) {
  console.error('Map is not an alias of BkoiGlMap')
  process.exit(1)
}
if (typeof lib.Map !== 'function') {
  console.error('Map is not a class')
  process.exit(1)
}

// CJS entry: maplibre-gl v6 is ESM-only upstream, but dist/index.cjs bundles
// it — so plain require() must work. Prove it here.
const require = createRequire(import.meta.url)
const cjs = require('bkoi-gl')
if (typeof cjs.Map !== 'function') {
  console.error('CJS require: Map is not a class')
  process.exit(1)
}
console.log('CJS require OK ->', require.resolve('bkoi-gl'))

// Subpaths resolve to real files
for (const sub of ['bkoi-gl/style.css', 'bkoi-gl/worker']) {
  const file = require.resolve(sub)
  if (!fs.statSync(file).size) {
    console.error('empty subpath: ' + sub)
    process.exit(1)
  }
  console.log(sub, '->', file)
}

// Shipped artifacts: 4 dist formats + css + worker + docs, version parity
for (const file of [
  'package/dist/index.js',
  'package/dist/index.cjs',
  'package/dist/index.d.ts',
  'package/dist/index.d.cts',
  'package/dist/umd/bkoi-gl.js',
  'package/dist/iife/bkoi-gl.js',
  'package/dist/style/bkoi-gl.css',
  'package/dist/bkoi-map-worker.mjs',
  'package/README.md',
  'package/LICENSE',
]) {
  if (!fs.existsSync(new URL(file, import.meta.url))) {
    console.error('missing shipped file: ' + file)
    process.exit(1)
  }
}
const pkg = JSON.parse(fs.readFileSync(new URL('package/package.json', import.meta.url)))
if (pkg.version !== process.env.EXPECTED_VERSION) {
  console.error(\`version mismatch: tarball \${pkg.version} != repo \${process.env.EXPECTED_VERSION}\`)
  process.exit(1)
}
console.log('test:pack smoke OK')
`
  )

  execFileSync('node', ['smoke.mjs'], {
    cwd: sandbox,
    stdio: 'inherit',
    env: { ...process.env, EXPECTED_VERSION: expectedVersion },
  })
} finally {
  if (tarballPath && fs.existsSync(tarballPath)) fs.unlinkSync(tarballPath)
  if (sandbox) fs.rmSync(sandbox, { recursive: true, force: true })
}
