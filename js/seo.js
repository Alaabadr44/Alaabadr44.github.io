import { state } from './shared.js';

const BASE = 'https://alaabadr44.github.io/';
const COPY = {
  ar: {
    title: 'علاء بدر الدين | مطوّر Flutter و Full-Stack',
    desc: 'علاء بدر الدين، مطوّر Flutter و Full-Stack من القاهرة: تطبيقات منشورة على المتاجر وأنظمة كاملة للشركات.',
  },
  en: {
    title: 'Alaa Badr Edin | Flutter & Full-Stack Developer',
    desc: 'Alaa Badr Edin, a Flutter and full-stack developer in Cairo: apps published on the stores and complete systems for businesses.',
  },
};

function setMeta(attr, key, value) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

export function applySeo() {
  const lang = state.lang === 'en' ? 'en' : 'ar';
  const c = COPY[lang];
  setMeta('name', 'description', c.desc);
  setMeta('property', 'og:title', c.title);
  setMeta('property', 'og:description', c.desc);
  /* Each language URL is its own canonical, or search engines drop it despite the hreflang links. The bare URL is the x-default. */
  const self = new URLSearchParams(location.search).has('lang') ? `${BASE}?lang=${lang}` : BASE;
  document.head.querySelector('link[rel="canonical"]')?.setAttribute('href', self);
  setMeta('property', 'og:url', self);
  setMeta('property', 'og:locale', lang === 'ar' ? 'ar_EG' : 'en_US');
  setMeta('property', 'og:locale:alternate', lang === 'ar' ? 'en_US' : 'ar_EG');
}
