import { SYSTEMS, APPS, OTHERS, UI } from '../data.js';
import { T, esc, arrow, ext, pad, statusChip } from '../shared.js';
import { mockHTML } from './mock.js';

const dialog = document.getElementById('detail');
const ALL = [...SYSTEMS, ...APPS, ...OTHERS];
const TEXT = {
  prev: { ar: 'الصورة السابقة', en: 'Previous image' },
  next: { ar: 'الصورة التالية', en: 'Next image' },
};
const X = '<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M3 3l10 10M13 3 3 13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
const CHEV = '<svg class="d-chev" viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const EXPAND = '<span class="d-zoom" aria-hidden="true"><svg viewBox="0 0 16 16" width="13" height="13"><path d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5 9 7M2.5 13.5 7 9" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
const EXIT_MS = 190;

let exitTimer = 0;
let wiring = null;

function linksHTML(p) {
  return (p.links || []).map((l) => `<a class="btn ${['site', 'login'].includes(l.kind) ? '' : 'ghost'}" href="${l.url}" ${ext}>${T(UI.link[l.kind])} ${arrow}</a>`).join('');
}

/* A verified fact worth more than a feature list: a big number, plus either the story of the app's name or a note on the work. */
function renameHTML(r) {
  const dirArrow = document.documentElement.dir === 'rtl' ? '←' : '→';
  return `<h3>${T(r.title)}</h3>
      <div class="d-names">
        <p><small>${T(r.firstLabel)}</small><b lang="en" dir="ltr">${esc(r.first)}</b></p>
        <i aria-hidden="true">${dirArrow}</i>
        <p><small>${T(r.nowLabel)}</small><b lang="en" dir="ltr">${esc(r.now)}</b></p>
      </div>
      <p class="d-name-note">${T(r.note)} <a href="${r.url}" ${ext} lang="en" dir="ltr">${esc(r.urlText)}</a></p>`;
}

function proofHTML(p) {
  if (!p.proof) return '';
  const { over, value, label, rename, story } = p.proof;
  const side = rename ? renameHTML(rename) : story ? `<h3>${T(story.title)}</h3><p class="d-story">${T(story.text)}</p>` : '';
  return `<section class="d-proof ${side ? '' : 'solo'} d-in" style="--i:2">
    <div class="d-stat">
      <small>${T(over)}</small>
      <b>${T(value)}</b>
      <span>${T(label)}</span>
    </div>
    ${side ? `<div class="d-name">${side}</div>` : ''}
  </section>`;
}

function galleryHTML(p, isPhone) {
  if (p.images && p.images.length) {
    const many = p.images.length > 1;
    return `<div class="d-media d-in" style="--i:3">
      <div class="gallery ${isPhone ? 'phones' : ''}" tabindex="0">${p.images.map((src, i) => `<a href="${src}" ${ext}><img src="${src}" alt="${T(p.name)} ${i + 1}" ${isPhone ? '' : 'loading="lazy"'}>${EXPAND}</a>`).join('')}</div>
      ${many ? `<div class="d-bar" hidden>
        <span class="d-count" dir="ltr">${pad(1)} / ${pad(p.images.length)}</span>
        <span class="d-track" aria-hidden="true"><i></i></span>
        <button type="button" class="d-step" data-step="-1" aria-label="${T(TEXT.prev)}">${CHEV}</button>
        <button type="button" class="d-step" data-step="1" aria-label="${T(TEXT.next)}">${CHEV}</button>
      </div>` : ''}
      ${p.redacted ? `<p class="gallery-note">${T(UI.redactNote)}</p>` : ''}
    </div>`;
  }
  return p.mock ? `<figure class="gallery-mock d-in" style="--i:3">${mockHTML(p.mock)}<figcaption>${T(UI.mockNote)}</figcaption></figure>` : '';
}

