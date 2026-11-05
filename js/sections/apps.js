import { APPS, OTHERS, UI } from '../data.js';
import { T, arrow, arrowOwner, ext, pad, sectionHead } from '../shared.js';

/* The vitrine: a lit case with one fixed spotlight. Apps slide along a ledge, and the one under
   the light steps forward and opens its screenshots from behind it. Every value is derived from
   the slot's distance to the centre, so the same motion works for touch, wheel, drag and keyboard. */

/* Lead app in the middle, the rest alternating outward, so the case opens balanced on both sides. */
const SHELF = APPS.reduce((list, a, i) => { if (i % 2) list.push(a); else list.unshift(a); return list; }, []);
const START = SHELF.indexOf(APPS[0]);

const front = (a) => a.images.length
  ? `<span class="front"><img src="${a.images[0]}" alt="" draggable="false" loading="lazy"></span>
     <span class="medal gloss"><img src="${a.icon}" alt="" draggable="false" loading="lazy" width="64" height="64"></span>`
  : `<span class="front mark"><span class="mark-line"></span><span class="medal gloss"><img src="${a.icon}" alt="" draggable="false" loading="lazy" width="128" height="128"></span></span>`;

const wing = (src, side) => (src ? `<span class="wing" style="--side:${side}"><img src="${src}" alt="" draggable="false" loading="lazy"></span>` : '');

const slot = (a, i) => `<li class="slot" style="--rank:${Math.abs(i - START)}">
  <button class="piece" type="button" data-open="${a.id}">
    <span class="stand"><span class="fan">${wing(a.images[2], -1)}${wing(a.images[1], 1)}${front(a)}</span></span>
    <span class="cap"><b>${T(a.name)}</b><small>${T(a.tag)}</small></span>
  </button>
</li>`;

const plaque = (a, i) => `<article class="plaque${i === START ? ' on' : ''}">
  <h3>${T(a.name)}</h3>
  <p class="plaque-tag">${T(a.tag)}</p>
  ${a.proof ? `<p class="plaque-stat"><small>${T(a.proof.over)}</small> <b>${T(a.proof.value)}</b> <span>${T(a.proof.label)}</span></p>` : ''}
  <p class="plaque-text">${T(a.simple)}</p>
  <p class="plaque-acts">
    <button class="btn" type="button" data-open="${a.id}">${T(UI.more)}</button>
    ${a.links.map((l) => `<a class="btn ghost" href="${l.url}" ${ext}>${T(UI.link[l.kind])} ${arrow}</a>`).join('')}
  </p>
</article>`;

const dockKey = (a, i) => `<li><button class="key" type="button" data-go="${i}" aria-label="${T(a.name)}" tabindex="${i === START ? 0 : -1}"${i === START ? ' aria-current="true"' : ''}>
  <span class="medal gloss"><img src="${a.icon}" alt="" draggable="false" loading="lazy" width="64" height="64"></span>
</button></li>`;

export function render() {
  return `<section class="band alt" id="apps">
    ${sectionHead(UI.appsKicker, UI.appsTitle)}
    <div class="vitrine">
      <span class="beam" aria-hidden="true"></span>
      <span class="ledge" aria-hidden="true"></span>
      <ul class="shelf" aria-label="${T(UI.appsTitle)}">${SHELF.map(slot).join('')}</ul>
    </div>
    <div class="counter">
      <div class="plaques">${SHELF.map(plaque).join('')}</div>
      <ul class="dock" aria-label="${T(UI.nav.apps)}">${SHELF.map(dockKey).join('')}</ul>
    </div>
    <div class="others">
      ${sectionHead(UI.othersKicker, UI.othersTitle)}
      <ol class="index">${OTHERS.map((o, i) => `<li class="reveal" style="--d:${i * 90}ms">
        <span class="idx" aria-hidden="true">${pad(i + 1)}</span>
        <div class="entry">
          <h3>${T(o.name)}</h3>
          <p class="entry-tag">${T(o.tag)}</p>
        </div>
        <p class="entry-text">${T(o.simple)}</p>
        ${o.url ? `<a class="entry-link" href="${o.url}" ${ext}>${T(UI.link.repo)} ${arrow}</a>` : ''}
      </li>`).join('')}</ol>
    </div>
  </section>`;
}

