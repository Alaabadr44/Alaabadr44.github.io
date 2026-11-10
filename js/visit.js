// Visit beacon: one per browser session, sent to the visit-notifier Worker, which emails Alaa.
// Opening the site once with ?me=1 marks this browser as the owner's and stops its beacons (?me=0 undoes it).
const ENDPOINT = 'https://alaa-visits.alaabadr44.workers.dev/hit';

export function trackVisit() {
  try {
    const q = new URLSearchParams(location.search);
    if (q.get('me') === '1') localStorage.setItem('owner', '1');
    if (q.get('me') === '0') localStorage.removeItem('owner');
    if (localStorage.getItem('owner') || sessionStorage.getItem('seen')) return;
    if (navigator.webdriver) return;
    sessionStorage.setItem('seen', '1');
    const body = JSON.stringify({
      ref: q.get('ref') || '',
      lang: document.documentElement.lang,
      src: document.referrer && !document.referrer.startsWith(location.origin) ? document.referrer : '',
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      hash: location.hash,
    });
    fetch(ENDPOINT, { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(() => {});
  } catch { /* storage blocked: skip tracking */ }
}
