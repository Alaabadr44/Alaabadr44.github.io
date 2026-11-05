import { UI } from '../data.js';
import { VOICES } from '../voices.js';
import { T, esc, state } from '../shared.js';

/* Signature: a quiet stage. One colleague speaks at a time while a thin ring runs around
   their portrait and hands over to the next. Below it, more voices drift by on a slow rail.
   The Arabic comment is verbatim. On the English page a plain translation comes first,
   labelled, with the original Arabic beneath it at a smaller size. */
const en = () => state.lang === 'en';
const quote = (v) => (en()
  ? `<p class="vo-en" lang="en" dir="ltr"><span class="vo-tag">Translated</span>${esc(v.en)}</p>
    <blockquote class="vo-src" lang="ar" dir="rtl">${esc(v.text)}</blockquote>`
  : `<blockquote lang="ar" dir="rtl">${esc(v.text)}</blockquote>`);

const author = (v, tag = 'p') => `<${tag} class="vo-by">
    <img src="${v.photo}" alt="" width="72" height="72" loading="lazy">
    <span><bdi class="vo-name" lang="en" dir="ltr">${esc(v.name)}</bdi><small lang="en" dir="ltr">${esc(v.title)}</small></span>
  </${tag}>`;

const card = (v) => `<figure class="vo-card" dir="${en() ? 'ltr' : 'rtl'}">
    ${quote(v)}
    <figcaption>${author(v, 'span')}</figcaption>
  </figure>`;

export function render() {
  const { featured, more } = VOICES;
  return `<section class="band" id="voices">
    <div class="head reveal"><p class="pill">${T(UI.voicesKicker)}</p><h2>${T(UI.voicesTitle)}</h2><p class="note">${T(UI.voicesNote)}</p></div>
    <div class="vo-stage reveal">
      <span class="vo-mark" aria-hidden="true">”</span>
      <div class="vo-panels">
        ${featured.map((v, i) => `<figure class="vo-panel${i === 0 ? ' on' : ''}" data-i="${i}" dir="${en() ? 'ltr' : 'rtl'}">
          ${quote(v)}
          <figcaption>${author(v, 'span')}</figcaption>
        </figure>`).join('')}
      </div>
      <div class="vo-picks">
        ${featured.map((v, i) => `<button type="button" class="vo-pick${i === 0 ? ' on' : ''}" data-i="${i}" aria-pressed="${i === 0}" aria-label="${esc(v.name)}">
          <img src="${v.photo}" alt="" width="64" height="64" loading="lazy">
          <svg viewBox="0 0 100 100" aria-hidden="true"><circle pathLength="1" cx="50" cy="50" r="48"/></svg>
        </button>`).join('')}
      </div>
    </div>
    <div class="vo-rail reveal">
      <div class="vo-track">
        <div class="vo-set">${more.map(card).join('')}</div>
        <div class="vo-set vo-copy" aria-hidden="true">${more.map(card).join('')}</div>
      </div>
    </div>
    <div class="vo-tools reveal"><button type="button" class="vo-toggle" aria-pressed="false">${T(UI.voicesPause)}</button></div>
  </section>`;
}

export function init() {
  const section = document.getElementById('voices');
  if (!section) return undefined;
  const panels = [...section.querySelectorAll('.vo-panel')];
  const picks = [...section.querySelectorAll('.vo-pick')];
  const toggle = section.querySelector('.vo-toggle');
  const ac = new AbortController();
  const { signal } = ac;
  let auto = true;

  const show = (i) => {
    panels.forEach((p, n) => p.classList.toggle('on', n === i));
    picks.forEach((b, n) => {
      b.classList.toggle('on', n === i);
      b.setAttribute('aria-pressed', n === i);
    });
  };
  const stopAuto = () => { auto = false; section.classList.add('vo-manual'); };

  picks.forEach((b, i) => b.addEventListener('click', () => { stopAuto(); show(i); }, { signal }));
  /* The ring's animation is the timer, so hover, focus and offscreen pauses need no JS clock. */
  section.querySelector('.vo-picks').addEventListener('animationend', (e) => {
    if (!auto || !e.target.closest('.vo-pick.on')) return;
    show((picks.indexOf(e.target.closest('.vo-pick')) + 1) % picks.length);
  }, { signal });

  toggle.addEventListener('click', () => {
    const paused = section.classList.toggle('vo-paused');
    toggle.setAttribute('aria-pressed', paused);
    toggle.textContent = paused ? UI.voicesPlay[document.documentElement.lang] : UI.voicesPause[document.documentElement.lang];
  }, { signal });

  const io = new IntersectionObserver(([e]) => section.classList.toggle('vo-off', !e.isIntersecting));
  io.observe(section);
  return () => { ac.abort(); io.disconnect(); };
}
