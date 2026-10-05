/* ════════════════════════════════════════════════════════════════════
   SITE STATE — remote kill-switches (disabled / maintenance / payfast)
   + particle visibility + showcase speed. Fetched from Gist.
   ════════════════════════════════════════════════════════════════════ */

import { STATE_URL } from './config.js';

export const siteState = {
  current: {
    disabled: false,
    maintenance: false,
    payfast: true,
    defaultParticlesEnabled: false,
    maintenanceParticlesEnabled: false,
    defaultParticleCount: 120,
    maintenanceParticleCount: 150,
    defaultParticleSizeMin: 2,
    defaultParticleSizeMax: 5,
    maintenanceParticleSizeMin: 1.5,
    maintenanceParticleSizeMax: 4,
    defaultParticleSpeed: 0.6,
    maintenanceParticleSpeed: 1.2,
    connectionDistance: 120,
    showcaseSpeed: 1,
  },
  original: {},
};

export function getState() {
  return siteState.current;
}

export function getOriginalState() {
  return siteState.original;
}

export async function fetchSiteState() {
  try {
    const url = STATE_URL + '?t=' + Date.now();
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    siteState.current = {
      disabled: data.disabled === true,
      maintenance: data.maintenance === true,
      payfast: data.payfast !== false,
      defaultParticlesEnabled: data.defaultParticlesEnabled === true,
      maintenanceParticlesEnabled: data.maintenanceParticlesEnabled === true,
      defaultParticleCount: data.defaultParticleCount || 120,
      maintenanceParticleCount: data.maintenanceParticleCount || 150,
      defaultParticleSizeMin: data.defaultParticleSizeMin || 2,
      defaultParticleSizeMax: data.defaultParticleSizeMax || 5,
      maintenanceParticleSizeMin: data.maintenanceParticleSizeMin || 1.5,
      maintenanceParticleSizeMax: data.maintenanceParticleSizeMax || 4,
      defaultParticleSpeed: data.defaultParticleSpeed || 0.6,
      maintenanceParticleSpeed: data.maintenanceParticleSpeed || 1.2,
      connectionDistance: data.connectionDistance || 120,
      showcaseSpeed: data.showcaseSpeed || 1,
    };
    siteState.original = JSON.parse(JSON.stringify(siteState.current));
    console.log('✅ State loaded from Gist:', siteState.current);
  } catch (err) {
    console.warn('⚠️ Failed to load State from Gist, using defaults:', err.message);
    siteState.current = {
      disabled: false, maintenance: false, payfast: true,
      defaultParticlesEnabled: false, maintenanceParticlesEnabled: false,
      defaultParticleCount: 120, maintenanceParticleCount: 150,
      defaultParticleSizeMin: 2, defaultParticleSizeMax: 5,
      maintenanceParticleSizeMin: 1.5, maintenanceParticleSizeMax: 4,
      defaultParticleSpeed: 0.6, maintenanceParticleSpeed: 1.2,
      connectionDistance: 120, showcaseSpeed: 1,
    };
    siteState.original = JSON.parse(JSON.stringify(siteState.current));
  }

  applyParticleState();
  applyState();
  applyPayfastState();
  applySecureBadge();
}

export function applyParticleState() {
  const state = siteState.current;
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const mode = state.maintenance ? 'maintenance' : 'default';
  const enabled = mode === 'default' ? state.defaultParticlesEnabled : state.maintenanceParticlesEnabled;

  if (window.__setParticleConfig) {
    window.__setParticleConfig({
      defaultCount: state.defaultParticleCount,
      maintenanceCount: state.maintenanceParticleCount,
      defaultSizeMin: state.defaultParticleSizeMin,
      defaultSizeMax: state.defaultParticleSizeMax,
      maintenanceSizeMin: state.maintenanceParticleSizeMin,
      maintenanceSizeMax: state.maintenanceParticleSizeMax,
      defaultSpeed: state.defaultParticleSpeed,
      maintenanceSpeed: state.maintenanceParticleSpeed,
      connectionDistance: state.connectionDistance,
    });
  }

  if (enabled) {
    window.__setParticleMode(mode);
    canvas.style.display = 'block';
    void canvas.offsetWidth;
    canvas.classList.add('visible');
  } else {
    canvas.classList.remove('visible');
    canvas.style.display = 'none';
    if (window.__stopParticleAnimation) window.__stopParticleAnimation();
  }
}

export function applyState() {
  const state = siteState.current;
  const modal = document.getElementById('stateModal');
  if (!modal) return;
  const icon = document.getElementById('stateModalIcon');
  const title = document.getElementById('stateModalTitle');
  const body = document.getElementById('stateModalBody');
  const btn = document.getElementById('stateModalBtn');
  const sub = document.getElementById('stateModalSub');

  if (state.disabled) {
    icon.textContent = '🚫';
    title.textContent = 'Site Disabled';
    body.innerHTML =
      `<strong style="color:var(--cream);">QHAKAZA is currently unavailable.</strong><br>This is a temporary measure. Please contact the administrator for assistance.`;
    btn.textContent = '⛔ Access Restricted';
    btn.disabled = true;
    sub.textContent = 'Emergency shutdown active · Contact support';
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    return;
  }

  if (state.maintenance) {
    icon.textContent = '🔧';
    title.textContent = 'Under Maintenance';
    body.innerHTML =
      `We're currently performing scheduled maintenance to serve you better.<br><span style="color:var(--cream50);font-size:0.85rem;">Thank you for your patience.</span>`;
    btn.textContent = 'OK, Got It';
    btn.disabled = false;
    sub.textContent = 'Scheduled maintenance · Back soon';
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    btn.onclick = function dismissMaintenance() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
      btn.onclick = null;
    };
    return;
  }

  modal.classList.remove('open');
  document.body.style.overflow = '';
}

export function applyPayfastState() {
  const state = siteState.current;
  const payfastSection = document.getElementById('payfastSection');
  const bankSection = document.getElementById('bankDetailsSection');
  const subtitle = document.getElementById('step3Subtitle');
  if (!payfastSection || !bankSection || !subtitle) return;

  if (state.payfast === false) {
    payfastSection.style.display = 'none';
    bankSection.style.display = 'block';
    subtitle.textContent = 'Complete your donation via manual EFT transfer.';
  } else {
    payfastSection.style.display = 'block';
    bankSection.style.display = 'none';
    subtitle.textContent = 'Review your donation and pay securely with PayFast.';
  }
}

export function applySecureBadge() {
  const state = siteState.current;
  const badge = document.getElementById('secureBadgeHero');
  if (!badge) return;
  badge.style.display = state.payfast === false ? 'none' : 'inline-flex';
}
