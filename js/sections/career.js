import { CAREER, SYSTEMS, APPS, OTHERS, WORK, UI } from '../data.js';
import { stylus } from '../deco.js';
import { T, esc, sectionHead, pics } from '../shared.js';

/* Signature: one pen stroke. A stylus writes the career as the reader scrolls, from the
   degree to today, stepping forward in the reading direction. Each role arrives on the
   line, and the gaps between roles follow the real time spent in each one. */
const HEAD_AT = 0.62; // where in the viewport the pen tip sits
const when = (en) => (en === 'Present' ? Date.now() : Date.parse(`1 ${en}`));
const gapRem = (c) => {
  const months = (when(c.to.en) - when(c.from.en)) / 2.63e9;
  return Number.isFinite(months) ? Math.min(9, Math.max(4, months * 0.28)).toFixed(2) : 5;
};

const ALL = [...SYSTEMS, ...APPS, ...OTHERS];

/* The work done at each place: every project opens its details. */
const workList = (key) => {
  const items = (WORK[key] || []).map((id) => ALL.find((p) => p.id === id)).filter(Boolean);
  if (!items.length) return '';
  return `<ul class="cr-works">${items.map((p, i) => {
    const thumb = p.icon || pics(p)[0];
    return `<li style="--w:${i}"><button type="button" class="cr-work" data-open="${p.id}" aria-haspopup="dialog">
      <span class="cr-thumb" aria-hidden="true">${thumb ? `<img src="${thumb}" alt="" loading="lazy" decoding="async" width="56" height="40">` : `<b>${esc(T(p.name).charAt(0))}</b>`}</span>
      <span class="cr-wname">${T(p.name)}</span>
    </button></li>`;
  }).join('')}</ul>`;
};

export function render() {
  const roles = CAREER.slice().reverse(); // oldest first, so the line travels toward today
  return `<section class="band alt" id="career">
    ${sectionHead(UI.careerKicker, UI.careerTitle)}
    <div class="cr-track">
      <svg class="cr-svg" aria-hidden="true" focusable="false"><path class="cr-guide"/><path class="cr-ink"/></svg>
      <p class="edu cr-step" style="--step:0;--gap:5"><span class="cr-node" aria-hidden="true"></span><span class="cr-edu">${T(UI.edu)}</span></p>
      <ol class="career">${roles.map((c, i) => `<li class="cr-step${i === roles.length - 1 ? ' cr-now' : ''}" style="--step:${i + 1};--gap:${gapRem(c)}">
        <span class="cr-node" aria-hidden="true"></span>
        <div class="cr-body">
          <h3><bdi lang="en" dir="ltr">${esc(c.co)}</bdi></h3>
          <p class="when"><bdi>${T(c.from)}</bdi> – <bdi>${T(c.to)}</bdi></p>
          <p class="role">${T(c.role)}</p>
          ${workList(c.key)}
        </div>
      </li>`).join('')}</ol>
      <div class="cr-pen" aria-hidden="true">${stylus()}</div>
    </div>
    <div class="cr-own">
      <div class="cr-group reveal"><h3>${T(UI.personalWork)}</h3>${workList('personal')}</div>
      <div class="cr-group reveal"><h3>${T(UI.freelanceWork)}</h3>${workList('freelance')}</div>
    </div>
  </section>`;
}

