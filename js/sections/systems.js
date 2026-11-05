import { SYSTEMS, UI } from '../data.js';
import { T, esc, pad, pics, arrow, arrowOwner, statusChip, sectionHead } from '../shared.js';
import { mockHTML } from './mock.js';

/* Must match the @media blocks of the same purpose in css/sections/systems.css. */
const STAGE_MQ = '(min-width: 1024px) and (min-height: 620px) and (prefers-reduced-motion: no-preference)';
const FLOW_MQ = '(prefers-reduced-motion: no-preference)';
const TILT_MQ = '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

/* The pinned stage shows these systems, in this order; every other system goes to the showcase panels. */
const STAGE = ['eaten', 'fleet-run', 'hub-community', 'hr-attends', 'call-qa'];
/* A stage system shows at most this many screens. The detail dialog still has all of them. */
const STAGE_MAX = 6;
const PHONE_MQ = '(max-width: 767px)';

/* Scroll distance for one screen, in % of the viewport. A long system gets a tighter step, so no system takes more than about two screens of scrolling. */
const stepFor = (n) => (n > 1 ? Math.min(13, 160 / (n - 1)) : 0);
/* Without the pinned stage (phones, tablets): px of scroll per screen. Same clamp as .ch-space in css/sections/systems.css. */
const flowStep = (vh) => Math.min(100, Math.max(72, vh * 0.1));

/* Word-level only, so Arabic letters stay joined. A Latin name keeps its word order on the RTL page. */
const words = (field) => {
  const text = T(field);
  const html = text.split(/\s+/).map((w, i) => `<span class="w"><span style="--w:${i}">${w}</span></span>`).join(' ');
  return /[\u0600-\u06FF]/.test(text) ? html : `<span dir="ltr" class="ltr">${html}</span>`;
};

/* The picture is a pointer convenience and not focusable: the keyboard and screen-reader opener is the heading's button.
   Every screen of the system is stacked here; later ones are only fetched as the reader nears them. */
/* Desktop screens come in two widths (name-800.webp beside name.webp); phones get a portrait slide from assets/deck/m/. */
const wideSet = (src) => `${src.replace(/\.webp$/, '-800.webp')} 800w, ${src} 1600w`;
const SIZES = '(min-width: 1024px) 62vw, 100vw';
const stagePics = (p) => pics(p).slice(0, STAGE_MAX);
const shot = (src, k, phone) => {
  const now = phone ? src.replace('assets/deck/', 'assets/deck/m/') : src;
  const set = phone ? '' : wideSet(src);
  const lazy = k > 0;
  return `<img class="shot" data-d="${src}" ${lazy ? `data-src="${now}"${set ? ` data-srcset="${set}"` : ''}` : `src="${now}"${set ? ` srcset="${set}"` : ''}`}${set ? ` sizes="${SIZES}"` : ''} alt="" loading="lazy" decoding="async" ${phone ? 'width="800" height="1000"' : 'width="1200" height="750"'}>`;
};
const frame = (p, phone) => `<div class="frame" data-open="${p.id}" aria-hidden="true">
    <span class="mat"><span class="screen">${p.images
      ? stagePics(p).map((src, k) => shot(src, k, phone)).join('')
      : mockHTML(p.mock)}<span class="sheen"></span></span></span>
  </div>`;

const opener = (p) => `<h3 class="title"><button class="open" type="button" data-open="${p.id}" aria-haspopup="dialog">${words(p.name)}</button></h3>`;
const stack = (p, n) => `<p class="stack" lang="en" dir="ltr">${p.stack.slice(0, n).map(esc).join(' · ')}</p>`;
const DOWN = '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M8 3v10M3.500 8.500 8 13l4.500-4.500" fill="none" stroke="currentColor" stroke-width="1.300"/></svg>';
const go = () => `<span class="go" aria-hidden="true">${T(UI.more)} ${arrow}</span>`;

