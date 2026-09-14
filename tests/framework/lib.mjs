/** Shared helpers for the framework test runner (bkoi-gl). See README.md. */
import { execSync, spawn } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const here = path.dirname(fileURLToPath(import.meta.url))
export const repoRoot = path.resolve(here, '../..')

export const sh = (cmd, cwd, timeoutMs = 600_000, env = process.env) =>
  execSync(cmd, { cwd, stdio: 'inherit', timeout: timeoutMs, env })

// Async variant: MUST be used while any in-process server (serveStatic) is
// serving — execSync blocks the event loop and the server goes dead for the
// whole child lifetime.
export const shAsync = (cmd, cwd, timeoutMs = 600_000, env = process.env) =>
  new Promise(resolve => {
    const child = spawn(cmd, { cwd, stdio: 'inherit', timeout: timeoutMs, env, shell: true })
    const t = setTimeout(() => child.kill('SIGKILL'), timeoutMs)
    child.on('exit', (code, signal) => {
      clearTimeout(t)
      if (code === 0) return resolve()
      resolve(new Error(`command failed: ${cmd} (exit ${code}, signal ${signal})`))
    })
    child.on('error', e => {
      clearTimeout(t)
      resolve(e)
    })
  })

export function loadEnvKey() {
  const envFile = path.join(repoRoot, '.env')
  if (fs.existsSync(envFile)) {
    for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+)\s*$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
  const key = process.env.BARIKOI_API_KEY || process.env.API_KEY
  if (!key) {
    console.error('[fw] missing BARIKOI_API_KEY (or API_KEY) in repo .env')
    process.exit(2)
  }
  return key
}

export function ensureTarball() {
  sh('npm run build', repoRoot, 300_000)
  const version = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'))).version
  const tarballName = `bkoi-gl-${version}.tgz`
  fs.rmSync(path.join(here, tarballName), { force: true })
  sh(`npm pack --pack-destination "${here}"`, repoRoot, 120_000)
  const tarball = path.join(here, tarballName)
  if (!fs.existsSync(tarball)) throw new Error(`tarball missing: ${tarball}`)
  return tarball
}

/** Normalize stale ABSOLUTE file: refs to the tarball (folder moves break them). */
export function fixTarballDep(cwd, tarballName) {
  const pkgPath = path.join(cwd, 'package.json')
  if (!fs.existsSync(pkgPath)) return
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  let changed = false
  for (const section of ['dependencies', 'devDependencies', 'peerDependencies']) {
    const deps = pkg[section]
    if (!deps) continue
    for (const [name, spec] of Object.entries(deps)) {
      if (
        name === 'bkoi-gl' &&
        typeof spec === 'string' &&
        spec.startsWith('file:') &&
        !spec.endsWith(tarballName)
      ) {
        deps[name] = `file:../${tarballName}`
        changed = true
      }
    }
  }
  if (changed) {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
    console.log(`[fw] normalized stale tarball dep in ${path.basename(cwd)}`)
  }
}

export function installPm(cwd, pm) {
  if (pm === 'npm') fs.rmSync(path.join(cwd, 'package-lock.json'), { force: true })
  const pnpmMarker = path.join(cwd, 'node_modules', '.modules.yaml')
  if (fs.existsSync(pnpmMarker) && pm !== 'pnpm') {
    console.log('[fw] foreign node_modules (pnpm layout) — resetting for ' + pm)
    fs.rmSync(path.join(cwd, 'node_modules'), { recursive: true, force: true })
  }
  if (pm === 'pnpm') {
    const ws = path.join(cwd, 'pnpm-workspace.yaml')
    const major = Number(execSync('pnpm --version', { encoding: 'utf8' }).split('.')[0])
    const body =
      major >= 11
        ? 'allowBuilds:\n  esbuild: true\n  core-js: true\n  core-js-pure: true\n'
        : 'onlyBuiltDependencies:\n  - esbuild\n  - core-js\n  - core-js-pure\n'
    fs.writeFileSync(ws, body)
  }
  const base = {
    npm: 'npm install --no-audit --no-fund',
    pnpm: 'pnpm install',
    yarn: 'yarn install',
    bun: 'bun install',
  }[pm]
  sh(base, cwd)
}

export function installTarball(cwd, tarball, pm) {
  const cmd = {
    npm: `npm install --no-audit --no-fund "${tarball}"`,
    pnpm: `pnpm add "${tarball}"`,
    yarn: `yarn add "file:${tarball}"`,
    bun: `bun add "${tarball}"`,
  }[pm]
  try {
    sh(cmd, cwd)
  } catch {
    console.log('[fw] minimal install failed — resetting node_modules for a clean install...')
    fs.rmSync(path.join(cwd, 'node_modules'), { recursive: true, force: true })
    fs.rmSync(path.join(cwd, 'package-lock.json'), { force: true })
    installPm(cwd, pm)
    sh(cmd, cwd)
  }
}

