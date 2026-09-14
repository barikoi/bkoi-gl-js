// E2E host app — Vite serves this via playwright.config.ts webServer.
// One page, one registry: /?case=<name> mounts the matching feature case.
import { CASES } from './cases.js'
import './app.css'

window.__LOG__ = []
window.__MAP__ = null
window.__pageErrors__ = []
window.__log = entry => window.__LOG__.push(entry)
window.addEventListener('error', e => window.__pageErrors__.push(String(e.message)))
window.addEventListener('unhandledrejection', e => window.__pageErrors__.push(String(e.reason)))

const params = new URLSearchParams(location.search)
const caseName = params.get('case')
const root = document.getElementById('root')

if (!caseName) {
  // Browsable index — `npm run e2e:serve` and click through every case by hand.
  root.innerHTML = `<div class="case-index"><h1>bkoi-gl e2e cases</h1><ul>${Object.keys(CASES)
    .sort()
    .map(name => `<li><a href="/?case=${name}">${name}</a></li>`)
    .join('')}</ul></div>`
} else if (!CASES[caseName]) {
  root.textContent = `Unknown case: ${caseName}`
} else {
  CASES[caseName](root)
}
