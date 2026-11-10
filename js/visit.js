// Visit summary: what a visitor did on the site, sent to the visit-notifier Worker, which messages Alaa
// once the visit ends. Nothing here identifies the visitor: no IP, no cookies, no fingerprint.
// Opening the site once with ?me=1 marks this browser as the owner's and stops tracking (?me=0 undoes it).
import { SYSTEMS, APPS, OTHERS } from './data.js';

const ENDPOINT = 'https://alaa-visits.alaabadr44.workers.dev/hit';
const NAMES = Object.fromEntries([...SYSTEMS, ...APPS, ...OTHERS].map((p) => [p.id, p.name?.en || p.id]));

let s = null; // session state; null when tracking is off

function send() {
  if (!s) return;
  s.active = Math.round(s.activeMs + (s.visibleSince ? Date.now() - s.visibleSince : 0)) / 1000 | 0;
  const body = JSON.stringify({
    sid: s.sid, ref: s.ref, lang: document.documentElement.lang, src: s.src, tz: s.tz, entry: s.entry,
    hidden: document.visibilityState === 'hidden',
    ev: { projects: s.projects, clicks: s.clicks, scroll: s.scroll, active: s.active },
  });
  fetch(ENDPOINT, { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(() => {});
}

let timer;
const sendSoon = () => { clearTimeout(timer); timer = setTimeout(send, 1500); };

const addOnce = (list, item) => { if (item && !list.includes(item)) { list.push(item); sendSoon(); } };

/* Called by the project dialog. */
export function trackProject(id) {
  if (s) addOnce(s.projects, NAMES[id] || id);
}

function kindOf(el) {
  if (el.closest('.rv-btn')) return el.closest('.rv')?.querySelector('.rv-pop a[href^="mailto:"]') ? 'showed email' : 'showed WhatsApp';
  const a = el.closest('a[href]');
  if (!a) return '';
  const h = a.href;
  return /drive\.google/.test(h) ? 'CV' : /play\.google/.test(h) ? 'Google Play' : /apps\.apple/.test(h) ? 'App Store'
    : /github\.com/.test(h) ? 'GitHub' : /linkedin\.com/.test(h) ? 'LinkedIn' : /wa\.me|whatsapp/.test(h) ? 'WhatsApp'
    : /^mailto:/.test(h) ? 'email' : /maps\.app|google\.[a-z.]+\/maps/.test(h) ? 'map' : '';
}

export function trackVisit() {
  try {
    const q = new URLSearchParams(location.search);
    if (q.get('me') === '1') localStorage.setItem('owner', '1');
    if (q.get('me') === '0') localStorage.removeItem('owner');
    if (localStorage.getItem('owner') || navigator.webdriver) return;
    let sid = sessionStorage.getItem('sid');
    if (!sid) { sid = (crypto.randomUUID?.() || String(Math.random()).slice(2)).toLowerCase(); sessionStorage.setItem('sid', sid); }
    s = {
      sid, ref: q.get('ref') || '', tz: Intl.DateTimeFormat().resolvedOptions().timeZone, entry: location.hash,
      src: document.referrer && !document.referrer.startsWith(location.origin) ? document.referrer : '',
      projects: [], clicks: [], scroll: 0, activeMs: 0, visibleSince: document.visibilityState === 'visible' ? Date.now() : 0,
    };
  } catch { return; /* storage blocked: skip tracking */ }

  document.addEventListener('click', (e) => addOnce(s.clicks, kindOf(e.target)), true);
  document.addEventListener('submit', (e) => { if (e.target.closest('#contact')) addOnce(s.clicks, 'sent contact form'); }, true);

  addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const pct = max > 0 ? Math.min(100, Math.round((scrollY / max) * 100)) : 100;
    if (pct >= s.scroll + 25 || (pct === 100 && s.scroll < 100)) { s.scroll = pct; sendSoon(); } else s.scroll = Math.max(s.scroll, pct);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      if (s.visibleSince) { s.activeMs += Date.now() - s.visibleSince; s.visibleSince = 0; }
      clearTimeout(timer); send();
    } else { s.visibleSince = Date.now(); send(); }
  });
  addEventListener('pagehide', () => { clearTimeout(timer); send(); });
  // Heartbeat while the tab is open, so a long read isn't mistaken for the end of the visit.
  setInterval(() => { if (document.visibilityState === 'visible') send(); }, 60000);

  send();
}
