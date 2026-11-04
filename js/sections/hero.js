import { PROFILE, SYSTEMS, APPS, UI } from '../data.js';
import { keyboard, stylus, headphones, monstera, plant } from '../deco.js';
import { L, T, arrow, contactRow } from '../shared.js';

/* Pen-strokes traced over Mr Dafoe at font-size 100, baseline y=0. They are drawn into an
   SVG mask, so the real font glyphs appear as if written. */
const STROKES = [
  'M64 -62C42 -68 16 -48 3 -20C-5 -2 4 7 15 -3C32 -19 46 -46 62 -60',
  'M60 -58C48 -44 34 -30 32 -14C31 -3 35 7 40 15',
  'M102 -62C84 -56 62 -32 53 -12C49 0 56 4 66 -2C78 -10 94 -30 118 -33C104 -34 88 -22 80 -8C76 1 84 2 92 -5C100 -13 110 -24 116 -32C110 -20 104 -8 110 -1C118 3 130 -14 156 -33C142 -33 128 -22 120 -8C116 1 124 2 132 -5C140 -13 150 -24 157 -32C150 -20 144 -8 150 -1C158 3 168 -18 176 -28',
  'M230 -67C214 -50 190 -24 180 -8C176 2 186 4 196 -3C206 -12 214 -30 222 -34C232 -36 246 -34 250 -30C240 -26 226 -18 222 -10C222 -2 232 0 240 -3C250 -10 262 -24 280 -33C266 -34 250 -22 243 -8C239 1 247 2 255 -5C263 -13 272 -24 279 -32C272 -20 266 -8 272 -1',
  'M304 -33C290 -34 286 -20 282 -8C278 1 286 2 294 -5C304 -14 316 -44 330 -68C312 -40 300 -20 296 -6C294 2 302 2 310 -5C318 -12 320 -24 314 -32C326 -31 336 -31 342 -30C330 -28 314 -14 310 -2C312 4 322 2 332 -4C342 -10 352 -20 362 -29',
];
const VB = { x: -8, y: -74, w: 376, h: 94 };
const TIP = { x: 408 / 420, y: 12 / 26 }; // nib position inside the stylus drawing
const REST_ANGLE = -4; // matches the CSS resting transform of .pen
const WRITE_ANGLE = 46;

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* The full intro plays once per page load; a language toggle re-renders straight to the end state. */
let played = false;
let intro = false;

/* Word-level split only: letters stay joined in Arabic. */
function splitWords(html) {
  let i = 0;
  return html.split(/(<br>|<\/?em>)/).map((part) => {
    if (part.startsWith('<')) return part;
    return part.split(/\s+/).filter(Boolean).map((w) => `<span class="w" style="--i:${i++}">${w}</span>`).join(' ');
  }).join(' ').replace(/<em> /g, '<em>').replace(/ <\/em>/g, '</em>');
}

const wheel = (value) => [...String(value)].map((d, k) => `<span class="wh" style="--k:${k};--n:${10 + Number(d)}"><span class="strip">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((x) => `<span>${x}</span>`).join('')}</span></span>`).join('');

export function render() {
  intro = !played && !reducedMotion();
  played = true;
  const live = SYSTEMS.filter((s) => s.status === 'live').length;
  const stats = [
    [APPS.length, UI.stats.apps],
    [SYSTEMS.length, UI.stats.systems],
    [live, UI.stats.live],
    [2021, UI.stats.since],
  ];
  const mask = intro ? `<defs><mask id="sig-ink" maskUnits="userSpaceOnUse" x="${VB.x - 10}" y="${VB.y - 30}" width="${VB.w + 20}" height="${VB.h + 60}">${STROKES.map((d) => `<path d="${d}" fill="none" stroke="#fff" stroke-width="28" stroke-linecap="round" stroke-linejoin="round" style="visibility:hidden"/>`).join('')}</mask></defs>` : '';
  const object = (name, svg, i) => `<div class="o o-${name}" style="--i:${i}"><div class="o-in">${svg}</div></div>`;
  return `<section class="hero${intro ? ' play' : ''}" id="home">
    <div class="leather" aria-hidden="true"></div>
    <div class="flat" aria-hidden="true">
      ${object('leaf-top', monstera(), 3)}
      ${object('keyboard', keyboard(), 0)}
      ${object('phones', headphones(), 2)}
      ${object('plant-top', plant(), 4)}
      ${object('plant-low', plant(11), 5)}
      ${object('leaf-low', monstera(), 6)}
    </div>
    <div class="lamp" aria-hidden="true"></div>
    <div class="sweep" aria-hidden="true"></div>
    <div class="hero-grid">
      <div class="hero-photo"><img src="assets/alaa.webp" alt="${T(PROFILE.fullName)}" width="640" height="641"></div>
      <div class="hero-text">
        <p class="sig" lang="en" dir="ltr"><span class="vh">Alaa badr</span><svg class="sig-svg" viewBox="${VB.x} ${VB.y} ${VB.w} ${VB.h}" aria-hidden="true">${mask}<text x="0" y="0" font-size="100"${intro ? ' mask="url(#sig-ink)"' : ''}>Alaa badr</text></svg><span class="pen" aria-hidden="true">${stylus()}</span></p>
        <p class="pill">${T(PROFILE.role)}</p>
        <h1>${splitWords(L(UI.headline))}</h1>
        <p class="intro">${T(UI.intro)}</p>
        <div class="cta">
          <a class="btn" href="#work"><span>${T(UI.cta)}</span>${arrow}</a>
          <a class="btn ghost" href="#contact">${T(UI.ctaContact)}</a>
        </div>
        ${contactRow()}
      </div>
    </div>
    <dl class="stats">${stats.map(([v, l], c) => `<div class="stat" style="--c:${c}"><dt>${T(l)}</dt><dd><span class="vh">${v}</span><span class="wheels" dir="ltr" aria-hidden="true">${wheel(v)}</span></dd></div>`).join('')}</dl>
  </section>`;
}

