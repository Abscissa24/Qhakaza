/* ════════════════════════════════════════════════════════════════════
   MAIN — application entry point. Imports styles + all feature modules,
   initialises them in dependency order, and exposes legacy inline-handler
   globals (onclick="...") on window for the HTML.
   ════════════════════════════════════════════════════════════════════ */

import '../styles/main.css';

import { initTheme } from './theme.js';
import { initBoot } from './boot.js';
import { initParticleSystem } from './particles.js';
import { fetchSiteState, getState } from './site-state.js';
import { initNavigation } from './navigation.js';
import {
  initDonation,
  goToStep,
  validateAndProceed,
  submitPayFast,
  closeModalAndReset,
  closeModalAndScrollToDonate,
  resetCheckout,
} from './donation.js';
import {
  showModal,
  openModal,
  closeModal,
  showDeveloperModal,
  closeDevModal,
  openDevOptionsModal,
  closeDevOptionsModal,
  applyDevOptions,
  resetDevOptions,
  startShowcase,
  stopShowcase,
  initSecretShortcuts,
  copyText,
} from './modals.js';

/* ─── Boot order ───
   1. Theme (avoids FOUC) → 2. Particles (canvas ready) →
   3. Boot overlay → 4. Navigation/video → 5. Donation →
   6. Secrets → 7. Remote state (applies overrides last) */

initTheme();
initParticleSystem();
initBoot();
initNavigation();
initDonation();
initSecretShortcuts();
fetchSiteState();

/* ─── Legacy global bridge ───
   The HTML uses inline onclick="goToStep(2)" etc. ES modules are scoped,
   so explicitly publish the handlers on window. */

window.goToStep = goToStep;
window.validateAndProceed = validateAndProceed;
window.submitPayFast = submitPayFast;
window.showModal = showModal;
window.openModal = openModal;
window.closeModal = closeModal;
window.closeModalAndReset = closeModalAndReset;
window.closeModalAndScrollToDonate = closeModalAndScrollToDonate;
window.showDeveloperModal = showDeveloperModal;
window.closeDevModal = closeDevModal;
window.openDevOptionsModal = openDevOptionsModal;
window.closeDevOptionsModal = closeDevOptionsModal;
window.applyDevOptions = applyDevOptions;
window.resetDevOptions = resetDevOptions;
window.startShowcase = startShowcase;
window.stopShowcase = stopShowcase;
window.copyText = copyText;
window.resetCheckout = resetCheckout;

console.log('📋 State:', getState());
console.log('👨‍💻 Developer profile: click "Armiel Pillay" in footer');
console.log('⚙️ Developer options: press ↑↑↓↓←→←→ba (Konami)');
