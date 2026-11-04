import { PROFILE, SYSTEMS, APPS, OTHERS, CAREER, SKILLS, UI } from './data.js';

const app = document.getElementById('app');
const dialog = document.getElementById('detail');
let lang = new URLSearchParams(location.search).get('lang') || localStorage.getItem('lang') || 'ar';
if (lang !== 'ar' && lang !== 'en') lang = 'ar';

const L = (field) => field[lang];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const T = (field) => esc(L(field));
const pad = (n) => String(n).padStart(2, '0');
const ALL = [...SYSTEMS, ...APPS];
const ext = 'target="_blank" rel="noopener"';

const arrow = '<svg class="arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 13 13 3M6 3h7v7" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>';

/* Illustrations for private systems: real feature labels, abstract data, no real records. */
const bars = (n) => Array.from({ length: n }, (_, i) => `<i style="--h:${28 + ((i * 37 + 19) % 66)}%"></i>`).join('');
const lines = (n) => Array.from({ length: n }, (_, i) => `<span class="ln" style="--w:${52 + ((i * 29) % 44)}%"></span>`).join('');

function mockHTML(m) {
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

const visual = (p) => (p.images
  ? `<img src="${p.images[0]}" alt="${T(p.name)}" loading="lazy" width="1200" height="750">`
  : mockHTML(p.mock));

const statusChip = (p) => `<span class="chip chip-${p.status}">${T(UI.status[p.status])}</span>`;

function header() {
  const n = UI.nav;
  return `<header class="top" id="top-bar">
    <a class="mark" href="#home" aria-label="${T(PROFILE.name)}">${lang === 'ar' ? 'ع' : 'A'}<span>·</span>${lang === 'ar' ? 'ب' : 'B'}</a>
    <nav aria-label="Main">
      <a href="#work">${T(n.work)}</a><a href="#apps">${T(n.apps)}</a><a href="#skills">${T(n.skills)}</a><a href="#career">${T(n.career)}</a>
    </nav>
    <div class="top-end">
      <button class="lang" id="lang" type="button" lang="${lang === 'ar' ? 'en' : 'ar'}">${T(UI.langLabel)}</button>
      <a class="btn-mini" href="#contact">${T(n.contact)}</a>
    </div>
  </header>`;
}

function hero() {
  const live = SYSTEMS.filter((s) => s.status === 'live').length;
  const stats = [
    [APPS.length, UI.stats.apps],
    [SYSTEMS.length, UI.stats.systems],
    [live, UI.stats.live],
    [2021, UI.stats.since],
  ];
  return `<section class="hero" id="home">
    <div class="hero-photo"><img src="assets/alaa.webp" alt="${T(PROFILE.fullName)}" width="640" height="641"></div>
    <div class="hero-text">
      <p class="kicker rise" style="--d:.1s">${T(UI.eyebrow)}</p>
      <h1 class="rise" style="--d:.2s">${L(UI.headline)}</h1>
      <p class="who rise" style="--d:.35s"><strong>${T(PROFILE.fullName)}</strong><span>${T(PROFILE.role)}</span></p>
      <p class="intro rise" style="--d:.45s">${T(UI.intro)}</p>
      <div class="cta rise" style="--d:.55s">
        <a class="btn" href="#work">${T(UI.cta)}</a>
        <a class="btn ghost" href="#contact">${T(UI.ctaContact)}</a>
      </div>
    </div>
    <dl class="stats rise" style="--d:.7s">${stats.map(([v, l]) => `<div><dt>${T(l)}</dt><dd>${v}</dd></div>`).join('')}</dl>
  </section>`;
}

const sectionHead = (kicker, title, note) => `<div class="head reveal"><p class="kicker">${T(kicker)}</p><h2>${T(title)}</h2>${note ? `<p class="note">${T(note)}</p>` : ''}</div>`;

function systems() {
  const featured = SYSTEMS.filter((s) => s.featured);
  const rest = SYSTEMS.filter((s) => !s.featured);
  return `<section class="band" id="work">
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

function apps() {
  return `<section class="band alt" id="apps">
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

function skills() {
  return `<section class="band" id="skills">
    ${sectionHead(UI.skillsKicker, UI.skillsTitle)}
    <div class="skills">${SKILLS.map((s, i) => `<article class="reveal">
      <span class="num">${pad(i + 1)}</span>
      <h3>${T(s.title)}</h3>
      <p>${T(s.body)}</p>
      <ul lang="en" dir="ltr">${s.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    </article>`).join('')}</div>
  </section>`;
}

function career() {
  return `<section class="band alt" id="career">
    ${sectionHead(UI.careerKicker, UI.careerTitle)}
    <ol class="career">${CAREER.map((c) => `<li class="reveal">
      <span class="when">${T(c.from)} – ${T(c.to)}</span>
      <b lang="en" dir="ltr">${esc(c.co)}</b>
      <span>${T(c.role)}</span>
    </li>`).join('')}</ol>
    <p class="edu reveal">${T(UI.edu)}</p>
  </section>`;
}

function contact() {
  return `<section class="contact" id="contact">
    <p class="kicker reveal">${T(UI.contactKicker)}</p>
    <h2 class="reveal">${T(UI.contactTitle)}</h2>
    <p class="reveal">${T(UI.contactBody)}</p>
    <a class="mail reveal" href="mailto:${PROFILE.email}" dir="ltr">${PROFILE.email}</a>
    <div class="social reveal">
      <a href="${PROFILE.linkedin}" ${ext}>LinkedIn ${arrow}</a>
      <a href="${PROFILE.github}" ${ext}>GitHub ${arrow}</a>
      <span>${T(PROFILE.city)}</span>
    </div>
    <footer><span>© ${new Date().getFullYear()} ${T(PROFILE.name)}. ${T(UI.rights)}</span><a href="#home">${T(UI.top)}</a></footer>
  </section>`;
}

function linksHTML(p) {
  return (p.links || []).map((l) => `<a class="btn ${['site', 'login'].includes(l.kind) ? '' : 'ghost'}" href="${l.url}" ${ext}>${T(UI.link[l.kind])} ${arrow}</a>`).join('');
}

function openDetail(id, push = true) {
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

function closeDetail() {
  if (dialog.open) dialog.close();
}

function render() {
  const html = document.documentElement;
  html.lang = lang;
  html.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.title = `${L(PROFILE.name)} | ${L(PROFILE.role)}`;
  app.innerHTML = header() + hero() + systems() + apps() + skills() + career() + contact();
  observe();
}

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
    lang = lang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('lang', lang);
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
  document.getElementById('top-bar')?.classList.toggle('solid', scrollY > 40);
}, { passive: true });

render();
if (location.hash.startsWith('#p/')) openDetail(location.hash.slice(3), false);
