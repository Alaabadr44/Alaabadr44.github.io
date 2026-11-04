import { PROFILE, UI } from '../data.js';
import { monstera, plant, icon } from '../deco.js';
import { L, T, esc, ext, arrow } from '../shared.js';

/* The closing moment: a leather card that signs itself when it scrolls in, beside one
   large white pill holding the email address and a green WhatsApp pill right under it,
   so writing is the obvious next step. */
const TEXT = {
  copy: { ar: 'نسخ البريد', en: 'Copy email' },
  copied: { ar: 'تم النسخ', en: 'Copied' },
};
const PIN = '<span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 21s-6.5-6.1-6.5-11a6.5 6.5 0 0 1 13 0c0 4.9-6.5 11-6.5 11z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="10" r="2.2" fill="currentColor"/></svg></span>';
const NOTE = '<span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M6 4h9l3 3v13H6zM9 11h6M9 15h6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></span>';
const UP = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>';

/* Word-level only: Arabic letters must stay joined. */
const words = (field) => L(field).split(' ').map((w, i) => `<span class="ct-w" style="--i:${i}">${esc(w)}</span>`).join(' ');

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
        <div class="ct-act reveal">
          <a class="ct-mail" href="mailto:${PROFILE.email}"><span dir="ltr">${PROFILE.email}</span><span class="ct-go">${arrow}</span></a>
          ${navigator.clipboard ? `<button type="button" class="ct-copy" data-email="${PROFILE.email}"><span aria-live="polite">${T(TEXT.copy)}</span></button>` : ''}
          <a class="ct-wa" href="${PROFILE.whatsapp}" ${ext} aria-label="WhatsApp ${PROFILE.whatsappLabel}">${icon('whatsapp')}<span class="ct-wa-name" lang="en">WhatsApp</span><span class="ct-wa-num" dir="ltr">${PROFILE.whatsappLabel}</span></a>
        </div>
      </div>
      <div class="ct-card reveal">
        <div class="ct-sign" dir="ltr" lang="en">
          <p class="sig"><span class="ct-ink">Alaa badr</span></p>
          <svg class="ct-flourish" viewBox="0 0 400 44" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M396 6C330 30 190 42 96 34 54 30 22 22 6 12"/></svg>
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
    <footer><span>© ${new Date().getFullYear()} ${T(PROFILE.name)}. ${T(UI.rights)}</span><a href="#home">${T(UI.top)} ${UP}</a></footer>
  </section>`;
}

export function init() {
  const section = document.getElementById('contact');
  const card = section?.querySelector('.ct-card');
  if (!section) return undefined;
  const ac = new AbortController();
  let timer = 0;

  section.querySelector('.ct-copy')?.addEventListener('click', async (e) => {
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
