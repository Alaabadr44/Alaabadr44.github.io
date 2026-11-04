import { PROFILE, UI } from '../data.js';
import { monstera, plant } from '../deco.js';
import { T, contactRow } from '../shared.js';

export function render() {
  return `<section class="contact" id="contact">
    <div class="o o-c1" aria-hidden="true">${monstera()}</div>
    <div class="o o-c2" aria-hidden="true">${plant()}</div>
    <p class="sig small reveal" lang="en" dir="ltr">Alaa badr</p>
    <p class="pill reveal">${T(UI.contactKicker)}</p>
    <h2 class="reveal">${T(UI.contactTitle)}</h2>
    <p class="body reveal">${T(UI.contactBody)}</p>
    <div class="reveal">${contactRow()}</div>
    <p class="city reveal">${T(PROFILE.city)}</p>
    <footer><span>© ${new Date().getFullYear()} ${T(PROFILE.name)}. ${T(UI.rights)}</span><a href="#home">${T(UI.top)}</a></footer>
  </section>`;
}
