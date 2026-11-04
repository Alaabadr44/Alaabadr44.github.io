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
import * as contact from './sections/contact.js';

/* Page order. Each module exports render() -> HTML and may export init() -> optional cleanup. */
const SECTIONS = [header, hero, systems, apps, skills, career, contact];
const app = document.getElementById('app');
const dialog = document.getElementById('detail');
let cleanups = [];

function render() {
  const html = document.documentElement;
  html.lang = state.lang;
  html.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
  document.title = `${L(PROFILE.name)} | ${L(PROFILE.role)}`;
  cleanups.forEach((fn) => fn());
  app.innerHTML = SECTIONS.map((s) => s.render()).join('');
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
  if (opener) return openDetail(opener.dataset.open);
  if (e.target.closest('#d-close') || e.target === dialog) return closeDetail();
  if (e.target.closest('#lang')) {
    state.lang = state.lang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('lang', state.lang);
    closeDetail();
    render();
  }
});

dialog.addEventListener('close', () => {
  document.documentElement.classList.remove('lock');
  if (location.hash.startsWith('#p/')) history.pushState(null, '', location.pathname + location.search);
});

window.addEventListener('popstate', () => {
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
if (location.hash.startsWith('#p/')) openDetail(location.hash.slice(3), false);