export function init() {
  const track = document.querySelector('#career .cr-track');
  if (!track) return undefined;
  const svg = track.querySelector('.cr-svg');
  const guide = track.querySelector('.cr-guide');
  const ink = track.querySelector('.cr-ink');
  const pen = track.querySelector('.cr-pen');
  const steps = [...track.querySelectorAll('.cr-step')];
  const rtl = document.documentElement.dir === 'rtl';
  const still = matchMedia('(prefers-reduced-motion: reduce)');

  let total = 0;
  let table = []; // [length, y] samples, y strictly increases along the path
  let marks = []; // length along the path where each step arrives
  let current = 0;
  let raf = 0;
  let visible = false;

  function build() {
    const box = track.getBoundingClientRect();
    svg.setAttribute('width', box.width);
    svg.setAttribute('height', box.height);
    const pts = steps.map((s) => {
      const n = s.querySelector('.cr-node').getBoundingClientRect();
      return { x: n.left + n.width / 2 - box.left, y: n.top + n.height / 2 - box.top, bottom: s.lastElementChild.getBoundingClientRect().bottom - box.top };
    });
    let d = `M${pts[0].x} ${pts[0].y}`;
    pts.forEach((p, i) => {
      const next = pts[i + 1];
      if (!next) return;
      const from = Math.max(p.y + 1, Math.min(p.bottom + 6, next.y - 40));
      const mid = (from + next.y) / 2;
      d += `L${p.x} ${from}C${p.x} ${mid} ${next.x} ${mid} ${next.x} ${next.y}`;
    });
    /* The last stretch keeps going forward: the career is still being written. */
    const last = pts[pts.length - 1];
    const endY = box.height - 2;
    const endX = rtl ? Math.max(last.x - box.width * 0.34, 8) : Math.min(last.x + box.width * 0.34, box.width - 8);
    const bend = Math.max(last.bottom + 6, last.y + 1);
    d += `L${last.x} ${bend}C${last.x} ${endY} ${last.x} ${endY} ${endX} ${endY}`;
    guide.setAttribute('d', d);
    ink.setAttribute('d', d);

    total = ink.getTotalLength();
    ink.style.strokeDasharray = `${total} ${total + 2}`;
    table = [];
    const N = Math.max(120, Math.round(total / 6));
    for (let i = 0; i <= N; i += 1) {
      const len = (total * i) / N;
      table.push([len, ink.getPointAtLength(len).y]);
    }
    marks = pts.map((p) => {
      const hit = table.find((row) => row[1] >= p.y - 0.5);
      return hit ? hit[0] : total;
    });
    current = Math.min(current, total);
  }

  const lengthAtY = (y) => {
    if (y <= table[0][1]) return 0;
    const lastRow = table[table.length - 1];
    /* Past the bottom of the path everything is written. */
    if (y >= lastRow[1]) return total;
    let lo = 0;
    let hi = table.length - 1;
    while (hi - lo > 1) {
      const m = (lo + hi) >> 1;
      if (table[m][1] < y) lo = m; else hi = m;
    }
    const [l0, y0] = table[lo];
    const [l1, y1] = table[hi];
    return l0 + (l1 - l0) * (y1 > y0 ? (y - y0) / (y1 - y0) : 1);
  };

  const target = () => {
    if (still.matches || scrollY + innerHeight >= document.documentElement.scrollHeight - 2) return total;
    return lengthAtY(innerHeight * HEAD_AT - track.getBoundingClientRect().top);
  };

  function paint() {
    ink.style.strokeDashoffset = total - current;
    const p = ink.getPointAtLength(current);
    const q = ink.getPointAtLength(Math.min(total, current + 8));
    const lean = rtl ? 126 : 54;
    const sway = Math.max(-16, Math.min(16, (q.x - p.x) * 2));
    pen.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${lean + sway}deg)`;
    pen.classList.toggle('rest', current >= total - 1);
    /* Roles arrive once and stay, so nothing already read disappears on the way back up. */
    steps.forEach((s, i) => { if (current >= marks[i] - 1) s.classList.add('on'); });
  }

  function tick() {
    raf = 0;
    const t = target();
    current += (t - current) * 0.14;
    if (Math.abs(t - current) < 0.4) current = t;
    paint();
    if (current !== t && visible) raf = requestAnimationFrame(tick);
  }
  const wake = () => { if (visible && !raf) raf = requestAnimationFrame(tick); };

  const refresh = () => {
    build();
    current = target();
    paint();
  };

  refresh();
  const ro = new ResizeObserver(refresh);
  ro.observe(track);
  const io = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible) wake();
    else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    /* Jumping past the section (nav link, End key) still leaves it fully written. */
    if (!visible && track.getBoundingClientRect().bottom < 0) { current = total; paint(); }
  });
  io.observe(track);
  const ac = new AbortController();
  addEventListener('scroll', wake, { passive: true, signal: ac.signal });
  return () => {
    ac.abort();
    ro.disconnect();
    io.disconnect();
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    visible = false;
  };
}
