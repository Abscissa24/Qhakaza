/* ════════════════════════════════════════════════════════════════════
   NAVIGATION — navbar scroll, reveal-on-scroll, image carousels,
   athletes video (autoplay muted + mute toggle + pause off-screen)
   ════════════════════════════════════════════════════════════════════ */

export function initNavScroll() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  let lastScrollCheck = 0;
  window.addEventListener('scroll', () => {
    const now = performance.now();
    if (now - lastScrollCheck < 16) return;
    lastScrollCheck = now;
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

export function initReveal() {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

export function initCarousels() {
  const carousels = document.querySelectorAll('.image-carousel');
  carousels.forEach(carousel => {
    const images = carousel.querySelectorAll('img');
    if (images.length <= 1) return;
    let current = 0;
    setInterval(() => {
      images[current].classList.remove('active');
      current = (current + 1) % images.length;
      images[current].classList.add('active');
    }, 4000);
  });
}

export function initAthletesVideo() {
  const video = document.getElementById('athletesVideo');
  const btn = document.getElementById('athletesMuteBtn');
  if (!video || !btn) return;

  const iconMuted = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';
  const iconUnmuted = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';

  function updateBtn() {
    const muted = video.muted;
    btn.innerHTML = muted ? iconMuted : iconUnmuted;
    btn.setAttribute('aria-label', muted ? 'Unmute video' : 'Mute video');
    btn.setAttribute('aria-pressed', String(!muted));
  }

  btn.addEventListener('click', () => {
    video.muted = !video.muted;
    if (!video.muted) video.volume = 0.9;
    updateBtn();
  });
  video.addEventListener('volumechange', updateBtn);
  updateBtn();

  const tryPlay = () => video.play().catch(() => {});
  tryPlay();

  // Pause off-screen to save battery/data, resume when visible
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        if (video.paused) tryPlay();
      } else {
        if (!video.paused) video.pause();
      }
    });
  }, { threshold: 0.18 });
  io.observe(video);

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    video.pause();
    video.removeAttribute('autoplay');
  }

  // If autoplay was blocked, retry on first interaction
  document.addEventListener('click', function onFirstClick() {
    if (video.paused) tryPlay();
    document.removeEventListener('click', onFirstClick);
  }, { once: true });
}

export function initNavigation() {
  initNavScroll();
  initReveal();
  initCarousels();
  initAthletesVideo();
}