const chapter = (p, i, first, total, last, phone) => {
  const count = p.images ? stagePics(p).length : 1;
  return `
  <div class="ch${i === 0 ? ' ch-first' : ''}" style="--r:${i + 1};--count:${count};--step:${stepFor(count).toFixed(2)}svh">
    <div class="ch-visual reveal"><span class="blade" aria-hidden="true"></span>${frame(p, phone)}<span class="shade" aria-hidden="true"></span>
      ${count > 1 ? `<span class="ch-pill" dir="ltr" aria-hidden="true"><b>1</b> / ${count}</span><span class="ch-bar" aria-hidden="true"><i></i></span>` : ''}
      <button class="ch-open" type="button" data-open="${p.id}" tabindex="-1" aria-hidden="true">${T(UI.more)} ${arrow}</button>
    </div>
    <div class="ch-run"><div class="ch-text reveal${T(p.name).length > 34 ? ' ch-long' : ''}">
      <p class="ch-n" aria-hidden="true">${pad(i + first)}<small>/ ${pad(total)}</small></p>
      <p class="meta li" style="--s:0">${statusChip(p)}<small>${T(p.code)}</small></p>
      ${opener(p)}
      <p class="tag li" style="--s:2">${T(p.tag)}</p>
      <p class="desc li" style="--s:3">${T(p.simple)}</p>
      <div class="li" style="--s:4">${stack(p, 7)}</div>
      ${p.mock ? `<p class="mock-note li" style="--s:5">${T(UI.mockNote)}</p>` : ''}
      <div class="li ch-foot" style="--s:6">${go()}${last ? '' : `<button type="button" class="ch-skip" data-next="${i + 1}">${T(UI.workNext)} ${DOWN}</button>`}</div>
    </div></div>
    <span class="ch-space" aria-hidden="true"></span>
  </div>`;
};

/* The showcase: panels side by side. The one you point at, tap or tab to opens wide. */
/* Explainer slides have headings baked in, which a panel would clip and lay its own text over. These panels show a plain screen instead; the dialog keeps the slides. */
const PANEL_SHOT = { 'it-support': 'assets/shots/it-support-2.webp', drive2: 'assets/shots/drive2-11.webp' };
const panel = (p, i, before) => `
  <article class="fx${i === 0 ? ' on' : ''} reveal" style="--i:${i}">
    <div class="fx-media" data-open="${p.id}" aria-hidden="true">${p.images
      ? `<img class="fx-shot" src="${PANEL_SHOT[p.id] || pics(p)[0]}" alt="" loading="lazy" decoding="async" width="1200" height="750">`
      : mockHTML(p.mock)}</div>
    <span class="fx-shade" aria-hidden="true"></span>
    <div class="fx-rest" aria-hidden="true"><span class="num">${pad(i + before + 1)}</span><span class="fx-name">${T(p.name)}</span></div>
    <div class="fx-text">
      <p class="meta li" style="--s:0"><span class="num">${pad(i + before + 1)}</span>${statusChip(p)}<small>${T(p.code)}</small></p>
      ${opener(p)}
      <p class="tag li" style="--s:2">${T(p.tag)}</p>
      <p class="desc li" style="--s:3">${T(p.simple)}</p>
      <div class="li fx-foot" style="--s:4">${stack(p, 5)}${go()}</div>
      ${p.mock ? `<p class="mock-note li" style="--s:5">${T(UI.mockNote)}</p>` : ''}
    </div>
  </article>`;