const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2);
const glide = (u) => 0.55 * u + 0.45 * u * u * (3 - 2 * u);

export function init() {
  const root = document.getElementById('home');
  if (!root) return undefined;
  let raf = 0;
  let dead = false;
  let penStep = null;
  let driftStep = null;

  const loop = (now) => {
    raf = 0;
    const penBusy = penStep ? penStep(now) : false;
    const driftBusy = driftStep ? driftStep() : false;
    if (penBusy || driftBusy) raf = requestAnimationFrame(loop);
  };
  const wake = () => { if (!raf && !dead) raf = requestAnimationFrame(loop); };

  /* Pointer depth: objects shift against the pointer at their own depth, and a soft pool of
     light follows it across the leather. Only runs while the pointer is moving. */
  const startDrift = () => {
    if (reducedMotion() || !matchMedia('(hover: hover) and (pointer: fine)').matches) return () => {};
    const layers = [
      ['.o-keyboard', 12], ['.o-phones', 16], ['.o-leaf-top', 30], ['.o-plant-top', 24],
      ['.o-plant-low', 22], ['.o-leaf-low', 34], ['.hero-photo', 7], ['.pen', 5],
    ].map(([sel, depth]) => [root.querySelector(sel), depth]).filter(([el]) => el);
    const lamp = root.querySelector('.lamp');
    const cur = { x: 0, y: 0, lx: innerWidth / 2, ly: innerHeight / 2 };
    const tgt = { x: 0, y: 0, lx: cur.lx, ly: cur.ly };
    let seen = true;
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen) wake(); });
    io.observe(root);
    driftStep = () => {
      if (!seen) return false;
      let moving = false;
      Object.keys(cur).forEach((k) => {
        const d = tgt[k] - cur[k];
        if (Math.abs(d) > 0.002) moving = true;
        cur[k] += d * (k.length > 1 ? 0.09 : 0.06);
      });
      layers.forEach(([el, depth]) => { el.style.translate = `${(-cur.x * depth).toFixed(2)}px ${(-cur.y * depth).toFixed(2)}px`; });
      lamp.style.transform = `translate3d(${cur.lx.toFixed(1)}px, ${cur.ly.toFixed(1)}px, 0) translate(-50%, -50%)`;
      return moving;
    };
    const onMove = (e) => {
      const r = root.getBoundingClientRect();
      tgt.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      tgt.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      tgt.lx = e.clientX - r.left;
      tgt.ly = e.clientY - r.top;
      if (!lamp.classList.contains('on')) { cur.lx = tgt.lx; cur.ly = tgt.ly; lamp.classList.add('on'); }
      wake();
    };
    const onLeave = () => { tgt.x = 0; tgt.y = 0; lamp.classList.remove('on'); wake(); };
    root.addEventListener('pointermove', onMove, { passive: true });
    root.addEventListener('pointerleave', onLeave, { passive: true });
    return () => {
      io.disconnect();
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      driftStep = null;
    };
  };

  /* The signature: the stylus lifts off its resting place under the name, writes it, and is
     set back down. The ink is a mask over the real font; it is removed when finished. */
  const startPen = () => {
    const svg = root.querySelector('.sig-svg');
    const text = svg.querySelector('text');
    const mask = svg.querySelector('mask');
    const pen = root.querySelector('.pen');
    const paths = [...mask.querySelectorAll('path')];
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      penStep = null;
      text.removeAttribute('mask');
      mask.remove();
      pen.style.removeProperty('transform');
      root.classList.remove('writing');
      driftCleanup = startDrift();
    };
    const begin = () => {
      const s = svg.getBoundingClientRect().width / VB.w;
      const rest = { x: pen.offsetLeft + pen.offsetWidth * TIP.x, y: pen.offsetTop + pen.offsetHeight * TIP.y };
      const toBox = (p) => ({ x: (p.x - VB.x) * s, y: (p.y - VB.y) * s });
      const place = (p, angle, lift = 0) => {
        pen.style.transform = `translate(${(p.x - rest.x).toFixed(2)}px, ${(p.y - rest.y).toFixed(2)}px) rotate(${angle.toFixed(2)}deg) scale(${(1 + lift * 0.05).toFixed(3)})`;
      };
      const lens = paths.map((p) => p.getTotalLength());
      const total = lens.reduce((a, b) => a + b, 0);
      paths.forEach((p, i) => { p.style.strokeDasharray = `${lens[i]} ${lens[i] + 40}`; p.style.strokeDashoffset = lens[i]; });
      const WRITE = 1500;
      const segs = [];
      const at = (i, u) => toBox(paths[i].getPointAtLength(lens[i] * u));
      const wobble = (u) => WRITE_ANGLE + Math.sin(u * 9) * 3;
      const first = at(0, 0);
      segs.push({ dur: 520, run: (u) => {
        const e = ease(u);
        place({ x: rest.x + (first.x - rest.x) * e, y: rest.y + (first.y - rest.y) * e }, REST_ANGLE + (WRITE_ANGLE - REST_ANGLE) * e, Math.sin(u * Math.PI));
      } });
      let written = 0;
      paths.forEach((p, i) => {
        const startShare = written / total;
        const share = lens[i] / total;
        written += lens[i];
        segs.push({ dur: WRITE * share, run: (u) => {
          const g = glide(u);
          p.style.visibility = 'visible';
          p.style.strokeDashoffset = lens[i] * (1 - g);
          place(at(i, g), wobble(startShare + share * g));
        } });
        if (i < paths.length - 1) {
          const gap = i === 2 ? 130 : 60;
          segs.push({ dur: gap, run: (u) => {
            const a = at(i, 1);
            const b = at(i + 1, 0);
            const e = ease(u);
            place({ x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e }, wobble(written / total), Math.sin(u * Math.PI) * 0.6);
          } });
        }
      });
      const last = at(paths.length - 1, 1);
      segs.push({ dur: 700, run: (u) => {
        const e = ease(u);
        place({ x: last.x + (rest.x - last.x) * e, y: last.y + (rest.y - last.y) * e }, WRITE_ANGLE + (REST_ANGLE - WRITE_ANGLE) * e, Math.sin(u * Math.PI));
      } });
      const span = segs.reduce((a, b) => a + b.dur, 0);
      let t0 = 0;
      penStep = (now) => {
        if (!t0) t0 = now;
        let t = now - t0;
        if (t >= span || scrollY > innerHeight) { finish(); return false; }
        for (const seg of segs) {
          if (t < seg.dur) { seg.run(t / seg.dur); break; }
          seg.run(1);
          t -= seg.dur;
        }
        return true;
      };
      root.classList.add('writing');
      wake();
    };
    const ready = document.fonts?.load ? document.fonts.load('100px "Mr Dafoe"', 'Alaa badr') : Promise.resolve();
    const timer = setTimeout(() => { if (!dead) finish(); }, 2200); // slow font: show the name, skip the flourish
    Promise.all([ready, new Promise((res) => { setTimeout(res, 420); })]).then(() => {
      clearTimeout(timer);
      if (!dead && !finished) begin();
    }).catch(() => { clearTimeout(timer); if (!dead) finish(); });
    return () => clearTimeout(timer);
  };

  let driftCleanup = () => {};
  let penCleanup = () => {};
  const opensDeep = location.hash && location.hash !== '#home';
  if (intro && !opensDeep && scrollY < innerHeight * 0.5) penCleanup = startPen();
  else if (intro) {
    /* Opened further down the page (a #work link, a restored scroll): sign when the hero is first reached. */
    let inner = () => {};
    const waiting = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      waiting.disconnect();
      inner = startPen();
    }, { threshold: 0.25 });
    const settle = setTimeout(() => waiting.observe(root), 600); // let the jump to the anchor land first
    penCleanup = () => { clearTimeout(settle); waiting.disconnect(); inner(); };
  }
  else driftCleanup = startDrift();
  const introEnd = setTimeout(() => root.classList.remove('play'), 4200);

  return () => {
    dead = true;
    if (raf) cancelAnimationFrame(raf);
    clearTimeout(introEnd);
    penCleanup();
    driftCleanup();
  };
}
