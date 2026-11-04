import { SKILLS, UI } from '../data.js';
import { plant } from '../deco.js';
import { T, esc, pad, sectionHead, state } from '../shared.js';

/* Signature: a watch bezel engraved with every real tool name. It clicks round as the
   reader moves through the capabilities, and a date window shows the current number.
   The dial is decorative and aria-hidden; the rows hold the real content. */
const C = 500;
const GAP_SLOTS = 1.6;
const round = (n) => Math.round(n * 100) / 100;

function geometry() {
  const slot = 360 / (SKILLS.reduce((sum, s) => sum + s.items.length, 0) + SKILLS.length * GAP_SLOTS);
  let a = 0;
  return SKILLS.map((s) => {
    const angles = s.items.map(() => { const v = a; a += slot; return v; });
    a += slot * GAP_SLOTS;
    return { angles, center: (angles[0] + angles[angles.length - 1]) / 2, slot };
  });
}

function arc(r, from, to) {
  const pt = (d) => { const t = (d * Math.PI) / 180; return `${round(C + r * Math.cos(t))} ${round(C + r * Math.sin(t))}`; };
  return `M${pt(from)}A${r} ${r} 0 ${Math.abs(to - from) > 180 ? 1 : 0} ${to > from ? 1 : 0} ${pt(to)}`;
}

function dial(geo, side) {
  let ticks = '';
  for (let d = 0; d < 360; d += 2) {
    const long = d % 10 === 0;
    const t = (d * Math.PI) / 180;
    const [r0, r1] = [long ? 462 : 468, 480];
    ticks += `M${round(C + r0 * Math.cos(t))} ${round(C + r0 * Math.sin(t))}L${round(C + r1 * Math.cos(t))} ${round(C + r1 * Math.sin(t))}`;
  }
  const sectors = SKILLS.map((s, i) => {
    const g = geo[i];
    const first = g.angles[0] - g.slot / 2;
    const last = g.angles[g.angles.length - 1] + g.slot / 2;
    return `<g class="sk-sec" data-s="${i}">
      <path class="sk-arc" pathLength="1" d="${arc(450, side * first, side * last)}"/>
      ${s.items.map((x, n) => `<text style="--n:${n}" transform="rotate(${round(side * g.angles[n])} ${C} ${C})" x="${C + side * 436}" y="${C + 7}" text-anchor="${side > 0 ? 'end' : 'start'}">${esc(x)}</text>`).join('')}
    </g>`;
  }).join('');
  const win = C + side * 172;
  const nums = SKILLS.map((_, i) => `<text x="${win}" y="${C + 12 + i * 52}" text-anchor="middle">${pad(i + 1)}</text>`).join('');
  return `<svg class="sk-svg" viewBox="0 0 1000 1000" aria-hidden="true" focusable="false">
    <defs><clipPath id="sk-win"><rect x="${win - 40}" y="${C - 24}" width="80" height="48" rx="24"/></clipPath></defs>
    <circle class="sk-hair" cx="${C}" cy="${C}" r="495"/>
    <circle class="sk-hair" cx="${C}" cy="${C}" r="232"/>
    <g class="sk-ring">
      <path class="sk-ticks" d="${ticks}"/>
      ${sectors}
    </g>
    <path class="sk-index" d="M${C + side * 488} ${C - 9}L${C + side * 468} ${C}L${C + side * 488} ${C + 9}Z"/>
    <path class="sk-lead" d="M${C + side * 495} ${C}H${C + side * 560}"/>
    <rect class="sk-win" x="${win - 40}" y="${C - 24}" width="80" height="48" rx="24"/>
    <g clip-path="url(#sk-win)"><g class="sk-roll">${nums}</g></g>
  </svg>`;
}

export function render() {
  const side = state.lang === 'ar' ? -1 : 1;
  const geo = geometry();
  return `<section class="band" id="skills">
    <div class="sk-stage">
      ${sectionHead(UI.skillsKicker, UI.skillsTitle)}
      <div class="sk-dial" aria-hidden="true"><div class="sk-sticky reveal"><div class="sk-disc"><div class="sk-face"></div>${dial(geo, side)}</div></div></div>
      <div class="skills">${SKILLS.map((s, i) => `<article class="sk-row reveal${i === 0 ? ' on' : ''}" data-rot="${round(-side * geo[i].center)}">
        <span class="num" aria-hidden="true">${pad(i + 1)}</span>
        <h3>${T(s.title)}</h3>
        <p>${T(s.body)}</p>
        <ul>${s.items.map((x, n) => `<li lang="en" dir="ltr" style="--n:${n}">${esc(x)}</li>`).join('')}</ul>
      </article>`).join('')}</div>
    </div>
    <div class="o sk-leaf" aria-hidden="true">${plant(11)}</div>
  </section>`;
}

export function init() {
  const stage = document.querySelector('#skills .sk-stage');
  if (!stage) return undefined;
  const rows = [...stage.querySelectorAll('.sk-row')];
  const secs = [...stage.querySelectorAll('.sk-sec')];
  const setActive = (i) => {
    rows.forEach((r, n) => r.classList.toggle('on', n === i));
    secs.forEach((s, n) => s.classList.toggle('on', n === i));
    stage.style.setProperty('--rot', `${rows[i].dataset.rot}deg`);
    stage.style.setProperty('--a', i);
  };
  setActive(0);

  /* The row crossing the middle of the viewport lines up with the dial's index. */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) setActive(rows.indexOf(e.target)); });
  }, { rootMargin: '-50% 0px -50% 0px' });
  rows.forEach((r) => io.observe(r));

  const ac = new AbortController();
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    rows.forEach((r, i) => r.addEventListener('pointerenter', () => setActive(i), { signal: ac.signal }));
  }
  return () => { io.disconnect(); ac.abort(); };
}
