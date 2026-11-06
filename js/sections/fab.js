import { PROFILE } from '../data.js';
import { icon } from '../deco.js';
import { esc, ext } from '../shared.js';

/* Persistent WhatsApp button for phones and tablets (CSS shows it under 1024px only).
   Hidden while the hero or the contact section is on screen, which already carry the same channels. */
export function render() {
  return `<a class="fab away" id="fab" href="${PROFILE.whatsapp}" ${ext} aria-label="WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true">${icon('whatsapp').replace(/^.*?<svg[^>]*>|<\/svg>.*$/g, '')}</svg></a>`;
}

export function init() {
  const fab = document.getElementById('fab');
  const targets = ['home', 'contact'].map((id) => document.getElementById(id)).filter(Boolean);
  if (!fab || !targets.length) return undefined;
  const seen = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) seen.add(e.target); else seen.delete(e.target); });
    fab.classList.toggle('away', seen.size > 0);
  });
  targets.forEach((t) => io.observe(t));
  return () => io.disconnect();
}
