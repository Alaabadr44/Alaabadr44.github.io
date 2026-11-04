import { APPS, OTHERS, UI } from '../data.js';
import { monstera } from '../deco.js';
import { T, arrow, ext, sectionHead } from '../shared.js';

export function render() {
  return `<section class="band alt" id="apps"><div class="o o-s2" aria-hidden="true">${monstera()}</div>
    ${sectionHead(UI.appsKicker, UI.appsTitle)}
    <div class="apps">${APPS.map((a) => `
      <button class="app reveal" type="button" data-open="${a.id}">
        <span class="stage">
          ${a.images.length
            ? `<img class="shot" src="${a.images[0]}" alt="${T(a.name)}" loading="lazy">`
            : `<img class="shot icon-big" src="${a.icon}" alt="${T(a.name)}" loading="lazy">`}
        </span>
        <span class="app-id"><img src="${a.icon}" alt="" loading="lazy" width="48" height="48">
          <span><b>${T(a.name)}</b><small>${T(a.tag)}</small></span></span>
      </button>`).join('')}</div>
    <div class="others">
      ${sectionHead(UI.othersKicker, UI.othersTitle)}
      <ul>${OTHERS.map((o) => `<li class="reveal">
        <div><b>${T(o.name)}</b><small>${T(o.tag)}</small></div>
        <p>${T(o.simple)}${o.url ? ` <a href="${o.url}" ${ext}>${T(UI.link.repo)} ${arrow}</a>` : ''}</p>
      </li>`).join('')}</ul>
    </div>
  </section>`;
}