export function killPortUsers(port) {
  try {
    execSync(`fuser -k ${port}/tcp`, { stdio: 'ignore', timeout: 10_000 })
  } catch {
    /* nothing on port */
  }
  return new Promise(resolve => {
    const t0 = Date.now()
    const tick = () => {
      let free = false
      try {
        execSync(`fuser ${port}/tcp`, { stdio: 'ignore', timeout: 10_000 })
      } catch {
        free = true
      }
      if (free || Date.now() - t0 > 10_000) resolve()
      else setTimeout(tick, 300)
    }
    tick()
  })
}

export async function waitUp(url, timeoutMs = 45_000) {
  const t0 = Date.now()
  while (Date.now() - t0 < timeoutMs) {
    try {
      const res = await fetch(url)
      if (res.status < 500) return true
    } catch {
      /* not up yet */
    }
    await new Promise(r => setTimeout(r, 500))
  }
  return false
}

/**
 * Framework matrix. Each app is a minimal consumer of the packed tarball.
 * Apps read the key through their own standard env mechanism; Angular has no
 * build-time env, so the runner generates src/env.generated.ts via `prepare`.
 */
export const APPS = {
  'react-vite': {
    dir: 'react-vite-app',
    label: 'React 19 + Vite 7',
    envPrefix: 'VITE_',
    buildCells: [{ name: 'vite build', cmd: 'npx vite build' }],
    serve: { type: 'static', dir: 'dist' },
  },
  'vue-vite': {
    dir: 'vue-vite-app',
    label: 'Vue 3 + Vite 7',
    envPrefix: 'VITE_',
    buildCells: [{ name: 'vite build', cmd: 'npx vite build' }],
    serve: { type: 'static', dir: 'dist' },
  },
  'svelte-vite': {
    dir: 'svelte-vite-app',
    label: 'Svelte 5 + Vite 7',
    envPrefix: 'VITE_',
    buildCells: [{ name: 'vite build', cmd: 'npx vite build' }],
    serve: { type: 'static', dir: 'dist' },
  },
  nuxt: {
    dir: 'nuxt-app',
    label: 'Nuxt 3 (SPA build)',
    envPrefix: 'NUXT_PUBLIC_',
    buildCells: [{ name: 'nuxi generate', cmd: 'npx nuxi generate' }],
    serve: { type: 'static', dir: '.output/public' },
  },
  sveltekit: {
    dir: 'sveltekit-app',
    label: 'SvelteKit 2 (adapter-static)',
    envPrefix: 'PUBLIC_',
    buildCells: [{ name: 'vite build', cmd: 'npx vite build' }],
    serve: { type: 'static', dir: 'build' },
  },
  angular: {
    dir: 'angular-app',
    label: 'Angular 21 (application builder)',
    buildCells: [{ name: 'ng build', cmd: 'npx ng build' }],
    serve: { type: 'static', dir: 'dist/angular-app/browser' },
    // Angular has no build-time env prefix: generate the key module the app
    // imports (same idea as Angular's environments file, runner-owned).
    prepare: (cwd, apiKey) =>
      fs.writeFileSync(
        path.join(cwd, 'src/env.generated.ts'),
        `export const BARIKOI_API_KEY = ${JSON.stringify(apiKey)}\n`
      ),
  },
}

export const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
}

export function serveStatic(root, port) {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname)
    let file = path.join(root, urlPath === '/' ? 'index.html' : urlPath)
    if (!file.startsWith(root)) {
      res.writeHead(403)
      return res.end()
    }
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      // SPA fallback only for extensionless navigation paths — never mask a
      // missing asset (.mjs/.js/.css/.map) as a 200 index.html, or the
      // worker/asset 404 this suite exists to catch would look healthy.
      if (path.extname(urlPath)) {
        res.writeHead(404)
        return res.end('not found')
      }
      file = path.join(root, 'index.html')
    }
    if (!fs.existsSync(file)) {
      res.writeHead(404)
      return res.end('not found')
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' })
    fs.createReadStream(file).pipe(res)
  })
  return new Promise(resolve => server.listen(port, () => resolve(server)))
}

/** Start an app's production server; returns { url, stop }. */
export async function serveApp(app) {
  const port = 6180
  await killPortUsers(port)
  const server = await serveStatic(path.join(here, app.dir, app.serve.dir), port)
  return {
    url: `http://localhost:${port}/`,
    stop: async () => new Promise(r => server.close(r)),
  }
}
