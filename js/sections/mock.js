import { L, T, esc } from '../shared.js';

/* Illustrations for private systems: real feature labels, abstract data, no real records.
   Every one is a labelled image for assistive tech, and scales with its own width (see systems.css). */
const lines = (n) => Array.from({ length: n }, (_, i) => `<span class="ln" style="--w:${52 + ((i * 29) % 44)}%"></span>`).join('');
const open = (kind, m) => `<div class="mock mock-${kind}" role="img" aria-label="${T(m.title)}">`;

/* Week planner: which cells hold a post, and in what state, is a fixed pattern. */
const planner = () => Array.from({ length: 21 }, (_, i) => {
  const kind = (i * 37 + 11) % 5;
  if (kind === 0 || kind === 3) return '<i></i>';
  return `<i class="post p${kind}" style="--i:${i}"><span class="thumb"></span><span class="ln" style="--w:${58 + ((i * 23) % 36)}%"></span><span class="ln" style="--w:${38 + ((i * 17) % 30)}%"></span></i>`;
}).join('');

const road = '<path class="st" d="M0 20H60M0 46H60M0 70H60M18 0V86M44 0V86"/><path class="st" d="M0 64 60 30"/>';
const ROUTES = ['M12 74C14 56 44 60 44 44S14 33 18 20 40 12 48 12', 'M48 74C46 58 18 63 18 46S46 34 44 20 22 12 14 12'];
const map = (r) => `<div class="map"><svg viewBox="0 0 60 86" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${road}
  <path class="rt" d="${ROUTES[r]}"/><circle class="pin" cx="${r ? 48 : 12}" cy="74" r="2"/><circle class="pin end" cx="${r ? 14 : 48}" cy="12" r="2"/>
  <circle class="mover" r="2.7" style="offset-path:path('${ROUTES[r]}');animation-delay:${r * -2.4}s"/></svg></div>`;

export function mockHTML(m) {
  const nav = m.nav.map(L);
  const tiles = m.tiles.map(L);
  const title = T(m.title);

  if (m.kind === 'kanban') {
    const rows = [3, 3, 3];
    return `${open('kanban', m)}<header><b>${title}</b><span class="dot"></span></header><div class="cols">
      ${nav.map((col, c) => `<div class="col"><span class="h">${esc(col)}</span>
        ${c === 0 ? `<div class="tick fly"><em>${esc(tiles[0])}</em>${lines(2)}</div>` : ''}
        ${Array.from({ length: rows[c] }, (_, i) => `<div class="tick ${c === 2 ? 'done' : ''}"><em>${esc(tiles[(i + c + 1) % tiles.length])}</em>${lines(2)}</div>`).join('')}
      </div>`).join('')}</div></div>`;
  }

  if (m.kind === 'phones') {
    /* Middle phone is the branch: an order list instead of a map. */
    return `${open('phones', m)}${nav.map((who, i) => `<div class="ph ${i === 1 ? 'mid' : ''}"><u></u><span class="h">${esc(who)}</span>
      ${i === 1
        ? `<div class="orders">${[...tiles, ...tiles].map((x, r) => `<div class="order ${r === 1 ? 'on' : ''}"><em>${esc(x)}</em>${lines(1)}</div>`).join('')}</div>`
        : `${map(i ? 1 : 0)}<em class="state">${esc(tiles[i])}</em>${lines(2)}`}
      </div>`).join('')}</div>`;
  }

  return `${open('dash', m)}<aside><span class="logo"></span>${nav.map((n, i) => `<small class="${i === 0 ? 'on' : ''}">${esc(n)}</small>`).join('')}</aside>
    <div class="body"><header><b>${title}</b><span class="dot"></span></header>
    <div class="flow"><span class="pulse"></span>${tiles.map((x) => `<div class="stage-t"><small>${esc(x)}</small>${lines(1)}</div>`).join('')}</div>
    <div class="planner">${planner()}</div></div></div>`;
}
