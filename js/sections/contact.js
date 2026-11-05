import { PROFILE, UI } from '../data.js';
import { monstera, plant, icon, stylus } from '../deco.js';
import { L, T, esc, ext, arrow, state } from '../shared.js';

/* The closing moment: an inquiry form that lands in the owner's inbox, beside the direct channels
   and a leather card that the white stylus signs when it scrolls in. */
const TEXT = {
  copy: { ar: 'نسخ البريد', en: 'Copy email' },
  copied: { ar: 'تم النسخ', en: 'Copied' },
  direct: { ar: 'أو تواصل معي مباشرة', en: 'Or reach me directly' },
  name: { ar: 'اسمك', en: 'Your name' },
  reach: { ar: 'إيميلك أو رقم واتساب', en: 'Your email or WhatsApp' },
  reachHint: { ar: 'لأرد عليك من خلاله', en: 'So I can reply to you' },
  need: { ar: 'استفسارك', en: 'Your question' },
  needHint: { ar: 'اكتب ما تريد معرفته', en: 'What would you like to know?' },
  send: { ar: 'إرسال الاستفسار', en: 'Send question' },
  sending: { ar: 'جارٍ الإرسال…', en: 'Sending…' },
  sentTitle: { ar: 'وصلني استفسارك، شكرًا لك', en: 'Got your question, thank you' },
  sentBody: { ar: 'سأراجعه وأرد عليك على وسيلة التواصل التي كتبتها.', en: 'I\'ll review it and reply using the contact you gave.' },
  again: { ar: 'إرسال استفسار آخر', en: 'Send another question' },
  failed: { ar: 'تعذر الإرسال، لكن رسالتك لم تضع. أرسلها بضغطة واحدة:', en: 'It didn\'t send, but your message is safe. Send it in one tap:' },
  noName: { ar: 'اكتب اسمك', en: 'Please enter your name' },
  noReach: { ar: 'اكتب إيميلًا أو رقم واتساب صحيحًا', en: 'Please enter a valid email or WhatsApp number' },
  noNeed: { ar: 'اكتب استفسارك', en: 'Please write your question' },
};
/* The site is static, so this relay turns the question into an email to the owner. */
const ENDPOINT = `https://formsubmit.co/ajax/${PROFILE.email}`;
const PIN = '<span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 21s-6.5-6.1-6.5-11a6.5 6.5 0 0 1 13 0c0 4.9-6.5 11-6.5 11z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="10" r="2.2" fill="currentColor"/></svg></span>';
const NOTE = '<span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M6 4h9l3 3v13H6zM9 11h6M9 15h6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></span>';
const UP = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>';

/* Word-level only: Arabic letters must stay joined. */
const words = (field) => L(field).split(' ').map((w, i) => `<span class="ct-w" style="--i:${i}">${esc(w)}</span>`).join(' ');

/* Survives the re-render a language switch causes, so a half-written question isn't lost. */
let draft = {};

/* Arabic-Indic digits are common on Arabic phones. */
const digits = (v) => v.replace(/[\u0660-\u0669]/g, (d) => d.charCodeAt(0) - 0x660).replace(/[\u06F0-\u06F9]/g, (d) => d.charCodeAt(0) - 0x6F0);
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isPhone = (v) => /^\+?[\d\s()-]+$/.test(v) && (v.match(/\d/g) || []).length >= 8 && (v.match(/\d/g) || []).length <= 15;

/* wa.me needs an international number. An Egyptian local 01… is safe to convert; other local formats aren't guessable. */
const waLink = (v) => {
  const n = v.replace(/\D/g, '');
  if (/^01\d{9}$/.test(n)) return `https://wa.me/2${n}`;
  if (v.startsWith('+')) return `https://wa.me/${n}`;
  return n.startsWith('00') ? `https://wa.me/${n.slice(2)}` : '';
};

const field = (id, label, control) => `<div class="cf-field">
  <label for="cf-${id}">${T(label)}</label>${control}
  <p class="cf-err" id="cf-${id}-err"></p>
</div>`;

