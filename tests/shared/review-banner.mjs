/**
 * Shared headed-review overlay — single source of truth for the on-screen UI
 * used by tests/e2e/review and tests/framework/review.
 *
 * - HUD: bottom-center dark pill (#e2e-hud, same look as the e2e fixtures'
 *   "Rendering · <case>" pill) with a draining hold progress bar.
 *
 * Ported from react-bkoi-gl's tests/shared/review-banner.mjs — keep this file
 * and tests/e2e/fixtures/map.ts (the spec-side copy) in sync.
 *
 * The HUD CSS mirrors the `#e2e-hud` block in tests/e2e/app/app.css — keep the
 * two in sync (the fixtures cannot import from here: app.css ships to Vite).
 */

export const headedLaunch = {
  headless: false,
  args: [
    '--start-maximized',
    // Keep rendering while the window is occluded or in the background:
    // maplibre paints via requestAnimationFrame, and Chromium freezes rAF/
    // compositing for backgrounded windows — camera changes and demos would
    // apply invisibly until the window is raised ("nothing fires visually").
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-background-timer-throttling',
  ],
}
export const headedContext = { viewport: null }

/** Exact #e2e-hud styles from tests/e2e/app/app.css (bottom-center pill). */
export const HUD_CSS = `
#e2e-hud{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:2147483000;display:flex;align-items:center;gap:8px;padding:10px 16px;border-radius:999px;background:rgba(15,23,42,0.85);color:#f8fafc;font:500 12px/1 system-ui,sans-serif;letter-spacing:0.02em;white-space:nowrap;box-shadow:0 6px 20px rgba(0,0,0,0.3)}
#e2e-hud .dot{width:8px;height:8px;border-radius:50%;background:#34d399;animation:e2e-pulse 1.2s ease-in-out infinite}
@keyframes e2e-pulse{50%{opacity:0.35}}
#e2e-hud .hold{display:inline-flex;align-items:center;gap:8px}
#e2e-hud .bar{width:90px;height:4px;border-radius:2px;background:rgba(255,255,255,0.2);overflow:hidden}
#e2e-hud .bar i{display:block;height:100%;border-radius:2px;background:#34d399}
`

/** Inject the HUD stylesheet + pill: green pulsing dot + "Rendering · <label>".
 *  Idempotent AND re-labelling: an existing pill is updated rather than left
 *  with the previous case's label (the hold removes the node, so a re-mount
 *  between cases must not early-return on a stale pill). */
export const mountHudScript = ({ label }) => `(function(){
  if (!document.getElementById('e2e-hud-style')) {
    const st = document.createElement('style');
    st.id = 'e2e-hud-style';
    st.textContent = \`${HUD_CSS}\`;
    document.head.appendChild(st);
  }
  let el = document.getElementById('e2e-hud');
  if (!el) {
    el = document.createElement('div');
    el.id = 'e2e-hud';
    el.innerHTML = '<span class="dot"></span><span class="label"></span><span class="hold"></span>';
    document.body.appendChild(el);
  }
  el.querySelector('.label').textContent = 'Rendering · ${label}';
  el.querySelector('.hold').innerHTML = '';
})()`

/** Headed hold: the bar drains over ms, then the pill goes away (fixture parity).
 *
 *  Two deliberate deviations from the reference, both bug-driven:
 *  - the bar gets its width immediately, so the green fill is visible on the
 *    first paint instead of only after the first animation frame;
 *  - the drain is timer-driven, NOT requestAnimationFrame. Chromium freezes rAF
 *    for occluded/backgrounded windows, so an rAF drain never resolves and the
 *    walk wedges on that case until the browser is closed by hand. */
export const hudHoldScript = (ms) => `(function(){
  const el = document.getElementById('e2e-hud');
  const hold = el && el.querySelector('.hold');
  if (!hold) return Promise.resolve();
  hold.innerHTML = '<span class="bar"><i></i></span>';
  const bar = hold.querySelector('.bar i');
  if (bar) bar.style.width = '100%';
  const t0 = performance.now();
  return new Promise((resolve) => {
    const id = setInterval(() => {
      const left = Math.max(0, ${ms} - (performance.now() - t0));
      if (bar) bar.style.width = (left / ${ms}) * 100 + '%';
      if (left <= 0) { clearInterval(id); resolve(); }
    }, 100);
  }).then(() => el && el.remove());
})()`
