import { L, T, esc } from '../shared.js';

/* Illustrations for private systems: real feature labels, abstract data, no real records. */
const bars = (n) => Array.from({ length: n }, (_, i) => `<i style="--h:${28 + ((i * 37 + 19) % 66)}%"></i>`).join('');
const lines = (n) => Array.from({ length: n }, (_, i) => `<span class="ln" style="--w:${52 + ((i * 29) % 44)}%"></span>`).join('');

export function mockHTML(m) {
  const nav = m.nav.map(L);
  const tiles = m.tiles.map(L);
  const title = T(m.title);
  if (m.kind === 'kanban') {
    return `<div class="mock mock-kanban"><header><b>${title}</b><span class="dot"></span></header><div class="cols">
      ${nav.map((col, c) => `<div class="col"><h5>${esc(col)}</h5>
        ${tiles.slice(0, 3 - (c === 2 ? 1 : 0)).map((x, i) => `<div class="tick ${i === 0 && c === 1 ? 'on' : ''}"><em>${esc(tiles[(i + c) % tiles.length])}</em>${lines(2)}</div>`).join('')}
      </div>`).join('')}</div></div>`;
  }
  if (m.kind === 'phones') {
    return `<div class="mock mock-phones">${nav.map((who, i) => `<div class="ph ${i === 1 ? 'mid' : ''}"><u></u><h5>${esc(who)}</h5>
      <div class="map"><svg viewBox="0 0 100 70" preserveAspectRatio="none" aria-hidden="true"><path d="M6 60C26 58 28 26 50 30s26-20 44-22" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="3 3"/></svg></div>
      <em>${esc(tiles[i])}</em>${lines(3)}</div>`).join('')}</div>`;
  }
  if (m.kind === 'kiosk') {
    return `<div class="mock mock-kiosk"><div class="screen"><b>${title}</b><div class="grid">${Array.from({ length: 6 }, (_, i) => `<div class="tile ${i === 1 ? 'on' : ''}"><span></span>${lines(1)}</div>`).join('')}</div><div class="call">${esc(nav[0])}</div></div><div class="stand"></div></div>`;
  }
  return `<div class="mock mock-dash"><aside><span class="logo"></span>${nav.map((n, i) => `<small class="${i === 0 ? 'on' : ''}">${esc(n)}</small>`).join('')}</aside>
    <div class="body"><header><b>${title}</b><span class="dot"></span></header>
    <div class="tiles">${tiles.map((x) => `<div><small>${esc(x)}</small>${lines(1)}</div>`).join('')}</div>
    <div class="chart">${bars(14)}</div></div></div>`;
}