const formHTML = () => `<form class="ct-form reveal" novalidate>
  <div class="cf-row">
    ${field('name', TEXT.name, '<input id="cf-name" name="name" dir="auto" autocomplete="name" maxlength="120" required aria-describedby="cf-name-err">')}
    ${field('reach', TEXT.reach, `<input id="cf-reach" name="reach" dir="auto" autocomplete="email" inputmode="email" maxlength="160" placeholder="${T(TEXT.reachHint)}" required aria-describedby="cf-reach-err">`)}
  </div>
  ${field('need', TEXT.need, `<textarea id="cf-need" name="need" dir="auto" rows="5" maxlength="4000" placeholder="${T(TEXT.needHint)}" required aria-describedby="cf-need-err"></textarea>`)}
  <div class="cf-trap" aria-hidden="true"><label>Leave empty<input name="_honey" tabindex="-1" autocomplete="off"></label></div>
  <div class="cf-end">
    <button type="submit" class="cf-send"><span class="cf-send-t">${T(TEXT.send)}</span><span class="ct-go">${arrow}</span></button>
    <p class="cf-fail" role="alert" hidden></p>
  </div>
</form>
<div class="ct-sent" role="status" tabindex="-1" hidden>
  <span class="ct-sent-ic" aria-hidden="true"><svg viewBox="0 0 24 24" width="26" height="26"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
  <h3>${T(TEXT.sentTitle)}</h3>
  <p>${T(TEXT.sentBody)}</p>
  <button type="button" class="ct-copy cf-again">${T(TEXT.again)}</button>
</div>`;

export function render() {
  return `<section class="contact" id="contact">
    <div class="ct-light" aria-hidden="true"></div>
    <div class="o o-c1 reveal" aria-hidden="true"><div class="ct-leaf">${monstera()}</div></div>
    <div class="o o-c2 reveal" aria-hidden="true"><div class="ct-leaf">${plant()}</div></div>
    <div class="ct-grid">
      <div class="ct-say">
        <p class="pill reveal">${T(UI.contactKicker)}</p>
        <h2 class="reveal">${words(UI.contactTitle)}</h2>
        <p class="ct-body reveal">${T(UI.contactBody)}</p>
        ${formHTML()}
      </div>
      <div class="ct-side">
        <p class="ct-direct reveal">${T(TEXT.direct)}</p>
        <div class="ct-act reveal">
          <a class="ct-mail" href="mailto:${PROFILE.email}"><span dir="ltr">${PROFILE.email}</span><span class="ct-go">${arrow}</span></a>
          ${navigator.clipboard ? `<button type="button" class="ct-copy" data-email="${PROFILE.email}"><span aria-live="polite">${T(TEXT.copy)}</span></button>` : ''}
          <a class="ct-wa" href="${PROFILE.whatsapp}" ${ext} aria-label="WhatsApp ${PROFILE.whatsappLabel}">${icon('whatsapp')}<span class="ct-wa-name" lang="en">WhatsApp</span><span class="ct-wa-num" dir="ltr">${PROFILE.whatsappLabel}</span></a>
        </div>
      <div class="ct-card reveal">
        <div class="ct-sign" dir="ltr" lang="en">
          <p class="sig"><span class="ct-ink">Alaa badr</span></p>
          <svg class="ct-flourish" viewBox="0 0 400 44" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M396 6C330 30 190 42 96 34 54 30 22 22 6 12"/></svg>
          <span class="ct-pen" aria-hidden="true"><span class="ct-pen-in">${stylus()}</span></span>
        </div>
        <p class="ct-who"><strong>${T(PROFILE.name)}</strong><span>${T(PROFILE.role)}</span></p>
        <ul class="ct-rows">
          <li><a href="${PROFILE.github}" ${ext}>${icon('github')}<span dir="ltr">github.com/Alaabadr44</span>${arrow}</a></li>
          <li><a href="${PROFILE.linkedin}" ${ext}>${icon('linkedin')}<span dir="ltr">LinkedIn</span>${arrow}</a></li>
          <li><a href="${PROFILE.personalNote}" ${ext}>${NOTE}<span>${T(UI.personalNote)}</span>${arrow}</a></li>
          <li>${PIN}<span>${T(PROFILE.city)}</span></li>
        </ul>
      </div>
      </div>
    </div>
    <footer><span>© ${new Date().getFullYear()} ${T(PROFILE.name)}. ${T(UI.rights)}</span><a href="#home">${T(UI.top)} ${UP}</a></footer>
  </section>`;
}