/* Mouse users get steppers, a count and a track under the strip; touch can just swipe. */
function wireGallery(signal) {
  const gallery = dialog.querySelector('.gallery');
  const bar = dialog.querySelector('.d-bar');
  if (!gallery || !bar) return;
  const links = [...gallery.querySelectorAll('a')];
  const count = bar.querySelector('.d-count');
  const fill = bar.querySelector('.d-track i');
  const steps = [...bar.querySelectorAll('.d-step')];
  const rtl = () => document.documentElement.dir === 'rtl';
  const inset = () => parseFloat(getComputedStyle(gallery).scrollPaddingInlineStart) || 0;
  /* Distance from a frame's leading edge to where snapping would rest it, in physical px. */
  const offset = (a) => {
    const g = gallery.getBoundingClientRect();
    const r = a.getBoundingClientRect();
    return rtl() ? r.right - (g.right - inset()) : r.left - (g.left + inset());
  };
  let index = 0;
  let queued = false;
  const update = () => {
    queued = false;
    const max = gallery.scrollWidth - gallery.clientWidth;
    bar.hidden = max < 2;
    const pos = Math.abs(gallery.scrollLeft);
    let best = 0;
    links.forEach((a, i) => { if (Math.abs(offset(a)) < Math.abs(offset(links[best]))) best = i; });
    index = max - pos < 2 ? links.length - 1 : pos < 2 ? 0 : best;
    count.textContent = `${pad(index + 1)} / ${pad(links.length)}`;
    fill.style.transform = `scaleX(${max > 0 ? (pos + gallery.clientWidth) / gallery.scrollWidth : 1})`;
    steps[0].setAttribute('aria-disabled', pos < 2);
    steps[1].setAttribute('aria-disabled', max - pos < 2);
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  gallery.addEventListener('scroll', queue, { passive: true, signal });
  gallery.addEventListener('load', queue, { capture: true, signal });
  window.addEventListener('resize', queue, { passive: true, signal });
  bar.addEventListener('click', (e) => {
    const b = e.target.closest('[data-step]');
    if (!b || b.getAttribute('aria-disabled') === 'true') return;
    const target = links[Math.min(links.length - 1, Math.max(0, index + Number(b.dataset.step)))];
    gallery.scrollBy({ left: offset(target), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, { signal });
  update();
}

/* The panel grows out of whatever opened it, so the reader keeps their place. */
function setOrigin(from) {
  if (!from) { dialog.style.removeProperty('--ox'); dialog.style.removeProperty('--oy'); return; }
  const a = from.getBoundingClientRect();
  const d = dialog.getBoundingClientRect();
  const clamp = (v, max) => Math.min(max, Math.max(0, v));
  dialog.style.setProperty('--ox', `${clamp(a.left + a.width / 2 - d.left, d.width)}px`);
  dialog.style.setProperty('--oy', `${clamp(a.top + a.height / 2 - d.top, d.height)}px`);
}

export function openDetail(id, push = true) {
  const p = ALL.find((x) => x.id === id);
  if (!p) return;
  clearTimeout(exitTimer);
  dialog.classList.remove('closing');
  wiring?.abort();
  wiring = new AbortController();
  dialog.dataset.id = id;
  const opener = document.activeElement?.closest?.('[data-open]');
  const isPhone = APPS.includes(p);
  const body = p.who || p.stack;
  dialog.innerHTML = `<div class="d-wrap">
    <div class="d-top">
      <p class="meta">${p.status ? statusChip(p) : ''}<small>${T(p.code || p.tag)}</small></p>
      <button class="d-close" type="button" id="d-close"><span>${T(UI.close)}</span>${X}</button>
    </div>
    <header class="d-head">
      ${p.icon ? `<img class="d-icon d-in" style="--i:0" src="${p.icon}" alt="" width="64" height="64">` : ''}
      <div class="d-title d-in" style="--i:0">
        <h2 id="detail-title">${T(p.name)}</h2>
        ${p.status ? `<p class="d-tag">${T(p.tag)}</p>` : ''}
      </div>
      ${p.links ? `<div class="d-links d-in" style="--i:1">${linksHTML(p)}</div>` : ''}
    </header>
    <div class="d-rule" aria-hidden="true"></div>
    ${proofHTML(p)}
    ${galleryHTML(p, isPhone)}
    <div class="d-cols ${body ? '' : 'solo'}">
      <div class="d-main d-in" style="--i:4">
        <h3>${T(UI.simple)}</h3>
        <p class="d-lead">${T(p.simple)}</p>
        ${p.features ? `<h3>${T(UI.features)}</h3><ul class="d-list">${p.features.map((f) => `<li>${T(f)}</li>`).join('')}</ul>` : ''}
      </div>
      ${body ? `<aside class="d-rail d-in" style="--i:5">
        ${p.who ? `<h3>${T(UI.who)}</h3><p>${T(p.who)}</p>` : ''}
        ${p.stack ? `<h3>${T(UI.stack)}</h3><ul class="d-stack" lang="en" dir="ltr">${p.stack.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}
      </aside>` : ''}
    </div>
  </div>`;
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
  setOrigin(opener);
  wireGallery(wiring.signal);
  const top = dialog.querySelector('.d-top');
  dialog.addEventListener('scroll', () => top.classList.toggle('stuck', dialog.scrollTop > 4), { passive: true, signal: wiring.signal });
  document.documentElement.classList.add('lock');
  if (push) history.pushState({ project: id }, '', `#p/${id}`);
}

/* main.js closes through here. Plays the exit, then closes for real, so its close listener
   (scroll lock and hash) runs as before. Reduced motion closes at once. */
export function closeDetail() {
  if (!dialog.open || dialog.classList.contains('closing')) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { dialog.close(); return; }
  dialog.classList.add('closing');
  exitTimer = setTimeout(() => dialog.close(), EXIT_MS);
}

/* Escape goes through the same exit. If the browser skips cancel, close still resets state. */
dialog.addEventListener('cancel', (e) => { e.preventDefault(); closeDetail(); });
dialog.addEventListener('close', () => {
  clearTimeout(exitTimer);
  dialog.classList.remove('closing');
  wiring?.abort();
  wiring = null;
});