export function init() {
  const root = document.getElementById('apps');
  const vitrine = root?.querySelector('.vitrine');
  if (!vitrine) return undefined;
  const shelf = vitrine.querySelector('.shelf');
  const slots = [...shelf.children];
  const pieces = slots.map((s) => s.querySelector('.piece'));
  const plaques = [...root.querySelectorAll('.plaque')];
  const keys = [...root.querySelectorAll('.key')];
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  const off = new AbortController();
  const on = (el, type, fn, opts) => el.addEventListener(type, fn, { signal: off.signal, ...opts });
  let active = START;
  let frame = 0;
  let settle = 0;

  const setActive = (i) => {
    if (i === active) return;
    active = i;
    plaques.forEach((p, n) => p.classList.toggle('on', n === i));
    keys.forEach((k, n) => {
      k.tabIndex = n === i ? 0 : -1;
      if (n === i) k.setAttribute('aria-current', 'true'); else k.removeAttribute('aria-current');
    });
  };

  const offset = (i) => {
    const a = shelf.getBoundingClientRect();
    const b = slots[i].getBoundingClientRect();
    return (b.left + b.width / 2) - (a.left + a.width / 2);
  };

  const measure = () => {
    frame = 0;
    let nearest = active;
    let least = Infinity;
    slots.forEach((s, i) => {
      const d = offset(i);
      if (Math.abs(d) < least) { least = Math.abs(d); nearest = i; }
      const t = Math.max(0, 1 - Math.abs(d) / s.offsetWidth);
      s.style.setProperty('--f', (t * t * (3 - 2 * t)).toFixed(3));
      s.style.setProperty('--s', Math.max(-1, Math.min(1, d / s.offsetWidth)).toFixed(3));
    });
    if (calm.matches) slots.forEach((s, i) => s.style.setProperty('--f', i === nearest ? 1 : 0));
    slots.forEach((s, i) => { s.style.zIndex = i === nearest ? 2 : 1; });
    setActive(nearest);
  };
  const queue = () => { if (!frame) frame = requestAnimationFrame(measure); };

  const goTo = (i, smooth = true) => shelf.scrollBy({ left: offset(i), behavior: smooth && !calm.matches ? 'smooth' : 'instant' });

  goTo(START, false);
  measure();
  on(shelf, 'scroll', queue, { passive: true });

  /* Keep the same app under the light when the case changes size. */
  let width = shelf.clientWidth;
  const resize = new ResizeObserver(() => {
    if (shelf.clientWidth === width) return;
    width = shelf.clientWidth;
    goTo(active, false);
    queue();
  });
  resize.observe(shelf);

  /* Lights come up once, when the case is properly in view. */
  const seen = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    vitrine.classList.add('awake');
    seen.disconnect();
  }, { threshold: 0.3 });
  seen.observe(vitrine);

  /* Keyboard. Arrow keys follow the screen, so they mirror with the language. */
  const step = (e, count, current, move) => {
    if (arrowOwner() !== vitrine) return;
    const forward = document.documentElement.dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const back = document.documentElement.dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    let next = null;
    if (e.key === forward) next = Math.min(count - 1, current + 1);
    else if (e.key === back) next = Math.max(0, current - 1);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = count - 1;
    if (next === null) return;
    e.preventDefault();
    move(next);
  };

  on(shelf, 'keydown', (e) => {
    const current = pieces.indexOf(e.target.closest?.('.piece'));
    if (current < 0) return;
    step(e, pieces.length, current, (n) => { pieces[n].focus({ preventScroll: true }); goTo(n); });
  });
  on(shelf, 'focusin', (e) => {
    const i = pieces.indexOf(e.target.closest?.('.piece'));
    if (i >= 0 && e.target.matches(':focus-visible')) goTo(i);
  });

  /* Arrow keys also work as soon as the case is on screen, with nothing focused first. Focus moves too, so Enter opens the app. */
  let caseSeen = false;
  const caseIo = new IntersectionObserver(([e]) => { caseSeen = e.isIntersecting; }, { threshold: 0.4 });
  caseIo.observe(vitrine);
  on(document, 'keydown', (e) => {
    if (!caseSeen || !['ArrowLeft', 'ArrowRight'].includes(e.key) || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (document.querySelector('dialog[open]') || document.documentElement.classList.contains('nav-open')) return;
    if (e.target.closest?.('input, textarea, select, [contenteditable], .shelf, .dock, #lang')) return;
    step(e, pieces.length, active, (n) => { pieces[n].focus({ preventScroll: true }); goTo(n); });
  });

  const dock = root.querySelector('.dock');
  on(dock, 'click', (e) => {
    const key = e.target.closest('.key');
    if (key) goTo(keys.indexOf(key));
  });
  on(dock, 'keydown', (e) => {
    const current = keys.indexOf(e.target.closest?.('.key'));
    if (current < 0) return;
    step(e, keys.length, current, (n) => { goTo(n); keys[n].tabIndex = 0; keys[n].focus({ preventScroll: true }); });
  });

  /* Mouse drag. Touch already scrolls natively. */
  let drag = null;
  let swallow = false;
  on(shelf, 'pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    drag = { x: e.clientX, left: shelf.scrollLeft, moved: false };
    swallow = false;
  });
  on(window, 'pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) < 6) return;
    if (!drag.moved) {
      drag.moved = true;
      clearTimeout(settle);
      shelf.classList.add('dragging');
    }
    shelf.scrollLeft = drag.left - dx;
  }, { passive: true });
  const release = () => {
    if (!drag) return;
    const { moved } = drag;
    drag = null;
    if (!moved) return;
    swallow = true;
    measure();
    goTo(active);
    settle = setTimeout(() => { shelf.classList.remove('dragging'); swallow = false; }, 420);
  };
  on(window, 'pointerup', release);
  on(window, 'pointercancel', release);
  on(shelf, 'click', (e) => {
    if (!swallow) return;
    swallow = false;
    e.preventDefault();
    e.stopPropagation();
  }, { capture: true });

  /* Light on the icons follows a fine pointer. */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    on(root, 'pointermove', (e) => {
      const glossy = e.target.closest?.('.gloss');
      if (!glossy) return;
      const r = glossy.getBoundingClientRect();
      glossy.style.setProperty('--mx', `${((e.clientX - r.left) / r.width * 100).toFixed(1)}%`);
      glossy.style.setProperty('--my', `${((e.clientY - r.top) / r.height * 100).toFixed(1)}%`);
    }, { passive: true });
  }

  return () => {
    off.abort();
    resize.disconnect();
    seen.disconnect();
    caseIo.disconnect();
    clearTimeout(settle);
    cancelAnimationFrame(frame);
  };
}
