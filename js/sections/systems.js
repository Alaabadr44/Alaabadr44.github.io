import { SYSTEMS, UI } from '../data.js';
import { plant } from '../deco.js';
import { T, pad, arrow, statusChip, sectionHead } from '../shared.js';
import { mockHTML } from './mock.js';

const visual = (p) => (p.images
  ? `<img src="${p.images[0]}" alt="${T(p.name)}" loading="lazy" width="1200" height="750">`
  : mockHTML(p.mock));

export function render() {
  const featured = SYSTEMS.filter((s) => s.featured);
  const rest = SYSTEMS.filter((s) => !s.featured);
  return `<section class="band" id="work"><div class="o o-s1" aria-hidden="true">${plant()}</div>
    ${sectionHead(UI.workKicker, UI.workTitle, UI.workNote)}
    <div class="feat">${featured.map((p, i) => `
      <button class="feat-row reveal" type="button" data-open="${p.id}">
        <span class="visual">${visual(p)}</span>
        <span class="feat-text">
          <span class="num">${pad(i + 1)}</span>
          <span class="meta">${statusChip(p)}<small>${T(p.code)}</small></span>
          <span class="title">${T(p.name)}</span>
          <span class="tag">${T(p.tag)}</span>
          <span class="desc">${T(p.simple)}</span>
          <span class="go">${T(UI.more)} ${arrow}</span>
        </span>
      </button>`).join('')}</div>
    <div class="cards">${rest.map((p, i) => `
      <button class="card reveal" type="button" data-open="${p.id}">
        <span class="visual">${visual(p)}</span>
        <span class="meta"><span class="num">${pad(featured.length + i + 1)}</span>${statusChip(p)}</span>
        <span class="title">${T(p.name)}</span>
        <span class="tag">${T(p.tag)}</span>
        <span class="go">${T(UI.more)} ${arrow}</span>
      </button>`).join('')}</div>
  </section>`;
}
