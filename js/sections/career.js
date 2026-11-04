import { CAREER, UI } from '../data.js';
import { T, esc, sectionHead } from '../shared.js';

export function render() {
  return `<section class="band alt" id="career">
    ${sectionHead(UI.careerKicker, UI.careerTitle)}
    <ol class="career">${CAREER.map((c) => `<li class="reveal">
      <span class="when">${T(c.from)} – ${T(c.to)}</span>
      <b lang="en" dir="ltr">${esc(c.co)}</b>
      <span>${T(c.role)}</span>
    </li>`).join('')}</ol>
    <p class="edu reveal">${T(UI.edu)}</p>
  </section>`;
}
