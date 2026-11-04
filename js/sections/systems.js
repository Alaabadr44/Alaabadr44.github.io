import { SYSTEMS, UI } from '../data.js';
import { plant } from '../deco.js';
import { T, esc, pad, arrow, statusChip, sectionHead } from '../shared.js';
import { mockHTML } from './mock.js';

/* Must match the @media blocks of the same purpose in css/sections/systems.css. */
const STAGE_MQ = '(min-width: 1024px) and (min-height: 620px) and (prefers-reduced-motion: no-preference)';
const TILT_MQ = '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

/* Word-level only, so Arabic letters stay joined. A Latin name keeps its word order on the RTL page. */
const words = (field) => {
  const text = T(field);
  const html = text.split(/\s+/).map((w, i) => `<span class="w"><span style="--w:${i}">${w}</span></span>`).join(' ');
  return /[\u0600-\u06FF]/.test(text) ? html : `<span dir="ltr" class="ltr">${html}</span>`;
};

/* The picture is a pointer convenience and not focusable: the keyboard and screen-reader opener is the heading's button. */
const frame = (p) => `<div class="frame" data-open="${p.id}" aria-hidden="true"${p.images?.[1] ? ` data-alt="${p.images[1]}"` : ''}>
    <span class="mat"><span class="screen">${p.images
      ? `<img class="shot" src="${p.images[0]}" alt="" loading="lazy" decoding="async" width="1200" height="750">`
      : mockHTML(p.mock)}<span class="sheen"></span></span></span>
  </div>`;

const opener = (p) => `<h3 class="title"><button class="open" type="button" data-open="${p.id}" aria-haspopup="dialog">${words(p.name)}</button></h3>`;
const stack = (p, n) => `<p class="stack" lang="en" dir="ltr">${p.stack.slice(0, n).map(esc).join(' · ')}</p>`;
const go = `<span class="go" aria-hidden="true">${T(UI.more)} ${arrow}</span>`;

const chapter = (p, i, total) => `
  <div class="ch${i === 0 ? ' ch-first' : ''}" style="--r:${i + 1}">
    <div class="ch-visual reveal"><span class="blade" aria-hidden="true"></span>${frame(p)}<span class="shade" aria-hidden="true"></span></div>
    <div class="ch-text reveal">
      <p class="ch-n" aria-hidden="true">${pad(i + 1)}<small>/ ${pad(total)}</small></p>
      <p class="meta li" style="--s:0">${statusChip(p)}<small>${T(p.code)}</small></p>
      ${opener(p)}
      <p class="tag li" style="--s:2">${T(p.tag)}</p>
      <p class="desc li" style="--s:3">${T(p.simple)}</p>
      <div class="li" style="--s:4">${stack(p, 7)}</div>
      ${p.mock ? `<p class="mock-note li" style="--s:5">${T(UI.mockNote)}</p>` : ''}
      <div class="li" style="--s:6">${go}</div>
    </div>
  </div>`;

const piece = (p, i) => `
  <div class="arc arc-${i + 1} reveal">
    <div class="arc-visual">${frame(p)}</div>
    <div class="arc-text">
      <p class="meta li" style="--s:0"><span class="num">${pad(i + 5)}</span>${statusChip(p)}<small>${T(p.code)}</small></p>
      ${opener(p)}
      <p class="tag li" style="--s:2">${T(p.tag)}</p>
      <div class="li" style="--s:3">${stack(p, 4)}</div>
      <div class="li" style="--s:4">${go}</div>
    </div>
  </div>`;

export function render() {
  const featured = SYSTEMS.filter((s) => s.featured);
  const rest = SYSTEMS.filter((s) => !s.featured);
  return `<section class="band" id="work"><div class="o o-s1" aria-hidden="true">${plant()}</div>
    ${sectionHead(UI.workKicker, UI.workTitle, UI.workNote)}
    <div class="stage" style="--n:${featured.length}">
      <div class="rail" aria-hidden="true"><span class="rail-fill"></span>${featured.map((_, i) => `<span class="rail-n">${pad(i + 1)}</span>`).join('')}</div>
      <div class="stage-leaf" aria-hidden="true">${plant(11)}</div>
      ${featured.map((p, i) => chapter(p, i, featured.length)).join('')}
    </div>
    <div class="archive">${rest.map(piece).join('')}</div>
  </section>`;
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));

export function init() {
  const root = document.getElementById('work');
  if (!root) return undefined;
  const stageMq = matchMedia(STAGE_MQ);
  const tiltMq = matchMedia(TILT_MQ);
  const chapters = [...root.querySelectorAll('.ch')].map((el) => ({
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
    });
    notches.forEach((n) => n.classList.remove('on'));
    active = -1;
  };

  /* One new project passes over the last, along a green blade, as its text climbs the page. */
  function measure() {
    const vh = innerHeight;
    chapters.forEach((c, i) => {
      c.tar = i === 0 ? 1 : clamp01((vh * 0.84 - c.text.getBoundingClientRect().top) / (vh * 0.4));
    });
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
    const span = Math.max(1, chapters.length - 1);
    const total = chapters.reduce((s, c, i) => s + (i ? c.cur : 0), 0) / span;
    stage.style.setProperty('--progress', total.toFixed(4));
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

  /* Screens behind a closed clip-path are not fetched early by native lazy loading: fetch them as the archive nears. */
  const near = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    near.disconnect();
    root.querySelectorAll('.archive .shot[loading="lazy"]').forEach((img) => { img.loading = 'eager'; });
  }, { rootMargin: '100% 0px' });
  near.observe(root.querySelector('.archive'));

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
  /* The second real screen is only fetched once someone points at the picture. */
  function onPointerOver(e) {
    const el = e.target.closest?.('.frame[data-alt]');
    if (!el || el.dataset.loaded) return;
    el.dataset.loaded = '1';
    const img = new Image();
    img.className = 'shot alt';
    img.alt = '';
    img.decoding = 'async';
    img.src = el.dataset.alt;
    el.querySelector('.sheen').before(img);
  }

  /* A click on the picture acts on the heading's button, so closing the dialog returns focus there. */
  function onFrameClick(e) {
    e.target.closest('.frame')?.closest('.ch, .arc')?.querySelector('.open').focus({ preventScroll: true });
  }

  const useTilt = tiltMq.matches;
  root.addEventListener('click', onFrameClick);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  stageMq.addEventListener('change', onStageChange);
  if (useTilt) {
    root.addEventListener('pointermove', onPointerMove);
    root.addEventListener('pointerout', onPointerOut);
    root.addEventListener('pointerover', onPointerOver);
  }

  return () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    onScreen = false;
    seen.disconnect();
    near.disconnect();
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    stageMq.removeEventListener('change', onStageChange);
    root.removeEventListener('click', onFrameClick);
    if (useTilt) {
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerout', onPointerOut);
      root.removeEventListener('pointerover', onPointerOver);
    }
  };
}
