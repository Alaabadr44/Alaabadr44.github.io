import { PROFILE, UI } from '../data.js';
import { T, state } from '../shared.js';

export function render() {
  const n = UI.nav;
  return `<header class="top" id="top-bar">
    <a class="mark" href="#home" aria-label="${T(PROFILE.name)}" lang="en" dir="ltr">Alaa badr</a>
    <nav aria-label="Main">
      <a href="#work">${T(n.work)}</a><a href="#apps">${T(n.apps)}</a><a href="#skills">${T(n.skills)}</a><a href="#career">${T(n.career)}</a>
    </nav>
    <div class="top-end">
      <button class="lang" id="lang" type="button" lang="${state.lang === 'ar' ? 'en' : 'ar'}">${T(UI.langLabel)}</button>
      <a class="btn-mini" href="#contact">${T(n.contact)}</a>
    </div>
  </header>`;
}

export function init() {
  const bar = document.getElementById('top-bar');
  const onScroll = () => bar?.classList.toggle('solid', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  return () => removeEventListener('scroll', onScroll);
}
