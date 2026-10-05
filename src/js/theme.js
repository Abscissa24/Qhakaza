/* ════════════════════════════════════════════════════════════════════
   THEME — dark / light toggle with localStorage persistence
   ════════════════════════════════════════════════════════════════════ */

export function initTheme() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;
  const iconSun = toggle.querySelector('.icon-sun');
  const iconMoon = toggle.querySelector('.icon-moon');
  const saved = localStorage.getItem('qhakaza-theme');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (iconSun && iconMoon) {
      if (theme === 'light') {
        iconSun.style.display = 'none';
        iconMoon.style.display = 'block';
      } else {
        iconSun.style.display = 'block';
        iconMoon.style.display = 'none';
      }
    }
  }

  applyTheme(saved || 'dark');

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('qhakaza-theme', next);
    applyTheme(next);
  });
}
