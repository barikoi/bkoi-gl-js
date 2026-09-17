// Generates tests/e2e/report/coverage.md — the README-claim coverage matrix:
// README section → e2e case → covering spec → status.
// Run after `npx playwright test` (reads spec files statically; review status
// comes from the last run via tests/e2e/report/review-*.json when present).
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs'

// spec files (tests/e2e/specs is flat; walk anyway so nested dirs stay covered)
const specFiles = []
;(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) walk(`${dir}/${e.name}`)
    else if (e.name.endsWith('.ts')) specFiles.push(`${dir}/${e.name}`)
  }
})('tests/e2e/specs')

// case-id → spec references (static grep of gotoCase(page, '<id>') and the
// direct page.goto('/?case=<id>') used by specs that deliberately bypass
// gotoCase — error cases have no settled map to gate on).
const caseToSpecs = {}
const addRef = (id, spec) => {
  const list = (caseToSpecs[id] ||= [])
  if (!list.includes(spec)) list.push(spec)
}
for (const s of specFiles) {
  const src = readFileSync(s, 'utf8')
  const name = s.replace('tests/e2e/specs/', '')
  for (const m of src.matchAll(/gotoCase\(page,\s*'([^']+)'/g)) addRef(m[1], name)
  for (const m of src.matchAll(/page\.goto\(`\/\?case=([^`]+)`/g)) addRef(m[1], name)
  for (const m of src.matchAll(/page\.goto\('\/\?case=([^']+)'/g)) addRef(m[1], name)
}

// Cases registered in the host app but not exercised by any spec.
const registry = readFileSync('tests/e2e/app/cases.js', 'utf8')
const allCases = [...registry.matchAll(/^ {2}'([\w/-]+)':/gm)].map(m => m[1])

// Last review evidence (paint/logo/attribution state per case), if any.
let review = null
let lastReport = null
const reports = existsSync('tests/e2e/report')
  ? readdirSync('tests/e2e/report')
      .filter(f => f.startsWith('review-') && f.endsWith('.json'))
      .sort()
  : []
if (reports.length) {
  lastReport = reports.at(-1)
  review = JSON.parse(readFileSync(`tests/e2e/report/${lastReport}`, 'utf8'))
}

// README claim matrix (README section → case ids that prove it).
const matrix = [
  ['Getting Started — installation / quick start', ['map/basic']],
  ['Configuration — Map Options table + defaults', ['config/table-options', 'config/defaults']],
  ['Configuration — Draw Options custom styles', ['config/draw-custom-styles']],
  ['Configuration — Map Events payload contract', ['events/contract']],
  ['Available styles — default and alternate style URLs', ['styles/switch']],
  ['Markers & Popups', ['markers/popup']],
  ['Map Controls — navigation + scale', ['controls/navigation']],
  ['Map Controls — attribution and logo', ['map/basic', 'controls/attribution-off']],
  ['Minimap control — render + two-way sync', ['controls/minimap']],
  ['Camera Methods — every documented method', ['map/basic']],
  ['Custom Layers & Sources — GeoJSON add/query/remove', ['layers/sources']],
  ['Draw tools — toolbar + API ops', ['draw/tools']],
  ['Utility Methods — map state, resize, handlers', ['map/basic', 'layers/sources']],
  ['Utility Methods — style swap preserves attribution', ['styles/switch']],
  ['Examples — every fenced README block executes', ['readme/examples']],
  [
    'Error handling — invalid key / style / container',
    ['errors/bad-key', 'errors/bad-style', 'errors/bad-container'],
  ],
]

const rows = matrix
  .map(([claim, cases]) => {
    const cells = cases
      .map(c => {
        const specsFor = caseToSpecs[c]
        const status = specsFor ? '✅' : '❌ no spec'
        const rev = review?.results?.find(r => r.id === c)
        const revMark = rev ? (rev.ok ? '' : ' ⚠️review') : ''
        return `\`${c}\` ${status}${specsFor ? ` (${specsFor.join(', ')})` : ''}${revMark}`
      })
      .join('<br>')
    return `| ${claim} | ${cells} |`
  })
  .join('\n')

const uncovered = allCases.filter(c => !caseToSpecs[c])
const uncoveredLine = uncovered.length
  ? `Cases with no spec: ${uncovered.map(c => `\`${c}\``).join(', ')}`
  : 'Every registered case is exercised by at least one spec.'

const md = `# E2E Coverage Report — README claims

Generated: ${new Date().toISOString()}
${
  review
    ? `Review evidence: ${lastReport} (dwell ${review.dwell ?? 'n/a'}ms, headed=${review.headed})`
    : 'No headed review run yet — run `npm run e2e:review` for per-case visual evidence.'
}

## README claim matrix

| README claim | e2e case → spec |
|---|---|
${rows}

${uncoveredLine}

## Suites

- \`npm run e2e\` — headless, full spec suite (the release gate)
- \`npx playwright test --headed\` — same specs, visible browser, per-test HUD hold
- \`npm run e2e:review\` — ONE headed browser, one case at a time with dwell, so a
  human can inspect each README claim live; writes
  \`tests/e2e/report/review-*.json\` (canvas paint + logo pixels + attribution
  text + page errors per case) and retains per-case screenshots
`

mkdirSync('tests/e2e/report', { recursive: true })
writeFileSync('tests/e2e/report/coverage.md', md)
console.log('wrote tests/e2e/report/coverage.md')
