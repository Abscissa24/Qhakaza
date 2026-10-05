/* ════════════════════════════════════════════════════════════════════
   DONATION — multi-step checkout: amount → details → PayFast / EFT
   ════════════════════════════════════════════════════════════════════ */

import CryptoJS from 'crypto-js';
import {
  PF_SANDBOX,
  PF_MERCHANT_ID,
  PF_MERCHANT_KEY,
  PF_PASSPHRASE,
  PF_BASE_URL,
  PF_RETURN_URL,
  PF_CANCEL_URL,
  PF_NOTIFY_URL,
} from './config.js';
import { applyPayfastState } from './site-state.js';
import { showModal, openModal, closeModal } from './modals.js';

export let currentStep = 1;
export let donationData = {
  amount: 0,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  message: '',
};

let panels = [];
let dotsStep = [];
let lines = [];
let previewEl = null;
let amtBtns = [];
let customInput = null;

export function getDonationData() {
  return donationData;
}

/* ─── Payment return (?payment=success|cancel) ─── */
function checkPaymentReturn() {
  const params = new URLSearchParams(window.location.search);
  const status = params.get('payment');

  if (status === 'success') {
    let data = null;
    try {
      const stored = sessionStorage.getItem('qhakaza_donation');
      if (stored) data = JSON.parse(stored);
    } catch (e) { /* ignore */ }
    if (data) donationData = data;
    showPayfastSuccessModal(data || donationData);
    const url = new URL(window.location);
    url.searchParams.delete('payment');
    window.history.replaceState({}, '', url);
  } else if (status === 'cancel') {
    showPayfastCancelModal();
    const url = new URL(window.location);
    url.searchParams.delete('payment');
    window.history.replaceState({}, '', url);
  }
}

/* ─── PayFast result modals ─── */
function showPayfastSuccessModal(data) {
  const fullName = data.firstName ? `${data.firstName} ${data.lastName}` : 'Anonymous';
  const amt = data.amount || 0;
  const email = data.email || '—';

  const modal = document.getElementById('modal');
  document.getElementById('modalIcon').textContent = '🙏';
  document.getElementById('modalTitle').textContent = 'Siyabonga!';
  document.getElementById('modalBody').innerHTML = `
    <p style="margin-bottom:0.8rem;font-size:0.95rem;">
      Your donation has been successfully processed. You're now part of the QHAKAZA family — empowering young athletes across KwaZulu-Natal.
    </p>
    <div class="receipt-box">
      <div class="r-row"><span class="r-label">Donor</span><span class="r-value">${fullName}</span></div>
      <div class="r-row"><span class="r-label">Email</span><span class="r-value">${email}</span></div>
      <div class="r-row"><span class="r-label">Amount</span><span class="r-value gold">R ${amt.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span></div>
      <div class="r-row"><span class="r-label">Reference</span><span class="r-value">DONATION – ${fullName}</span></div>
      <div class="r-row"><span class="r-label">Status</span><span class="r-value" style="color:#4caf50;">✅ Payment Confirmed</span></div>
    </div>
    <p style="font-size:0.8rem;color:var(--cream40);margin-top:0.5rem;">
      📧 A confirmation email with tax receipt details has been sent to <strong style="color:var(--cream);">${email}</strong>
    </p>`;
  const foot = document.getElementById('modalFoot');
  foot.innerHTML = `<button class="btn-done" onclick="closeModalAndReset()">← Back to Home</button>`;
  modal.classList.add('payfast-modal');
  openModal();
  sessionStorage.removeItem('qhakaza_donation');
}

function showPayfastCancelModal() {
  const modal = document.getElementById('modal');
  document.getElementById('modalIcon').textContent = '↩️';
  document.getElementById('modalTitle').textContent = 'Payment Cancelled';
  document.getElementById('modalBody').innerHTML = `
    <p style="font-size:0.95rem;margin-bottom:0.4rem;">You cancelled the payment. No charges have been made.</p>
    <p style="font-size:0.85rem;color:var(--cream50);">You can try again whenever you're ready. Every contribution helps us empower young athletes.</p>`;
  const foot = document.getElementById('modalFoot');
  foot.innerHTML = `
    <button class="btn-ghost-modal" onclick="closeModal()">Close</button>
    <button class="btn-done" onclick="closeModalAndScrollToDonate()">Try Again</button>`;
  modal.classList.add('payfast-modal');
  openModal();
}

