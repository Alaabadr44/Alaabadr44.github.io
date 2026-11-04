// Flat-lay desk objects, drawn as SVG so they stay sharp at any size.
let uid = 0;

export function keyboard() {
  const id = `k${uid++}`;
  const rows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", '↵'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', '▲', '⇧'],
  ];
  const key = (x, y, w, label, small) => `<g><rect x="${x}" y="${y}" width="${w}" height="46" rx="8" fill="url(#${id})"/><rect x="${x + .5}" y="${y + .5}" width="${w - 1}" height="45" rx="7.5" fill="none" stroke="#4a4a4d" stroke-opacity=".55"/><text x="${x + w / 2}" y="${y + (small ? 40 : 29)}" text-anchor="middle" font-size="${small ? 9.5 : 14}" fill="#d9d9d9" font-family="Montserrat,sans-serif">${label}</text></g>`;
  let keys = '';
  rows.forEach((row, r) => row.forEach((l, c) => { keys += key(24 + c * 52 + r * 8, 22 + r * 52, 46, l); }));
  const y = 22 + 4 * 52;
  keys += key(24, y, 58, 'control', true) + key(88, y, 58, 'option', true) + key(152, y, 72, 'command', true)
    + key(230, y, 262, '', true) + key(498, y, 72, 'command', true) + key(576, y, 58, 'option', true);
  return `<svg viewBox="0 0 690 300" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#313134"/><stop offset="1" stop-color="#1f1f21"/></linearGradient></defs>
    <rect x="2" y="2" width="686" height="296" rx="22" fill="#111113" stroke="#3a3a3d"/>${keys}</svg>`;
}

export function stylus() {
  const id = `s${uid++}`;
  return `<svg viewBox="0 0 420 26" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#e9e9e9"/><stop offset="1" stop-color="#a9a9a9"/></linearGradient></defs>
    <path d="M6 5h352l50 7-50 8H6a8 8 0 0 1 0-15z" fill="url(#${id})"/><path d="M358 5v15" stroke="#bdbdbd"/></svg>`;
}

export function headphones() {
  const id = `h${uid++}`;
  const cup = (cx, cy) => `<g transform="translate(${cx} ${cy})"><circle r="74" fill="#111113" stroke="#3b3b3e" stroke-width="2"/><circle r="56" fill="url(#${id})"/><circle r="38" fill="#0b0b0c" stroke="#4b4b4f"/><circle r="17" fill="#c9c9c9"/><circle r="8" fill="#1a1a1b"/></g>`;
  return `<svg viewBox="0 0 330 330" aria-hidden="true"><defs><radialGradient id="${id}"><stop offset=".55" stop-color="#242426"/><stop offset="1" stop-color="#3b3b3e"/></radialGradient></defs>
    <path d="M36 196C20 70 150 8 262 66" fill="none" stroke="#1a1a1c" stroke-width="30" stroke-linecap="round"/>
    <path d="M36 196C20 70 150 8 262 66" fill="none" stroke="#48484c" stroke-width="2" stroke-dasharray="3 7"/>${cup(112, 236)}</svg>`;
}

export function monstera() {
  const a = `m${uid++}`;
  const g = `m${uid++}`;
  const ys = [52, 84, 116, 148, 178];
  const slits = ys.map((y) => `<path d="M-6 ${y - 12}L-6 ${y + 6}L84 ${y + 28}Z"/><path d="M206 ${y - 12}L206 ${y + 6}L116 ${y + 28}Z"/>`).join('');
  const veins = ys.map((y) => `<path d="M100 ${y + 36}Q60 ${y + 24} 14 ${y + 24}M100 ${y + 36}Q140 ${y + 24} 186 ${y + 24}"/>`).join('');
  return `<svg viewBox="0 0 200 240" aria-hidden="true"><defs>
    <linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4f9a55"/><stop offset=".55" stop-color="#2f7a3f"/><stop offset="1" stop-color="#1a5230"/></linearGradient>
    <mask id="${a}"><path d="M100 232C40 216 4 150 12 95 18 45 60 10 100 8c40 2 82 37 88 87 8 55-28 121-88 137z" fill="#fff"/><g fill="#000">${slits}</g></mask></defs>
    <g mask="url(#${a})"><rect width="200" height="240" fill="url(#${g})"/><g fill="none" stroke="#9fd29a" stroke-opacity=".28" stroke-width="1.4">${veins}</g></g>
    <path d="M100 10V238" stroke="#a8dba0" stroke-opacity=".5" stroke-width="2"/></svg>`;
}

export function plant(n = 15) {
  const g = `p${uid++}`;
  let leaves = '';
  for (let i = 0; i < n; i += 1) {
    const ang = (i * 137.5) % 360;
    const dist = 22 + (i / n) * 72;
    const s = 1.15 - (i / n) * 0.35;
    leaves += `<g transform="rotate(${ang} 120 120) translate(120 ${120 - dist}) scale(${s})"><path d="M0 22C-22 12-22-16 0-26 22-16 22 12 0 22z" fill="url(#${g})" stroke="#0f2b20" stroke-opacity=".6"/><path d="M0 20V-22" stroke="#bfe6cf" stroke-opacity=".45"/></g>`;
  }
  return `<svg viewBox="0 0 240 240" aria-hidden="true"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6fb596"/><stop offset="1" stop-color="#2c6a50"/></linearGradient></defs>${leaves}</svg>`;
}

const glyph = {
  mail: '<path d="M4 7h16v10H4z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m4 8 8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.8"/>',
  github: '<path fill="currentColor" d="M12 3.5a8.6 8.6 0 0 0-2.7 16.8c.4.1.6-.2.6-.4v-1.5c-2.4.5-2.9-1-2.9-1-.4-1-1-1.3-1-1.3-.8-.5 0-.5 0-.5.9.1 1.3.9 1.3.9.8 1.3 2 1 2.5.7.1-.6.3-1 .6-1.2-1.9-.2-3.9-1-3.9-4.2 0-.9.3-1.7.9-2.3-.1-.2-.4-1.1.1-2.2 0 0 .7-.2 2.3.9a8 8 0 0 1 4.2 0c1.6-1.1 2.3-.9 2.3-.9.5 1.1.2 2 .1 2.2.5.6.9 1.4.9 2.3 0 3.3-2 4-3.9 4.2.3.3.6.8.6 1.6v2.4c0 .2.2.5.6.4A8.6 8.6 0 0 0 12 3.5z"/>',
  linkedin: '<path fill="currentColor" d="M6.9 9.2H4V20h2.9V9.2zM5.4 4A1.7 1.7 0 1 0 5.4 7.4 1.7 1.7 0 0 0 5.4 4zM20 13.8c0-3-1.6-4.8-4-4.8-1.300 0-2.200.7-2.700 1.500V9.200H10.500V20h2.900v-5.600c0-1.500.700-2.500 2-2.500s1.800.9 1.800 2.500V20H20v-6.200z"/>',
};
export const icon = (name) => `<span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16">${glyph[name]}</svg></span>`;
