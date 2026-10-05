/* ════════════════════════════════════════════════════════════════════
   MODALS — generic modal, developer profile, developer options (Konami),
   showcase mode, copy-to-clipboard helpers
   ════════════════════════════════════════════════════════════════════ */

import { siteState, applyParticleState, applyState, applyPayfastState, applySecureBadge } from './site-state.js';

/* ─── Generic modal ─── */
export function openModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.classList.remove('open', 'payfast-modal');
  document.body.style.overflow = '';
}

export function showModal({ icon, title, body }) {
  const modal = document.getElementById('modal');
  if (!modal) return;
  document.getElementById('modalIcon').textContent = icon || '⚠️';
  document.getElementById('modalTitle').textContent = title || 'Notice';
  document.getElementById('modalBody').innerHTML = `<p>${body}</p>`;
  const foot = document.getElementById('modalFoot');
  foot.innerHTML = '';
  const btn = document.createElement('button');
  btn.textContent = 'Got it';
  btn.className = 'modal-btn-primary';
  btn.onclick = closeModal;
  foot.appendChild(btn);
  openModal();
}

/* ─── Developer profile modal ─── */
export function showDeveloperModal() {
  const modal = document.getElementById('devModal');
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeDevModal() {
  const modal = document.getElementById('devModal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

/* ─── Developer options modal (Konami) ─── */
export let devOptionsState = {};

export function buildDevOptionsUI() {
  const container = document.getElementById('devOptionsBody');
  if (!container) return;
  const s = devOptionsState;

  const boolFields = [
    { key: 'disabled', label: 'Site Disabled', hint: 'Blocks all access' },
    { key: 'maintenance', label: 'Maintenance Mode', hint: 'Shows maintenance notice' },
    { key: 'payfast', label: 'PayFast Enabled', hint: 'If off, shows manual EFT' },
    { key: 'defaultParticlesEnabled', label: 'Particles (Default)', hint: 'Show particles in normal mode' },
    { key: 'maintenanceParticlesEnabled', label: 'Particles (Maintenance)', hint: 'Show particles in maintenance mode' },
  ];

  const numFields = [
    { key: 'defaultParticleCount', label: 'Default Particle Count', min: 0, max: 500, step: 5 },
    { key: 'maintenanceParticleCount', label: 'Maintenance Particle Count', min: 0, max: 500, step: 5 },
    { key: 'defaultParticleSizeMin', label: 'Default Size Min', min: 0.5, max: 10, step: 0.5 },
    { key: 'defaultParticleSizeMax', label: 'Default Size Max', min: 0.5, max: 10, step: 0.5 },
    { key: 'maintenanceParticleSizeMin', label: 'Maintenance Size Min', min: 0.5, max: 10, step: 0.5 },
    { key: 'maintenanceParticleSizeMax', label: 'Maintenance Size Max', min: 0.5, max: 10, step: 0.5 },
    { key: 'defaultParticleSpeed', label: 'Default Speed', min: 0.1, max: 3, step: 0.1 },
    { key: 'maintenanceParticleSpeed', label: 'Maintenance Speed', min: 0.1, max: 3, step: 0.1 },
    { key: 'connectionDistance', label: 'Connection Distance', min: 20, max: 300, step: 5 },
    { key: 'showcaseSpeed', label: 'Showcase Speed', min: 0.25, max: 3, step: 0.25 },
  ];

  let html = '';

  html += `<div class="dev-section"><div class="dev-section-title">🔘 Toggles</div>`;
  boolFields.forEach(f => {
    const val = s[f.key] === true;
    html += `
      <div class="dev-row">
        <span class="dev-label">${f.label}<span class="dev-hint">${f.hint}</span></span>
        <div class="dev-control">
          <label class="dev-toggle">
            <input type="checkbox" id="dev_${f.key}" ${val ? 'checked' : ''} />
            <span class="slider"></span>
          </label>
        </div>
      </div>`;
  });
  html += `</div>`;

  html += `<div class="dev-section"><div class="dev-section-title">🔢 Particle Parameters</div>`;
  numFields.forEach(f => {
    const val = s[f.key] ?? 0;
    const cls = f.key.includes('Count') ? 'medium' : 'small';
    html += `
      <div class="dev-row">
        <span class="dev-label">${f.label}</span>
        <div class="dev-control">
          <input type="number" class="dev-number ${cls}" id="dev_${f.key}"
                 value="${val}" min="${f.min}" max="${f.max}" step="${f.step}" />
        </div>
      </div>`;
  });
  html += `</div>`;

  html += `
    <div style="font-size:0.65rem;color:var(--cream30);text-align:center;padding-top:0.4rem;border-top:1px solid var(--cream06);">
      ⚡ Changes apply immediately after clicking "Apply Changes"
    </div>`;

  container.innerHTML = html;
}

export function readDevOptionsFromUI() {
  const boolKeys = ['disabled', 'maintenance', 'payfast', 'defaultParticlesEnabled', 'maintenanceParticlesEnabled'];
  const numKeys = ['defaultParticleCount', 'maintenanceParticleCount', 'defaultParticleSizeMin',
    'defaultParticleSizeMax', 'maintenanceParticleSizeMin', 'maintenanceParticleSizeMax',
    'defaultParticleSpeed', 'maintenanceParticleSpeed', 'connectionDistance', 'showcaseSpeed'];

  boolKeys.forEach(key => {
    const el = document.getElementById(`dev_${key}`);
    if (el) devOptionsState[key] = el.checked;
  });

  numKeys.forEach(key => {
    const el = document.getElementById(`dev_${key}`);
    if (el) {
      const val = parseFloat(el.value);
      if (!isNaN(val)) devOptionsState[key] = val;
    }
  });
}

export function applyDevOptions() {
  readDevOptionsFromUI();
  Object.assign(siteState.current, devOptionsState);
  applyParticleState();
  applyState();
  applyPayfastState();
  applySecureBadge();
  try {
    sessionStorage.setItem('qhakaza_dev_overrides', JSON.stringify(siteState.current));
  } catch (e) { /* ignore */ }
  console.log('✅ Developer options applied:', siteState.current);
  const btn = document.querySelector('.dev-options-modal .btn-dev-primary');
  if (btn) {
    const orig = btn.textContent;
    btn.textContent = '✓ Applied!';
    btn.style.background = '#4caf50';
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = '';
    }, 1200);
  }
}

export function resetDevOptions() {
  devOptionsState = JSON.parse(JSON.stringify(siteState.original));
  buildDevOptionsUI();
  Object.assign(siteState.current, devOptionsState);
  applyParticleState();
  applyState();
  applyPayfastState();
  applySecureBadge();
  try {
    sessionStorage.removeItem('qhakaza_dev_overrides');
  } catch (e) { /* ignore */ }
  console.log('↺ Reset to original state:', siteState.current);
}

export function openDevOptionsModal() {
  try {
    const stored = sessionStorage.getItem('qhakaza_dev_overrides');
    if (stored) {
      const parsed = JSON.parse(stored);
      Object.assign(siteState.current, parsed);
      devOptionsState = JSON.parse(JSON.stringify(siteState.current));
    } else {
      devOptionsState = JSON.parse(JSON.stringify(siteState.current));
    }
  } catch (e) {
    devOptionsState = JSON.parse(JSON.stringify(siteState.current));
  }
  buildDevOptionsUI();
  const modal = document.getElementById('devOptionsModal');
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeDevOptionsModal() {
  const modal = document.getElementById('devOptionsModal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

/* ─── Showcase mode ─── */
export let showcaseRunning = false;
let showcaseAnimId = null;
let showcaseExitBound = false;

export async function startShowcase() {
  if (showcaseRunning) return;
  closeDevOptionsModal();

  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  document.documentElement.classList.add('boot-locked');
  document.body.classList.add('boot-locked');
  const heroEls = document.querySelectorAll('.hero-tag, .hero-title, .hero-sub, .hero-actions, .hero-indicator, .stats-strip');
  heroEls.forEach(el => el.style.animation = 'none');
  void document.body.offsetHeight;
  heroEls.forEach(el => el.style.animation = '');

  showcaseRunning = true;

  // 1) Countdown 3 → 2 → 1
  const overlay = document.getElementById('showcaseOverlay');
  const countdownEl = document.getElementById('showcaseCountdown');
  overlay.classList.add('active');
  overlay.classList.remove('countdown-done');
  overlay.style.display = '';
  document.body.style.overflow = 'hidden';

  await new Promise(resolve => {
    let count = 3;
    countdownEl.textContent = count;
    const countInterval = setInterval(() => {
      count--;
      if (count > 0) {
        countdownEl.textContent = count;
      } else {
        clearInterval(countInterval);
        overlay.classList.add('countdown-done');
        setTimeout(() => {
          overlay.style.display = 'none';
          resolve();
        }, 800);
      }
    }, 1000);
  });

  // 2) Boot animation (then hero reveals play)
  if (window.__showBoot) {
    await window.__showBoot();
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  } else {
    document.documentElement.classList.remove('boot-locked');
    document.body.classList.remove('boot-locked');
  }

  await new Promise(r => setTimeout(r, 520));

  // 3) Hero now animating, start showcase scroll from top
  document.documentElement.classList.add('showcase-active');
  window.scrollTo(0, 0);
  document.body.style.overflow = '';
  bindShowcaseExit();
  runShowcaseScroll();
}

export function stopShowcase() {
  if (!showcaseRunning) return;
  showcaseRunning = false;
  if (showcaseAnimId) {
    cancelAnimationFrame(showcaseAnimId);
    showcaseAnimId = null;
  }
  document.body.style.overflow = '';
  document.documentElement.classList.remove('showcase-active');

  const progress = document.getElementById('showcaseProgress');
  const hint = document.getElementById('showcaseExitHint');
  if (progress) progress.classList.remove('active');
  if (hint) hint.classList.remove('active');
}

function bindShowcaseExit() {
  if (showcaseExitBound) return;
  showcaseExitBound = true;

  window.addEventListener('keydown', (e) => {
    if (showcaseRunning && e.key === 'Escape') stopShowcase();
  });
  window.addEventListener('pointerdown', () => {
    if (showcaseRunning) stopShowcase();
  });
}

function easeSmoothstep(t) {
  t = Math.min(1, Math.max(0, t));
  return t * t * (3 - 2 * t);
}

function runShowcaseScroll() {
  const speedMultiplier = devOptionsState.showcaseSpeed || 1;
  const baseSpeed = 6 * speedMultiplier;

  const progress = document.getElementById('showcaseProgress');
  const hint = document.getElementById('showcaseExitHint');
  if (progress) progress.classList.add('active');
  if (hint) hint.classList.add('active');

  const sectionEls = Array.from(document.querySelectorAll('#hero, #mission, #founder, #athletes, #sponsors, #donate'));
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const sectionTops = sectionEls
    .map(el => el.getBoundingClientRect().top + window.scrollY)
    .filter(top => top > 0 && top < maxScroll);

  const rampDistance = Math.min(400, maxScroll * 0.15);
  const dwellRadius = 220;

  let pos = window.scrollY;
  let lastTime = null;

  function speedAt(p) {
    let ramp = 1;
    if (p < rampDistance) ramp = Math.min(ramp, easeSmoothstep(p / rampDistance));
    const distFromEnd = maxScroll - p;
    if (distFromEnd < rampDistance) ramp = Math.min(ramp, easeSmoothstep(distFromEnd / rampDistance));

    let dwell = 1;
    for (const top of sectionTops) {
      const d = Math.abs(p - top);
      if (d < dwellRadius) {
        dwell = Math.min(dwell, 0.32 + 0.68 * easeSmoothstep(d / dwellRadius));
      }
    }

    return baseSpeed * Math.max(0.12, ramp) * dwell;
  }

  function reloadHeroAnimations() {
    document.documentElement.classList.add('boot-locked');
    document.body.classList.add('boot-locked');
    const heroEls = document.querySelectorAll('.hero-tag, .hero-title, .hero-sub, .hero-actions, .hero-indicator, .stats-strip');
    heroEls.forEach(el => el.style.animation = 'none');
    void document.body.offsetHeight;
    heroEls.forEach(el => el.style.animation = '');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.classList.remove('boot-locked');
        document.body.classList.remove('boot-locked');
      });
    });
  }

  function fadeBackToHero() {
    const fadeEl = document.getElementById('showcaseFade');
    if (progress) progress.classList.remove('active');
    if (hint) hint.classList.remove('active');
    if (fadeEl) {
      fadeEl.style.display = '';
      void fadeEl.offsetWidth;
      fadeEl.classList.add('active');
    }
    setTimeout(() => {
      if (!showcaseRunning) return;
      pos = 0;
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      if (progress) progress.style.width = '0%';
      reloadHeroAnimations();
      if (fadeEl) fadeEl.classList.remove('active');
      setTimeout(() => {
        if (fadeEl) fadeEl.style.display = 'none';
        if (!showcaseRunning) return;
        stopShowcase();
      }, 820);
    }, 720);
  }

  function step(now) {
    if (!showcaseRunning) return;
    if (lastTime === null) lastTime = now;
    const dt = Math.min(48, now - lastTime);
    lastTime = now;

    if (pos >= maxScroll - 1) {
      fadeBackToHero();
      return;
    }

    pos = Math.min(maxScroll, pos + speedAt(pos) * (dt / 16.6667));
    window.scrollTo(0, pos);

    if (progress) progress.style.width = ((pos / maxScroll) * 100).toFixed(2) + '%';

    showcaseAnimId = requestAnimationFrame(step);
  }

  showcaseAnimId = requestAnimationFrame(step);
}