function initForm(section, signal) {
  const form = section.querySelector('.ct-form');
  const sent = section.querySelector('.ct-sent');
  const btn = form.querySelector('.cf-send');
  const fail = form.querySelector('.cf-fail');
  const label = btn.querySelector('.cf-send-t');
  const el = form.elements;

  ['name', 'reach', 'need'].forEach((k) => { if (draft[k]) el[k].value = draft[k]; });

  const setErr = (input, msg) => {
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    document.getElementById(`${input.id}-err`).textContent = msg;
  };
  const check = (k) => {
    const v = digits(el[k].value.trim());
    if (k === 'name') return v ? '' : L(TEXT.noName);
    if (k === 'reach') return isEmail(v) || isPhone(v) ? '' : L(TEXT.noReach);
    return v ? '' : L(TEXT.noNeed);
  };

  form.addEventListener('input', (e) => {
    const { name } = e.target;
    if (name === '_honey') return;
    draft[name] = e.target.value;
    if (e.target.getAttribute('aria-invalid') === 'true') setErr(e.target, check(name));
    fail.hidden = true;
  }, { signal });

  /* A failed send must never cost the visitor what they wrote: hand it to WhatsApp or email, filled in. */
  const fallback = (text) => {
    const body = encodeURIComponent(text);
    fail.innerHTML = `<span>${L(TEXT.failed)}</span>
      <span class="cf-ways"><a href="${PROFILE.whatsapp}?text=${body}" ${ext} lang="en">WhatsApp</a>
      <a href="mailto:${PROFILE.email}?subject=${encodeURIComponent('Portfolio inquiry')}&body=${body}">Email</a></span>`;
    fail.hidden = false;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (btn.disabled) return;
    const keys = ['name', 'reach', 'need'];
    const errs = keys.map((k) => { const m = check(k); setErr(el[k], m); return m; });
    const bad = errs.findIndex(Boolean);
    if (bad >= 0) { el[keys[bad]].focus(); return; }

    const name = el.name.value.trim();
    const reach = digits(el.reach.value.trim());
    const need = el.need.value.trim();
    const done = () => {
      draft = {};
      form.reset();
      form.hidden = true;
      sent.hidden = false;
      sent.focus({ preventScroll: true });
    };
    if (el._honey.value) { done(); return; } /* A bot filled the hidden field: look fine, send nothing. */

    const payload = {
      _subject: `Portfolio inquiry from ${name}`,
      _template: 'table',
      _captcha: 'false',
      Name: name,
      ...(isEmail(reach) ? { email: reach, _replyto: reach } : { WhatsApp: reach, ...(waLink(reach) && { 'WhatsApp link': waLink(reach) }) }),
      Question: need,
      Language: state.lang,
    };

    btn.disabled = true;
    label.textContent = L(TEXT.sending);
    fail.hidden = true;
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.any ? AbortSignal.any([signal, AbortSignal.timeout(20000)]) : signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || String(data.success) !== 'true') throw new Error(data.message || `HTTP ${res.status}`);
      done();
    } catch {
      if (signal.aborted) return;
      fallback(`${name}\n${reach}\n\n${need}`);
    } finally {
      btn.disabled = false;
      label.textContent = L(TEXT.send);
    }
  }, { signal });

  sent.querySelector('.cf-again').addEventListener('click', () => {
    sent.hidden = true;
    form.hidden = false;
    el.name.focus();
  }, { signal });
}

export function init() {
  const section = document.getElementById('contact');
  const card = section?.querySelector('.ct-card');
  if (!section) return undefined;
  const ac = new AbortController();
  let timer = 0;

  section.querySelector('.ct-act .ct-copy')?.addEventListener('click', async (e) => {
    const label = e.currentTarget.firstElementChild;
    try { await navigator.clipboard.writeText(e.currentTarget.dataset.email); } catch { return; }
    label.textContent = L(TEXT.copied);
    label.parentElement.classList.add('done');
    clearTimeout(timer);
    timer = setTimeout(() => {
      label.textContent = L(TEXT.copy);
      label.parentElement.classList.remove('done');
    }, 1800);
  }, { signal: ac.signal });

  initForm(section, ac.signal);

  /* Light catching the leather under the pointer. CSS variables only, no loop. */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    }, { passive: true, signal: ac.signal });
  }

  return () => { ac.abort(); clearTimeout(timer); };
}
