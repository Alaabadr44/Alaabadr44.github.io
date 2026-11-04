import { SYSTEMS, APPS, UI } from '../data.js';
import { T, esc, arrow, ext, statusChip } from '../shared.js';
import { mockHTML } from './mock.js';

const dialog = document.getElementById('detail');
const ALL = [...SYSTEMS, ...APPS];

function linksHTML(p) {
  return (p.links || []).map((l) => `<a class="btn ${['site', 'login'].includes(l.kind) ? '' : 'ghost'}" href="${l.url}" ${ext}>${T(UI.link[l.kind])} ${arrow}</a>`).join('');
}

export function openDetail(id, push = true) {
  const p = ALL.find((x) => x.id === id);
  if (!p) return;
  const isPhone = APPS.includes(p);
  const gallery = p.images && p.images.length
    ? `<div class="gallery ${isPhone ? 'phones' : ''}" tabindex="0">${p.images.map((src, i) => `<a href="${src}" ${ext}><img src="${src}" alt="${T(p.name)} ${i + 1}" loading="lazy"></a>`).join('')}</div>`
      + (p.redacted ? `<p class="gallery-note">${T(UI.redactNote)}</p>` : '')
    : p.mock ? `<figure class="gallery-mock">${mockHTML(p.mock)}<figcaption>${T(UI.mockNote)}</figcaption></figure>` : '';
  dialog.innerHTML = `<div class="d-wrap">
    <button class="d-close" type="button" id="d-close">${T(UI.close)} ✕</button>
    <header>
      ${p.icon ? `<img class="d-icon" src="${p.icon}" alt="" width="64" height="64">` : ''}
      <div>
        <p class="meta">${p.status ? statusChip(p) : ''}<small>${T(p.code || p.tag)}</small></p>
        <h2 id="detail-title">${T(p.name)}</h2>
        ${p.status ? `<p class="d-tag">${T(p.tag)}</p>` : ''}
      </div>
    </header>
    ${gallery}
    <div class="d-cols">
      <div>
        <h3>${T(UI.simple)}</h3>
        <p class="d-lead">${T(p.simple)}</p>
        ${p.who ? `<h3>${T(UI.who)}</h3><p>${T(p.who)}</p>` : ''}
      </div>
      <div>
        ${p.features ? `<h3>${T(UI.features)}</h3><ul class="d-list">${p.features.map((f) => `<li>${T(f)}</li>`).join('')}</ul>` : ''}
        ${p.stack ? `<h3>${T(UI.stack)}</h3><ul class="d-stack" lang="en" dir="ltr">${p.stack.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}
      </div>
    </div>
    ${p.links ? `<div class="d-links">${linksHTML(p)}</div>` : ''}
  </div>`;
  dialog.showModal();
  dialog.scrollTop = 0;
  document.documentElement.classList.add('lock');
  if (push) history.pushState({ project: id }, '', `#p/${id}`);
}

export function closeDetail() {
  if (dialog.open) dialog.close();
}
