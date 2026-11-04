import { state } from './shared.js';

/* Site-wide image viewer. Any click on `.gallery a` opens it, so every project gallery
   gets it without extra wiring. Arrow keys follow what is on screen: in Arabic the next
   image sits to the left, in English to the right. */
const TEXT = {
  ar: { close: 'إغلاق', next: 'الصورة التالية', prev: 'الصورة السابقة', go: 'انتقل إلى الصورة' },
  en: { close: 'Close', next: 'Next image', prev: 'Previous image', go: 'Go to image' },
};
const CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';
const CHEV_BACK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg>';
const X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';

let box;
let items = [];
let index = 0;
let title = '';

const preload = (i) => { const im = new Image(); im.src = items[(i + items.length) % items.length].src; };

function show(next, dir = 0) {
  index = (next + items.length) % items.length;
  const it = items[index];
  const multi = items.length > 1;
  const img = box.querySelector('.lb-img');
  img.classList.remove('from-next', 'from-prev');
  img.src = it.src;
  img.alt = it.alt;
  if (dir) { void img.offsetWidth; img.classList.add(dir > 0 ? 'from-next' : 'from-prev'); }
  box.querySelector('.lb-count').textContent = `${index + 1} / ${items.length}`;
  box.querySelectorAll('.lb-thumb').forEach((t, i) => {
    const on = i === index;
    t.setAttribute('aria-current', on);
    if (on) t.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  });
  if (multi) { preload(index + 1); preload(index - 1); }
}

function open(anchor) {
  const gallery = anchor.closest('.gallery');
  const links = [...gallery.querySelectorAll('a')];
  items = links.map((a) => { const im = a.querySelector('img'); return { src: a.getAttribute('href'), thumb: im.getAttribute('src'), alt: im.alt }; });
  title = document.getElementById('detail-title')?.textContent || '';
  const t = TEXT[state.lang];
  const multi = items.length > 1;
  box.innerHTML = `
    <div class="lb-top">
      <span class="lb-count" dir="ltr" aria-live="polite"></span>
      <span class="lb-title">${title.replace(/[&<>]/g, '')}</span>
      <button type="button" class="lb-x" data-lb="close" aria-label="${t.close}">${X}</button>
    </div>
    <div class="lb-stage">
      ${multi ? `<button type="button" class="lb-nav lb-prev" data-lb="prev" aria-label="${t.prev}">${CHEV_BACK}</button>` : ''}
      <img class="lb-img" alt="" draggable="false">
      ${multi ? `<button type="button" class="lb-nav lb-next" data-lb="next" aria-label="${t.next}">${CHEV}</button>` : ''}
    </div>
    ${multi ? `<div class="lb-thumbs">${items.map((it, i) => `<button type="button" class="lb-thumb" data-i="${i}" aria-label="${t.go} ${i + 1}"><img src="${it.thumb}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}`;
  box.tabIndex = -1;
  box.showModal();
  box.focus();
  show(links.indexOf(anchor));
}

export function initLightbox() {
  box = document.getElementById('lightbox');

  document.addEventListener('click', (e) => {
    const a = e.target.closest('.gallery a');
    if (!a || e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    open(a);
  });

  box.addEventListener('click', (e) => {
    const b = e.target.closest('[data-lb], [data-i]');
    if (b?.dataset.lb === 'close') return box.close();
    if (b?.dataset.lb === 'next') return show(index + 1, 1);
    if (b?.dataset.lb === 'prev') return show(index - 1, -1);
    if (b?.dataset.i) { const i = Number(b.dataset.i); return show(i, i > index ? 1 : -1); }
    if (e.target.classList.contains('lb-stage')) box.close();
  });

  box.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const rtl = document.documentElement.dir === 'rtl';
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    if (e.key === forward) { e.preventDefault(); show(index + 1, 1); }
    else if (e.key === back) { e.preventDefault(); show(index - 1, -1); }
    else if (e.key === 'Home') { e.preventDefault(); show(0, -1); }
    else if (e.key === 'End') { e.preventDefault(); show(items.length - 1, 1); }
  });

  /* Touch swipe. */
  let startX = null;
  box.addEventListener('pointerdown', (e) => { if (e.target.closest('.lb-stage')) startX = e.clientX; });
  box.addEventListener('pointerup', (e) => {
    if (startX === null || items.length < 2) { startX = null; return; }
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) < 50) return;
    const rtl = document.documentElement.dir === 'rtl';
    const towardNext = rtl ? dx > 0 : dx < 0;
    show(index + (towardNext ? 1 : -1), towardNext ? 1 : -1);
  });
}
