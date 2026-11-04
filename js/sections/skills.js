import { SKILLS, UI } from '../data.js';
import { plant } from '../deco.js';
import { T, esc, pad, sectionHead } from '../shared.js';

export function render() {
  return `<section class="band" id="skills"><div class="o o-s3" aria-hidden="true">${plant(11)}</div>
    ${sectionHead(UI.skillsKicker, UI.skillsTitle)}
    <div class="skills">${SKILLS.map((s, i) => `<article class="reveal">
      <span class="num">${pad(i + 1)}</span>
      <h3>${T(s.title)}</h3>
      <p>${T(s.body)}</p>
      <ul lang="en" dir="ltr">${s.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    </article>`).join('')}</div>
  </section>`;
}
