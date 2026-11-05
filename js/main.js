import { PROFILE } from './data.js';
import { L, state } from './shared.js';
import { initLightbox } from './lightbox.js';
import { openDetail, closeDetail } from './sections/detail.js';
import * as header from './sections/header.js';
import * as hero from './sections/hero.js';
import * as systems from './sections/systems.js';
import * as apps from './sections/apps.js';
import * as skills from './sections/skills.js';
import * as career from './sections/career.js';
import * as voices from './sections/voices.js';
import * as contact from './sections/contact.js';
import * as fab from './sections/fab.js';
import { applySeo } from './seo.js';

/* Page order. Each module exports render() -> HTML and may export init() -> optional cleanup. */
const CONTENT = [hero, apps, systems, skills, career, voices, contact];
const SECTIONS = [header, ...CONTENT, fab];
const app = document.getElementById('app');
const dialog = document.getElementById('detail');
let cleanups = [];

/* Where the reader is, as a section and a fraction of it: the two languages differ in height. */
const READ_LINE = 0.4;
function readingSpot() {
  const y = innerHeight * READ_LINE;
  const el = [...app.querySelectorAll('section')].find((s) => s.getBoundingClientRect().bottom > y);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { id: el.id, at: (y - r.top) / r.height };
}
function restoreSpot(spot) {
  const r = spot && document.getElementById(spot.id)?.getBoundingClientRect();
  if (r) scrollTo({ top: scrollY + r.top + spot.at * r.height - innerHeight * READ_LINE, behavior: 'instant' });
}

function render(spot) {
  const html = document.documentElement;
  html.lang = state.lang;
  html.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
  document.title = `${L(PROFILE.name)} | ${L(PROFILE.role)}`;
  applySeo();
  cleanups.forEach((fn) => fn());
  app.innerHTML = `${header.render()}<main>${CONTENT.map((s) => s.render()).join('')}</main>${fab.render()}`;
  restoreSpot(spot);
  observe();
  cleanups = SECTIONS.map((s) => s.init?.()).filter((fn) => typeof fn === 'function');
}

/* Adds .in to every .reveal when it scrolls into view. */
let io;
function observe() {
  if (io) io.disconnect();
  io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
}

document.addEventListener('click', (e) => {
  const opener = e.target.closest('[data-open]');
  if (opener) return openDetail(opener.dataset.open, true, Number(opener.dataset.at) || 0);
  if (e.target.closest('#d-close') || e.target === dialog) return closeDetail();
  const langLink = e.target.closest('#lang');
  if (langLink) {
    if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // let modified clicks open the link normally
    e.preventDefault();
    const spot = readingSpot();
    state.lang = state.lang === 'ar' ? 'en' : 'ar';
    try { localStorage.setItem('lang', state.lang); } catch { /* private mode */ }
    /* An explicit ?lang= wins on load, so keep it in step or a reload undoes the choice. */
    const url = new URL(location.href);
    if (url.searchParams.has('lang')) { url.searchParams.set('lang', state.lang); history.replaceState(history.state, '', url); }
    closeDetail();
    render(spot);
    document.getElementById('lang')?.focus({ preventScroll: true });
  }
});

dialog.addEventListener('close', () => {
  document.documentElement.classList.remove('lock');
  if (location.hash.startsWith('#p/')) history.pushState(null, '', location.pathname + location.search);
});

window.addEventListener('popstate', () => {
  /* Back closes the viewer first and stays on the project, so a phone's back key never leaves the site from it. */
  const viewer = document.getElementById('lightbox');
  if (viewer.open) {
    viewer.close();
    if (dialog.open) history.pushState(null, '', `#p/${dialog.dataset.id}`);
    return;
  }
  if (location.hash.startsWith('#p/')) openDetail(location.hash.slice(3), false);
  else closeDetail();
});

const progress = document.getElementById('progress');
window.addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
}, { passive: true });

render();
initLightbox();
/* Fonts change the page's height after the browser has jumped to a #section, so land again once they are in.
   Smooth scrolling is off meanwhile: a re-land during the browser's own smooth jump would add to it, not replace it. */
if (location.hash.length > 1 && !location.hash.startsWith('#p/')) {
  const root = document.documentElement;
  root.style.scrollBehavior = 'auto';
  document.fonts?.ready.then(() => {
    document.querySelector(location.hash)?.scrollIntoView();
    addEventListener('load', () => root.style.removeProperty('scroll-behavior'), { once: true });
    if (document.readyState === 'complete') root.style.removeProperty('scroll-behavior');
  });
}
if (location.hash.startsWith('#p/')) openDetail(location.hash.slice(3), false);
