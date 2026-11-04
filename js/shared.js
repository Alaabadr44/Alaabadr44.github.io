import { PROFILE, UI } from './data.js';
import { icon } from './deco.js';

/* Shared state and helpers used by every section module. */
export const state = { lang: new URLSearchParams(location.search).get('lang') || localStorage.getItem('lang') || 'ar' };
if (state.lang !== 'ar' && state.lang !== 'en') state.lang = 'ar';

export const L = (field) => field[state.lang];
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const T = (field) => esc(L(field));
export const pad = (n) => String(n).padStart(2, '0');
export const ext = 'target="_blank" rel="noopener"';
export const arrow = '<svg class="arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 13 13 3M6 3h7v7" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>';
export const statusChip = (p) => `<span class="chip chip-${p.status}">${T(UI.status[p.status])}</span>`;
export const sectionHead = (kicker, title, note) => `<div class="head reveal"><p class="pill">${T(kicker)}</p><h2>${T(title)}</h2>${note ? `<p class="note">${T(note)}</p>` : ''}</div>`;
export const contactRow = () => `<ul class="contact-row" dir="ltr">
  <li><a href="mailto:${PROFILE.email}">${icon('mail')}<span>${PROFILE.email}</span></a></li>
  <li><a href="${PROFILE.whatsapp}" ${ext} aria-label="WhatsApp ${PROFILE.whatsappLabel}">${icon('whatsapp')}<span>${PROFILE.whatsappLabel}</span></a></li>
  <li><a href="${PROFILE.github}" ${ext}>${icon('github')}<span>github.com/Alaabadr44</span></a></li>
  <li><a href="${PROFILE.linkedin}" ${ext}>${icon('linkedin')}<span>LinkedIn</span></a></li>
</ul>`;

/* Two sections answer the arrow keys with nothing focused. When both are on screen, the one nearer the middle does. */
export const arrowOwner = () => {
  const mid = innerHeight / 2;
  const away = (el) => { const r = el.getBoundingClientRect(); return Math.abs((r.top + r.bottom) / 2 - mid); };
  return [...document.querySelectorAll('#work .fx-list, #apps .vitrine')].sort((a, b) => away(a) - away(b))[0];
};
