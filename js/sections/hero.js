import { PROFILE, SYSTEMS, APPS, UI } from '../data.js';
import { keyboard, stylus, headphones, monstera, plant } from '../deco.js';
import { L, T, contactRow, state } from '../shared.js';

export function render() {
  const live = SYSTEMS.filter((s) => s.status === 'live').length;
  const stats = [
    [APPS.length, UI.stats.apps],
    [SYSTEMS.length, UI.stats.systems],
    [live, UI.stats.live],
    [2021, UI.stats.since],
  ];
  return `<section class="hero" id="home" dir="ltr">
    <div class="flat" aria-hidden="true">
      <div class="o o-keyboard">${keyboard()}</div>
      <div class="o o-stylus">${stylus()}</div>
      <div class="o o-phones">${headphones()}</div>
      <div class="o o-leaf-top">${monstera()}</div>
      <div class="o o-plant-top">${plant()}</div>
      <div class="o o-plant-low">${plant(11)}</div>
      <div class="o o-leaf-low">${monstera()}</div>
    </div>
    <div class="hero-photo"><img src="assets/alaa.webp" alt="${T(PROFILE.fullName)}" width="640" height="641"></div>
    <div class="hero-text" dir="${state.lang === 'ar' ? 'rtl' : 'ltr'}">
      <p class="sig rise" style="--d:.1s" lang="en" dir="ltr">Alaa badr</p>
      <p class="pill rise" style="--d:.25s">${T(PROFILE.role)}</p>
      <h1 class="rise" style="--d:.35s">${L(UI.headline)}</h1>
      <p class="intro rise" style="--d:.45s">${T(UI.intro)}</p>
      <div class="cta rise" style="--d:.55s">
        <a class="btn" href="#work">${T(UI.cta)}</a>
        <a class="btn ghost" href="#contact">${T(UI.ctaContact)}</a>
      </div>
      <div class="rise" style="--d:.65s">${contactRow()}</div>
      <dl class="stats rise" style="--d:.75s">${stats.map(([v, l]) => `<div><dt>${T(l)}</dt><dd>${v}</dd></div>`).join('')}</dl>
    </div>
  </section>`;
}
