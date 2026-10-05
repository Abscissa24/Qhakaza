/* ════════════════════════════════════════════════════════════════════
   BOOT — intro video overlay, re-usable for showcase
   Exposes window.__showBoot() which replays boot and resolves when hidden.
   ════════════════════════════════════════════════════════════════════ */

export function initBoot() {
  const overlay = document.getElementById('boot-overlay');
  const video = document.getElementById('bootVideo');
  const skipBtn = document.getElementById('bootSkip');
  if (!overlay || !video) return;

  let dismissed = false;
  let safetyTimer = null;
  let fadeTimer = null;
  let currentResolve = null;

  function cleanupTimers() {
    clearTimeout(safetyTimer);
    clearTimeout(fadeTimer);
  }

  function dismiss(instant) {
    if (dismissed) return;
    dismissed = true;
    cleanupTimers();
    try { video.pause(); } catch (_) {}
    overlay.classList.add('is-hiding');
    overlay.classList.remove('is-hidden');
    document.documentElement.classList.remove('boot-locked');
    document.body.classList.remove('boot-locked');
    const delay = instant ? 0 : 850;
    fadeTimer = setTimeout(() => {
      overlay.classList.add('is-hidden');
      overlay.classList.remove('is-hiding');
      // keep in DOM for showcase reuse
      overlay.style.display = 'none';
      // Always land on hero — fixes hard-refresh restoring footer scroll
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      if (currentResolve) { const r = currentResolve; currentResolve = null; r(); }
    }, delay);
  }

  function resetAndPlay() {
    dismissed = false;
    cleanupTimers();
    overlay.style.display = '';
    // force reflow so transition restarts
    void overlay.offsetWidth;
    overlay.classList.remove('is-hidden', 'is-hiding');
    document.documentElement.classList.add('boot-locked');
    document.body.classList.add('boot-locked');
    try { video.currentTime = 0; } catch (_) {}
    video.muted = true;
    const tryPlay = () => video.play().catch(() => {});
    tryPlay();
    safetyTimer = setTimeout(() => dismiss(false), 4600);
    // retry on first interaction if autoplay blocked
    document.addEventListener('click', function onFirstClick() {
      if (!dismissed && video.paused) tryPlay();
      document.removeEventListener('click', onFirstClick);
    }, { once: true });
  }

  // Persistent listeners (only once)
  video.addEventListener('ended', () => {
    setTimeout(() => dismiss(false), 280);
  });
  video.addEventListener('error', () => dismiss(true));
  if (skipBtn) skipBtn.addEventListener('click', (e) => { e.stopPropagation(); dismiss(false); });
  overlay.addEventListener('click', () => dismiss(false));
  window.addEventListener('keydown', (e) => {
    if (dismissed) return;
    // only handle when boot is visible
    if (overlay.classList.contains('is-hidden') || overlay.style.display === 'none') return;
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      e.preventDefault();
      dismiss(false);
    }
  });

  // Expose for showcase: replay boot from absolute top and wait until hidden
  window.__showBoot = function () {
    return new Promise((resolve) => {
      // Reduced motion: skip immediately but still ensure top
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        dismiss(true);
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        resolve();
        return;
      }
      // Force to absolute top before boot shows
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      // If already showing, just wait for it; otherwise reset
      if (!dismissed && !overlay.classList.contains('is-hidden') && overlay.style.display !== 'none') {
        currentResolve = resolve;
        return;
      }
      currentResolve = resolve;
      resetAndPlay();
    });
  };

  // Initial boot on page load — always from hero
  try { history.scrollRestoration = 'manual'; } catch (_) {}
  const forceTop = () => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };
  forceTop();
  window.addEventListener('load', forceTop, { once: true });
  setTimeout(forceTop, 50);
  setTimeout(forceTop, 300);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    dismiss(true);
    return;
  }
  dismissed = false;
  forceTop();
  const tryPlayInit = () => video.play().catch(() => {});
  tryPlayInit();
  safetyTimer = setTimeout(() => dismiss(false), 4600);
  document.addEventListener('click', function onFirstClickInit() {
    if (!dismissed && video.paused) tryPlayInit();
    document.removeEventListener('click', onFirstClickInit);
  }, { once: true });
}
