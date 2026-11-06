import { PROFILE, UI } from './data.js';
import { icon } from './deco.js';

/* Shared state and helpers used by every section module. */
/* ?lang wins, then the saved choice, then the browser's languages (any ar* gives Arabic), else English. */
const pick = (v) => (v === 'ar' || v === 'en' ? v : null);
const saved = () => { try { return localStorage.getItem('lang'); } catch { return null; } };
const preferred = (navigator.languages?.length ? navigator.languages : [navigator.language || '']).some((l) => /^ar(\b|-|_)/i.test(l)) ? 'ar' : 'en';
export const state = { lang: pick(new URLSearchParams(location.search).get('lang')) || pick(saved()) || preferred };

export const L = (field) => field[state.lang];
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const T = (field) => esc(L(field));
export const pics = (p) => (p.images || []).map((src) => src.replace('{lang}', state.lang));
export const pad = (n) => String(n).padStart(2, '0');
export const ext = 'target="_blank" rel="noopener"';
export const arrow = '<svg class="arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 13 13 3M6 3h7v7" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>';
export const statusChip = (p) => `<span class="chip chip-${p.status}">${T(UI.status[p.status])}</span>`;
export const sectionHead = (kicker, title, note) => `<div class="head reveal"><p class="pill">${T(kicker)}</p><h2>${T(title)}</h2>${note ? `<p class="note">${T(note)}</p>` : ''}</div>`;
/* Email and WhatsApp stay out of sight until asked for: a button reveals the address or number,
   which is then itself the link that sends. */
let rvCount = 0;
export const reveal = (kind, { href, face, btnClass = '', wrapClass = '' } = {}) => {
  const mail = kind === 'mail';
  const id = `rv-${kind}-${++rvCount}`;
  const to = href || (mail ? `mailto:${PROFILE.email}` : PROFILE.whatsapp);
  const label = T(mail ? UI.reveal.mail : UI.reveal.wa);
  return `<span class="rv ${wrapClass}"><button type="button" class="rv-btn ${btnClass}" aria-expanded="false" aria-controls="${id}" aria-label="${label}" title="${label}">${face || icon(mail ? 'mail' : 'whatsapp')}</button>`
    + `<span class="rv-pop" id="${id}" hidden><a href="${to}" ${mail ? '' : ext}><span class="rv-val" dir="ltr">${esc(mail ? PROFILE.email : PROFILE.whatsappLabel)}</span>`
    + `<small>${T(mail ? UI.reveal.mailGo : UI.reveal.waGo)} ${arrow}</small></a></span></span>`;
};
const rvSet = (btn, open) => {
  const pop = document.getElementById(btn.getAttribute('aria-controls'));
  btn.setAttribute('aria-expanded', String(open));
  if (!pop) return;
  pop.hidden = !open;
  pop.classList.remove('rv-flip-y');
  pop.style.translate = '';
  if (!open) return;
  /* Keep the card on screen: slide it sideways, and open it upward (or scroll to it) when it would fall below. */
  const r = pop.getBoundingClientRect();
  let dx = 0;
  if (r.right > innerWidth - 8) dx = innerWidth - 8 - r.right;
  if (r.left + dx < 8) dx = 8 - r.left;
  if (dx) pop.style.translate = `${Math.round(dx)}px 0`;
  if (r.bottom <= innerHeight - 8) return;
  if (getComputedStyle(pop).position === 'static') pop.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  else pop.classList.add('rv-flip-y');
};
const rvCloseAll = (except) => document.querySelectorAll('.rv-btn[aria-expanded="true"]').forEach((b) => { if (b !== except) rvSet(b, false); });
document.addEventListener('click', (e) => {
  if (e.target.closest('.rv-pop')) return;
  const btn = e.target.closest('.rv-btn');
  rvCloseAll(btn);
  if (btn) rvSet(btn, btn.getAttribute('aria-expanded') !== 'true');
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const open = document.querySelector('.rv-btn[aria-expanded="true"]');
  if (open) { rvSet(open, false); open.focus(); }
});

export const contactRow = () => `<ul class="contact-row" dir="ltr">
  <li>${reveal('mail')}</li>
  <li>${reveal('wa')}</li>
  <li><a href="${PROFILE.github}" ${ext} aria-label="GitHub" title="GitHub">${icon('github')}</a></li>
  <li><a href="${PROFILE.linkedin}" ${ext} aria-label="LinkedIn" title="LinkedIn">${icon('linkedin')}</a></li>
</ul>`;

/* Two sections answer the arrow keys with nothing focused. When both are on screen, the one nearer the middle does. */
export const arrowOwner = () => {
  const mid = innerHeight / 2;
  const away = (el) => { const r = el.getBoundingClientRect(); return Math.abs((r.top + r.bottom) / 2 - mid); };
  return [...document.querySelectorAll('#work .fx-list, #apps .vitrine')].sort((a, b) => away(a) - away(b))[0];
};
