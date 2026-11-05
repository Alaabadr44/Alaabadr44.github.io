import { PROFILE, UI } from '../data.js';
import { T, contactRow, pad, state } from '../shared.js';

const NAV_LABEL = { ar: 'التنقل الرئيسي', en: 'Main' };
const MENU_LABEL = { ar: 'القائمة', en: 'Menu' };

export function render() {
  const n = UI.nav;
  const links = [['apps', n.apps], ['work', n.work], ['skills', n.skills], ['career', n.career], ['voices', n.voices]];
  const sheetLinks = [...links, ['contact', n.contact]];
  return `<header class="top" id="top-bar">
    <a class="mark" href="#home" aria-label="${T(PROFILE.name)}" lang="en" dir="ltr">Alaa badr</a>
    <nav class="top-nav" aria-label="${T(NAV_LABEL)}">
      ${links.map(([id, label]) => `<a href="#${id}" data-spy="${id}">${T(label)}</a>`).join('')}
      <span class="spy-ind" aria-hidden="true"></span>
    </nav>
    <div class="top-end">
      <a class="lang" id="lang" href="?lang=${state.lang === 'ar' ? 'en' : 'ar'}" lang="${state.lang === 'ar' ? 'en' : 'ar'}">${T(UI.langLabel)}</a>
      <a class="btn-mini" href="#contact" data-spy="contact">${T(n.contact)}</a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav-sheet" aria-label="${T(MENU_LABEL)}" data-open-label="${T(MENU_LABEL)}" data-close-label="${T(UI.close)}"><span class="bars" aria-hidden="true"><i></i><i></i></span></button>
    </div>
    <div class="sheet" id="nav-sheet">
      <nav aria-label="${T(NAV_LABEL)}">
        ${sheetLinks.map(([id, label], i) => `<a class="sheet-link" href="#${id}" data-spy="${id}" style="--i:${i}"><span class="sheet-n" aria-hidden="true">${pad(i + 1)}</span><span>${T(label)}</span></a>`).join('')}
      </nav>
      <div class="sheet-foot" style="--i:5">${contactRow()}</div>
    </div>
  </header>`;
}

export function init() {
  const bar = document.getElementById('top-bar');
  if (!bar) return undefined;
  const rootEl = document.documentElement;
  const nav = bar.querySelector('.top-nav');
  const ind = bar.querySelector('.spy-ind');
  const menuBtn = bar.querySelector('.menu-btn');
  const sheet = bar.querySelector('.sheet');
  const offs = [];
  const on = (target, type, fn, opts) => { target.addEventListener(type, fn, opts); offs.push(() => target.removeEventListener(type, fn, opts)); };

  /* Solid state */
  const onScroll = () => bar.classList.toggle('solid', scrollY > 40);
  on(window, 'scroll', onScroll, { passive: true });
  onScroll();

  /* The small signature in the bar takes over once the big one has left the screen. */
  const bigSig = document.querySelector('#home .sig');
  let sigIo;
  if (bigSig) {
    sigIo = new IntersectionObserver(([e]) => bar.classList.toggle('sig-away', !e.isIntersecting), { rootMargin: '-72px 0px 0px 0px' });
    sigIo.observe(bigSig);
  } else bar.classList.add('sig-away');

  /* Scroll spy with an indicator that glides between links. */
  let currentId = null;
  const place = () => {
    const a = currentId && nav.querySelector(`[data-spy="${currentId}"]`);
    if (!a || !a.offsetWidth) { ind.style.opacity = 0; return; }
    ind.style.opacity = 1;
    ind.style.transform = `translateX(${a.offsetLeft}px) scaleX(${a.offsetWidth})`;
  };
  const setCurrent = (id) => {
    currentId = id;
    bar.querySelectorAll('[data-spy]').forEach((a) => {
      if (a.dataset.spy === id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    place();
  };
  const ids = ['home', 'apps', 'work', 'skills', 'career', 'voices', 'contact'];
  const spyIo = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) setCurrent(e.target.id === 'home' ? null : e.target.id); });
  }, { rootMargin: '-45% 0px -54% 0px' });
  ids.forEach((id) => { const el = document.getElementById(id); if (el) spyIo.observe(el); });
  on(window, 'resize', place, { passive: true });
  document.fonts?.ready.then(place);

  /* Phone menu */
  const setOpen = (open, refocus = true) => {
    const was = bar.classList.contains('menu-open');
    if (was === open) return;
    bar.classList.toggle('menu-open', open);
    rootEl.classList.toggle('nav-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? menuBtn.dataset.closeLabel : menuBtn.dataset.openLabel);
    if (!open && refocus) menuBtn.focus({ preventScroll: true });
  };
  on(menuBtn, 'click', () => setOpen(!bar.classList.contains('menu-open')));
  on(sheet, 'click', (e) => { if (e.target.closest('a')) setOpen(false, false); });
  on(bar.querySelector('.mark'), 'click', () => setOpen(false, false));
  on(document, 'keydown', (e) => {
    if (!bar.classList.contains('menu-open')) return;
    if (e.key === 'Escape') { setOpen(false); return; }
    if (e.key !== 'Tab') return;
    const items = [...bar.querySelectorAll('a[href], button')].filter((el) => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  /* Rotating a phone or widening a window past the breakpoint must not leave the page locked. */
  const wide = matchMedia('(min-width: 861px)');
  const onWide = () => { if (wide.matches) setOpen(false, false); };
  on(wide, 'change', onWide);

  return () => {
    offs.forEach((off) => off());
    sigIo?.disconnect();
    spyIo.disconnect();
    rootEl.classList.remove('nav-open');
  };
}