export function render() {
  const phone = matchMedia(PHONE_MQ).matches;
  const staged = STAGE.map((id) => SYSTEMS.find((p) => p.id === id)).filter((p) => p?.images?.length);
  const rest = SYSTEMS.filter((p) => !staged.includes(p));
  const others = [...rest.filter((p) => p.images?.length), ...rest.filter((p) => !p.images?.length)];
  return `<section class="band" id="work">
    ${sectionHead(UI.workKicker, UI.workTitle, UI.workNote)}
    <div class="stage" style="--n:${staged.length}">
      <div class="rail" aria-hidden="true"><span class="rail-fill"></span>${staged.map((_, i) => `<span class="rail-n" data-next="${i}">${pad(i + 1)}</span>`).join('')}</div>
      ${staged.map((p, i) => chapter(p, i, 1, SYSTEMS.length, i === staged.length - 1, phone)).join('')}
    </div>
    <div class="fx-list" style="--n:${others.length}">${others.map((p, i) => panel(p, i, staged.length)).join('')}</div>
    <p class="fx-hint" aria-hidden="true"><kbd>←</kbd><kbd>→</kbd><span>${T(UI.workKeys)}</span></p>
  </section>`;
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));

export function init() {
  const root = document.getElementById('work');
  if (!root) return undefined;
  const stageMq = matchMedia(STAGE_MQ);
  const tiltMq = matchMedia(TILT_MQ);
  const flowMq = matchMedia(FLOW_MQ);
  const chapters = [...root.querySelectorAll('.ch')].map((el) => ({
    el,
    run: el.querySelector('.ch-run'),
    imgs: [...el.querySelectorAll('.shot')],
    openers: [...el.querySelectorAll('.frame, .ch-open')],
    pill: el.querySelector('.ch-pill b'),
    bar: el.querySelector('.ch-bar i'),
    s: -1,
    sTar: 0,
    stepPx: 1,
    idx: 0,
    near: false,
    text: el.querySelector('.ch-text'),
    visual: el.querySelector('.ch-visual'),
    blade: el.querySelector('.blade'),
    shade: el.querySelector('.shade'),
    cur: -1,
    tar: 0,
  }));
  const notches = [...root.querySelectorAll('.rail-n')];
  const stage = root.querySelector('.stage');
  let raf = 0;
  let onScreen = false;
  let active = -1;
  const tilt = { el: null, x: 0, y: 0, tx: 0, ty: 0, mx: 50, my: 50 };

  const clearStage = () => {
    chapters.forEach((c) => {
      c.visual.style.clipPath = '';
      c.visual.style.transform = '';
      c.visual.style.visibility = '';
      c.blade.style.cssText = '';
      c.shade.style.opacity = '';
      c.text.classList.remove('is-active');
      c.visual.classList.remove('is-active');
      c.cur = -1;
      c.s = -1;
      c.sTar = 0;
    });
    notches.forEach((n) => n.classList.remove('on'));
    active = -1;
  };

  /* One new project passes over the last, along a green blade, as its text climbs the page. */
  function measure() {
    const vh = innerHeight;
    chapters.forEach((c, i) => {
      const r = c.run.getBoundingClientRect();
      c.tar = i === 0 ? 1 : clamp01((vh * 0.84 - r.top) / (vh * 0.4));
      c.stepPx = (vh * stepFor(c.imgs.length)) / 100;
      c.sTar = Math.max(0, Math.min((c.imgs.length - 1) * c.stepPx, vh * 0.44 - r.top));
      c.near = r.top < vh * 2 && r.bottom > -vh;
    });
  }

  /* Without the pinned stage the tray sticks inside its own chapter, and the distance left there is the timeline. */
  function measureFlow() {
    const vh = innerHeight;
    chapters.forEach((c) => {
      const box = c.el.getBoundingClientRect();
      const tray = c.visual.getBoundingClientRect();
      c.stepPx = flowStep(vh);
      const run = (c.imgs.length - 1) * c.stepPx;
      c.sTar = Math.max(0, Math.min(run, run - (box.bottom - tray.bottom - vh * 0.12))); // the last screen holds for a moment
      c.near = box.top < vh * 2 && box.bottom > -vh;
    });
  }

  /* A screen is fetched and decoded ahead of the reader, so a fast scroll never lands on a blank one. */
  function fetchShot(im) {
    if (!im.dataset.src) return;
    im.loading = 'eager';
    if (im.dataset.srcset) im.srcset = im.dataset.srcset;
    im.src = im.dataset.src;
    delete im.dataset.src;
    delete im.dataset.srcset;
    im.decode().then(() => { im.dataset.ready = '1'; schedule(); }, () => {});
  }

  /* The scroll picks the screen; the change itself is a short fade, so it stays smooth at any speed. */
  function paintShots() {
    chapters.forEach((c) => {
      const last = c.imgs.length - 1;
      if (last < 1 || !c.near) return;
      const target = Math.min(last, Math.round(c.sTar / c.stepPx));
      for (let k = Math.max(1, target - 1); k <= Math.min(last, target + 6); k += 1) fetchShot(c.imgs[k]);
      let shown = 0;
      for (let k = 1; k <= last; k += 1) {
        const on = k <= target && c.imgs[k].dataset.ready === '1';
        c.imgs[k].classList.toggle('on', on);
        if (on) shown = k;
      }
      if (shown !== c.idx) {
        c.idx = shown;
        c.pill.textContent = shown + 1;
        c.openers.forEach((el) => { el.dataset.at = shown; });
      }
      if (c.sTar !== c.s) {
        c.s = c.sTar;
        c.bar.style.transform = `scaleX(${(c.s / (last * c.stepPx)).toFixed(4)})`;
      }
    });
    return false;
  }

  function jump(i) {
    const c = chapters[i];
    if (!c) return;
    const top = stageMq.matches
      ? c.run.getBoundingClientRect().top - innerHeight * 0.44 + 1
      : c.el.getBoundingClientRect().top - 90;
    scrollTo({ top: scrollY + top, behavior: flowMq.matches ? 'smooth' : 'auto' });
  }

  function paint() {
    const sign = document.documentElement.dir === 'rtl' ? -1 : 1;
    let moving = false;
    chapters.forEach((c, i) => {
      const prev = c.cur;
      c.cur = prev < 0 ? c.tar : prev + (c.tar - prev) * 0.17;
      if (Math.abs(c.tar - c.cur) < 0.001) c.cur = c.tar; else moving = true;
      if (c.cur === prev) return;
      if (i > 0) {
        const hide = (1 - c.cur) * 100;
          c.visual.style.clipPath = c.cur === 1 ? 'none'
          : (sign > 0 ? `inset(-4rem -4rem -4rem ${hide}%)` : `inset(-4rem ${hide}% -4rem -4rem)`);
        c.blade.style.transform = `translateX(${sign * hide}%)`;
        c.blade.style.opacity = Math.sin(Math.PI * c.cur).toFixed(3);
      }
      /* What is being passed over sinks back a little. */
      const out = chapters[i - 1];
      if (out) {
        out.visual.style.transform = c.cur > 0 ? `translateX(${(-sign * c.cur * 2.4).toFixed(2)}%) scale(${(1 - c.cur * 0.03).toFixed(4)})` : '';
        out.shade.style.opacity = (c.cur * 0.62).toFixed(3);
      }
    });
    /* Not yet reached, or fully covered: skip painting it, and keep it from peeking past the tray. */
    chapters.forEach((c, i) => {
      const covered = chapters[i + 1]?.cur === 1;
      c.visual.style.visibility = c.cur === 0 || covered ? 'hidden' : 'visible';
    });
    let now = 0;
    chapters.forEach((c, i) => { if (c.tar >= 0.5) now = i; });
    if (now !== active) {
      active = now;
      chapters.forEach((c, i) => {
        c.text.classList.toggle('is-active', i === now);
        c.visual.classList.toggle('is-active', i === now);
      });
      notches.forEach((n, i) => n.classList.toggle('on', i <= now));
    }
    const box = stage.getBoundingClientRect();
    stage.style.setProperty('--progress', clamp01((innerHeight * 0.5 - box.top) / box.height).toFixed(4));
    return moving;
  }

  function paintTilt() {
    if (!tilt.el) return false;
    tilt.x += (tilt.tx - tilt.x) * 0.12;
    tilt.y += (tilt.ty - tilt.y) * 0.12;
    const settled = Math.abs(tilt.tx - tilt.x) < 0.002 && Math.abs(tilt.ty - tilt.y) < 0.002;
    const s = tilt.el.style;
    s.setProperty('--ry', `${(tilt.x * 3.2).toFixed(3)}deg`);
    s.setProperty('--rx', `${(-tilt.y * 2.6).toFixed(3)}deg`);
    s.setProperty('--mx', `${tilt.mx.toFixed(1)}%`);
    s.setProperty('--my', `${tilt.my.toFixed(1)}%`);
    if (settled && tilt.tx === 0 && tilt.ty === 0) {
      ['--ry', '--rx'].forEach((k) => s.removeProperty(k));
      tilt.el = null;
      return false;
    }
    return !settled;
  }

  function tick() {
    raf = 0;
    if (!onScreen) return;
    let more = false;
    if (stageMq.matches) { measure(); more = paint(); }
    else if (flowMq.matches) measureFlow();
    if (flowMq.matches && paintShots()) more = true;
    if (paintTilt()) more = true;
    if (more) schedule();
  }
  function schedule() { if (!raf && onScreen) raf = requestAnimationFrame(tick); }

  /* Runs only while the section is on screen, and only while something still has to move. */
  const seen = new IntersectionObserver(([e]) => {
    onScreen = e.isIntersecting;
    root.classList.toggle('mocks-off', !onScreen);
    if (onScreen) schedule();
    else if (raf) { cancelAnimationFrame(raf); raf = 0; }
  }, { rootMargin: '15% 0px' });
  seen.observe(root);

  /* Screens behind a closed clip-path are not fetched early by native lazy loading: fetch them as the stage nears. */
  const near = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    near.disconnect();
    stage.querySelectorAll('.shot[loading="lazy"]').forEach((img) => { img.loading = 'eager'; });
  }, { rootMargin: '100% 0px' });
  near.observe(stage);

  /* Reduced motion shows every screen as a plain stacked list. */
  const loadAll = () => {
    if (flowMq.matches) return;
    root.querySelectorAll('.shot[data-src]').forEach((im) => {
      if (im.dataset.srcset) im.srcset = im.dataset.srcset;
      im.src = im.dataset.src;
      delete im.dataset.src;
      delete im.dataset.srcset;
    });
  };
  loadAll();

  /* Phones get portrait slides, other widths the landscape ones. Crossing the breakpoint swaps them in place. */
  const phoneMq = matchMedia(PHONE_MQ);
  const onPhone = () => {
    const phone = phoneMq.matches;
    root.querySelectorAll('.stage .shot').forEach((im) => {
      const d = im.dataset.d;
      const src = phone ? d.replace('assets/deck/', 'assets/deck/m/') : d;
      const set = phone ? '' : wideSet(d);
      im.width = phone ? 800 : 1200;
      im.height = phone ? 1000 : 750;
      if (set) im.sizes = SIZES; else im.removeAttribute('sizes');
      if ('src' in im.dataset) {
        im.dataset.src = src;
        if (set) im.dataset.srcset = set; else delete im.dataset.srcset;
      } else {
        if (set) im.srcset = set; else im.removeAttribute('srcset');
        im.src = src;
        delete im.dataset.ready;
        im.decode().then(() => { im.dataset.ready = '1'; schedule(); }, () => {});
      }
    });
    schedule();
  };
  phoneMq.addEventListener('change', onPhone);

  const onStageChange = () => {
    clearStage();
    schedule();
  };

  function onPointerMove(e) {
    const el = e.target.closest?.('.frame');
    if (!el) return;
    if (tilt.el && tilt.el !== el) tilt.el.style.cssText = '';
    if (tilt.el !== el) { tilt.el = el; tilt.x = 0; tilt.y = 0; }
    const r = el.getBoundingClientRect();
    const px = clamp01((e.clientX - r.left) / r.width);
    const py = clamp01((e.clientY - r.top) / r.height);
    tilt.tx = px * 2 - 1;
    tilt.ty = py * 2 - 1;
    tilt.mx = px * 100;
    tilt.my = py * 100;
    schedule();
  }
  function onPointerOut(e) {
    const el = e.target.closest?.('.frame');
    if (!el || el.contains(e.relatedTarget) || el !== tilt.el) return;
    tilt.tx = 0;
    tilt.ty = 0;
    schedule();
  }
  /* A click on the picture acts on the heading's button, so closing the dialog returns focus there. */
  function onFrameClick(e) {
    const next = e.target.closest('[data-next]');
    if (next) {
      const to = Number(next.dataset.next);
      if (next.classList.contains('ch-skip')) chapters[to]?.text.querySelector('.open').focus({ preventScroll: true });
      jump(to);
      return;
    }
    e.target.closest('.frame, .fx-media, .ch-open')?.closest('.ch, .fx')?.querySelector('.open').focus({ preventScroll: true });
  }

  /* Showcase: hover or keyboard focus opens a panel at once. A tap on a closed panel opens it
     first, and only a tap on the open one reaches the project dialog. */
  const list = root.querySelector('.fx-list');
  const panels = [...list.querySelectorAll('.fx')];
  const wide = matchMedia('(min-width: 1024px)');
  const select = (el) => panels.forEach((p) => p.classList.toggle('on', p === el));
  const fxAc = new AbortController();
  /* Real movement only: a resting cursor must not steal the panel when the layout shifts under it. */
  let lastX = -1;
  let lastY = -1;
  list.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || (e.clientX === lastX && e.clientY === lastY)) return;
    lastX = e.clientX;
    lastY = e.clientY;
    const el = e.target.closest('.fx');
    if (el && !el.classList.contains('on')) select(el);
  }, { signal: fxAc.signal });
  list.addEventListener('focusin', (e) => { const el = e.target.closest('.fx'); if (el) select(el); }, { signal: fxAc.signal });
  list.addEventListener('click', (e) => {
    const el = e.target.closest('.fx');
    if (el && wide.matches && !el.classList.contains('on')) { select(el); e.stopPropagation(); }
  }, { signal: fxAc.signal });

  /* Arrow keys work as soon as the showcase is on screen, with nothing focused first. They follow
     what is on screen: in Arabic the next panel sits to the left. Focus moves too, so Enter opens it. */
  let listSeen = false;
  const listIo = new IntersectionObserver(([e]) => { listSeen = e.isIntersecting; }, { threshold: 0.4 });
  listIo.observe(list);
  document.addEventListener('keydown', (e) => {
    if (!listSeen || !wide.matches || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (document.querySelector('dialog[open]') || document.documentElement.classList.contains('nav-open')) return;
    const here = e.target.closest?.('input, textarea, select, [contenteditable], #lang');
    if (here || arrowOwner() !== list) return;
    const rtl = document.documentElement.dir === 'rtl';
    const cur = panels.findIndex((p) => p.classList.contains('on'));
    const to = { [rtl ? 'ArrowLeft' : 'ArrowRight']: cur + 1, [rtl ? 'ArrowRight' : 'ArrowLeft']: cur - 1, Home: 0, End: panels.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    const el = panels[(to + panels.length) % panels.length];
    select(el);
    el.querySelector('.open').focus({ preventScroll: true });
  }, { signal: fxAc.signal });

  const useTilt = tiltMq.matches;
  root.addEventListener('click', onFrameClick);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  stageMq.addEventListener('change', onStageChange);
  if (useTilt) {
    root.addEventListener('pointermove', onPointerMove);
    root.addEventListener('pointerout', onPointerOut);
  }

  return () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    onScreen = false;
    fxAc.abort();
    listIo.disconnect();
    seen.disconnect();
    near.disconnect();
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    stageMq.removeEventListener('change', onStageChange);
    phoneMq.removeEventListener('change', onPhone);
    root.removeEventListener('click', onFrameClick);
    if (useTilt) {
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerout', onPointerOut);
    }
  };
}