export function closeModalAndReset() {
  closeModal();
  resetCheckout();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function closeModalAndScrollToDonate() {
  closeModal();
  document.getElementById('donate').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ─── Amount selection ─── */
function updatePreview(val) {
  if (!previewEl) return;
  const num = val || 0;
  const formatted = 'R ' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  previewEl.textContent = formatted;
  previewEl.classList.remove('pop');
  void previewEl.offsetWidth;
  previewEl.classList.add('pop');
}

/* ─── Step navigation ─── */
export function goToStep(step) {
  if (step < 1 || step > 3) return;
  if (step === 2 && donationData.amount <= 0) {
    showModal({
      icon: '⚠️',
      title: 'Amount Required',
      body: 'Please select or enter a donation amount before continuing.',
    });
    return;
  }
  currentStep = step;
  updateStepUI();
}

function updateStepUI() {
  panels.forEach(p => {
    const s = parseInt(p.dataset.step);
    p.classList.toggle('active', s === currentStep);
    p.style.display = s === currentStep ? 'block' : 'none';
  });
  dotsStep.forEach((dot, idx) => {
    const stepNum = idx + 1;
    dot.classList.remove('active', 'done');
    if (stepNum === currentStep) dot.classList.add('active');
    else if (stepNum < currentStep) dot.classList.add('done');
  });
  lines.forEach(line => {
    const [a] = line.dataset.between.split('-').map(Number);
    line.classList.toggle('done', currentStep > a);
  });
}

export function validateAndProceed() {
  const fname = document.getElementById('fname').value.trim();
  const lname = document.getElementById('lname').value.trim();
  const email = document.getElementById('email').value.trim();

  let valid = true;
  const fnameErr = document.getElementById('fnameError');
  const fnameInput = document.getElementById('fname');
  if (!fname) { fnameInput.classList.add('error'); fnameErr.classList.add('show'); valid = false; }
  else { fnameInput.classList.remove('error'); fnameErr.classList.remove('show'); }

  const lnameErr = document.getElementById('lnameError');
  const lnameInput = document.getElementById('lname');
  if (!lname) { lnameInput.classList.add('error'); lnameErr.classList.add('show'); valid = false; }
  else { lnameInput.classList.remove('error'); lnameErr.classList.remove('show'); }

  const emailErr = document.getElementById('emailError');
  const emailInput = document.getElementById('email');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) { emailInput.classList.add('error'); emailErr.classList.add('show'); valid = false; }
  else { emailInput.classList.remove('error'); emailErr.classList.remove('show'); }

  if (!valid) return;

  donationData.firstName = fname;
  donationData.lastName = lname;
  donationData.email = email;
  donationData.phone = document.getElementById('phone').value.trim();
  donationData.message = document.getElementById('message').value.trim();

  document.getElementById('reviewName').textContent = `${fname} ${lname}`;
  document.getElementById('reviewEmail').textContent = email;
  const amt = donationData.amount;
  document.getElementById('reviewAmount').textContent = 'R ' + amt.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  sessionStorage.setItem('qhakaza_donation', JSON.stringify(donationData));

  applyPayfastState();
  goToStep(3);
}

/* ─── Submit to PayFast ─── */
export function submitPayFast() {
  const btn = document.getElementById('payfastPayBtn');
  btn.disabled = true;
  btn.textContent = '⏳ Redirecting…';

  const overlay = document.getElementById('processingOverlay');
  overlay.classList.add('active');

  const form = document.getElementById('payfastForm');
  form.action = PF_BASE_URL;

  const fullName = `${donationData.firstName} ${donationData.lastName}`;
  const amt = donationData.amount;

  document.getElementById('pfMerchantId').value = PF_MERCHANT_ID;
  document.getElementById('pfMerchantKey').value = PF_MERCHANT_KEY;
  document.getElementById('pfReturnUrl').value = PF_RETURN_URL;
  document.getElementById('pfCancelUrl').value = PF_CANCEL_URL;
  document.getElementById('pfNotifyUrl').value = PF_NOTIFY_URL;
  document.getElementById('pfNameFirst').value = donationData.firstName || 'Anonymous';
  document.getElementById('pfNameLast').value = donationData.lastName || 'Donor';
  document.getElementById('pfEmail').value = donationData.email || 'donor@example.com';
  document.getElementById('pfPaymentId').value = 'QHA' + Date.now() + Math.floor(Math.random() * 1000);
  document.getElementById('pfAmount').value = amt.toFixed(2);
  document.getElementById('pfItemDesc').value =
    `Donation to QHAKAZA Sports Foundation ${donationData.message ? '– ' + donationData.message : ''}`;
  document.getElementById('pfCustomStr1').value = `NPO 227221 | ${fullName}`;

  if (!PF_SANDBOX && PF_PASSPHRASE) {
    const fields = {};
    const formData = new FormData(form);
    for (const [key, value] of formData.entries()) {
      if (value && key !== 'signature') fields[key] = value;
    }
    const sortedKeys = Object.keys(fields).sort();
    let sigString = '';
    for (const key of sortedKeys) {
      sigString += `${key}=${encodeURIComponent(fields[key]).replace(/%20/g, '+')}&`;
    }
    sigString = sigString.slice(0, -1) + `&passphrase=${PF_PASSPHRASE}`;
    document.getElementById('pfSignature').value = CryptoJS.MD5(sigString).toString();
  } else {
    document.getElementById('pfSignature').value = '';
  }

  setTimeout(() => {
    overlay.classList.remove('active');
    form.submit();
    btn.disabled = false;
    btn.textContent = 'Pay with PayFast';
  }, 1200);
}

/* ─── Reset ─── */
export function resetCheckout() {
  currentStep = 1;
  donationData = { amount: 0, firstName: '', lastName: '', email: '', phone: '', message: '' };

  panels.forEach(p => {
    p.classList.remove('active');
    p.style.display = '';
  });
  const first = document.querySelector('.step-panel[data-step="1"]');
  if (first) first.classList.add('active');

  amtBtns.forEach(b => b.classList.remove('active'));
  if (customInput) customInput.value = '';
  updatePreview(0);
  const preview = document.getElementById('previewAmount');
  if (preview) preview.textContent = 'R 0.00';

  for (const id of ['fname', 'lname', 'email', 'phone', 'message']) {
    const el = document.getElementById(id);
    if (el) el.value = '';
  }

  document.querySelectorAll('.field input, .field textarea').forEach(el => el.classList.remove('error'));
  document.querySelectorAll('.error-msg').forEach(el => el.classList.remove('show'));

  updateStepUI();
  sessionStorage.removeItem('qhakaza_donation');
}

/* ─── Init ─── */
export function initDonation() {
  panels = Array.from(document.querySelectorAll('.step-panel'));
  dotsStep = Array.from(document.querySelectorAll('.step-dot'));
  lines = Array.from(document.querySelectorAll('.step-line'));
  previewEl = document.getElementById('previewAmount');
  amtBtns = Array.from(document.querySelectorAll('.amount-btn'));
  customInput = document.getElementById('customAmt');

  checkPaymentReturn();

  amtBtns.forEach(btn => btn.addEventListener('click', function () {
    amtBtns.forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const val = parseFloat(this.dataset.amount);
    if (customInput) customInput.value = '';
    updatePreview(val);
    donationData.amount = val;
  }));

  if (customInput) {
    customInput.addEventListener('input', function () {
      amtBtns.forEach(b => b.classList.remove('active'));
      const val = parseFloat(this.value) || 0;
      updatePreview(val);
      donationData.amount = val;
    });
  }

  updateStepUI();

  const testBanner = document.getElementById('testBanner');
  if (testBanner) testBanner.style.display = PF_SANDBOX ? 'flex' : 'none';
  console.log('🔐 PayFast mode:', PF_SANDBOX ? 'SANDBOX' : 'PRODUCTION');
}
