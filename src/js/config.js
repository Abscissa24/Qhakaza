/* ════════════════════════════════════════════════════════════════════
   CONFIG — PayFast + site constants
   ════════════════════════════════════════════════════════════════════ */

export const STATE_URL =
  'https://gist.githubusercontent.com/Abscissa24/c3219daaaf66044523625a6a304ba802/raw/QhakazaStates.json';

export const PF_SANDBOX = true;

export const PF_MERCHANT_ID = PF_SANDBOX ? '10000100' : 'YOUR_LIVE_MERCHANT_ID';
export const PF_MERCHANT_KEY = PF_SANDBOX ? '46f0cd694581a' : 'YOUR_LIVE_MERCHANT_KEY';
export const PF_PASSPHRASE = PF_SANDBOX ? '' : 'YOUR_LIVE_PASSPHRASE';

export const PF_BASE_URL = PF_SANDBOX
  ? 'https://sandbox.payfast.co.za/eng/process'
  : 'https://www.payfast.co.za/eng/process';

export const SITE_BASE = 'https://abscissa24.github.io/Qhakaza/';
export const PF_RETURN_URL = SITE_BASE + '?payment=success';
export const PF_CANCEL_URL = SITE_BASE + '?payment=cancel';
export const PF_NOTIFY_URL = SITE_BASE + '?payment=notify';