/* ─── Konami code + "showcase" shortcut ─── */
export function initSecretShortcuts() {
  const KONAMI_SEQ = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let konamiPos = 0;
  const konamiIgnore = { 'Shift': 1, 'Control': 1, 'Alt': 1, 'Meta': 1, 'CapsLock': 1, 'Tab': 1, 'Enter': 1, 'Backspace': 1, 'Delete': 1, 'Insert': 1, 'Home': 1, 'End': 1, 'PageUp': 1, 'PageDown': 1 };

  window.addEventListener('keydown', function (e) {
    const k = e.key;
    if (konamiIgnore[k]) return;
    if (k === KONAMI_SEQ[konamiPos]) {
      konamiPos++;
      if (konamiPos === KONAMI_SEQ.length) {
        konamiPos = 0;
        if (showcaseRunning) {
          stopShowcase();
        } else {
          openDevOptionsModal();
        }
      }
    } else {
      konamiPos = (k === KONAMI_SEQ[0]) ? 1 : 0;
    }
  }, true);

  const SHOWCASE_SEQ = ['s', 'h', 'o', 'w', 'c', 'a', 's', 'e'];
  let showcasePos = 0;
  window.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const ae = document.activeElement;
    if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable)) return;
    const k = e.key.toLowerCase();
    if (k.length !== 1) {
      if (['shift', 'capslock'].includes(k)) return;
      showcasePos = 0;
      return;
    }
    if (k === SHOWCASE_SEQ[showcasePos]) {
      showcasePos++;
      if (showcasePos === SHOWCASE_SEQ.length) {
        showcasePos = 0;
        if (!showcaseRunning) startShowcase();
      }
    } else {
      showcasePos = (k === SHOWCASE_SEQ[0]) ? 1 : 0;
    }
  }, true);
}

/* ─── Copy helpers ─── */
export function copyText(text, btn) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => showCopied(btn))
      .catch(() => fallbackCopy(text, btn));
  } else {
    fallbackCopy(text, btn);
  }
}

function fallbackCopy(text, btn) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showCopied(btn);
  } catch (e) { /* ignore */ }
  document.body.removeChild(ta);
}

function showCopied(btn) {
  if (!btn) return;
  btn.textContent = 'Copied!';
  btn.classList.add('copied');
  setTimeout(() => {
    btn.textContent = 'Copy';
    btn.classList.remove('copied');
  }, 2500);
}
