// Patches 2026 squad ratings to match EA FC 26 overall ratings.
// Source: EA FC26 ratings table (top of the list covers every man rated 85+),
// so any 2026 player NOT in this table is capped at 84.
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = new URL('../public/data/squads.json', import.meta.url);

// sel -> [name as in EA list, FC26 OVR]
const PATCH = {
  EGY: [['Mohamed Salah', 91]],
  FRA: [
    ['Kylian Mbappé', 91], ['Ousmane Dembélé', 90], ['Jules Koundé', 87], ['William Saliba', 87],
    ['Mike Maignan', 87], ['Ibrahima Konaté', 86], ['Michael Olise', 86], ['Dayot Upamecano', 85],
    ["N'Golo Kanté", 85], ['Désiré Doué', 85], ['Marcus Thuram', 85], ['Theo Hernandez', 84],
  ],
  ESP: [
    ['Rodri', 90], ['Lamine Yamal', 89], ['Pedri', 89], ['Nico Williams', 86], ['Unai Simón', 85],
    ['Dani Olmo', 85], ['Fabián Ruiz', 85], ['Marcos Llorente', 84],
  ],
  NED: [
    ['Virgil van Dijk', 90], ['Frenkie de Jong', 87], ['Tijjani Reijnders', 86], ['Ryan Gravenberch', 85],
  ],
  ENG: [
    ['Jude Bellingham', 90], ['Harry Kane', 89], ['Bukayo Saka', 88], ['Declan Rice', 87],
  ],
  NOR: [['Erling Haaland', 90], ['Martin Ødegaard', 87]],
  BRA: [
    ['Raphinha', 89], ['Alisson', 89], ['Vini Jr', 89], ['Gabriel', 88], ['Marquinhos', 87],
    ['Bruno Guimarães', 86], ['Ederson', 85], ['Bremer', 85],
  ],
  MAR: [['Achraf Hakimi', 89]],
  POR: [
    ['Vitinha', 89], ['Bruno Fernandes', 87], ['Rúben Dias', 86], ['Nuno Mendes', 86],
    ['João Neves', 85], ['Cristiano Ronaldo', 85], ['João Cancelo', 84],
  ],
  GER: [
    ['Joshua Kimmich', 89], ['Florian Wirtz', 89], ['Jamal Musiala', 88], ['Jonathan Tah', 87],
    ['Antonio Rüdiger', 86], ['Nico Schlotterbeck', 85],
  ],
  BEL: [['Thibaut Courtois', 89], ['Kevin De Bruyne', 87], ['Youri Tielemans', 85]],
  URU: [['Federico Valverde', 89]],
  ARG: [
    ['Lautaro Martínez', 88], ['Julián Alvarez', 87], ['Alexis Mac Allister', 87], ['Lionel Messi', 86],
    ['Emiliano Martínez', 85], ['Rodrigo De Paul', 84],
  ],
  ECU: [['Moisés Caicedo', 87], ['Willian Pacho', 86]],
  SUI: [['Gregor Kobel', 86], ['Granit Xhaka', 85]],
  SWE: [['Alexander Isak', 88], ['Viktor Gyökeres', 87]],
  TUR: [['Hakan Çalhanoğlu', 86], ['Arda Güler', 81]],
  KOR: [['Son Heung-min', 85]],
  COL: [['Luis Díaz', 85]],
  SCO: [['Scott McTominay', 85]],
  CZE: [['Patrik Schick', 85]],
};

// our-data spelling -> EA spelling (when token matching is not enough)
const ALIASES = {
  'Vinícius Jr': 'Vini Jr',
  'Lautaro': 'Lautaro Martínez',
  'E. Martínez': 'Emiliano Martínez',
};

const norm = s => s
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[.'’-]/g, ' ').replace(/\s+/g, ' ').trim();

const tokens = s => norm(s).split(' ');

/** exact > token subset > unique surname (resolved by the caller via cands.length) */
function matchRank(ourName, eaName) {
  const aRaw = ALIASES[ourName] ?? ourName;
  if (norm(aRaw) === norm(eaName)) return 3;
  const a = tokens(aRaw), b = tokens(eaName);
  const subset = (xs, ys) => xs.every(x => ys.includes(x));
  if (subset(a, b) || subset(b, a)) return 2;
  const skip = new Set(['jr', 'junior']);
  const last = xs => [...xs].reverse().find(t => !skip.has(t) && t.length > 1);
  return last(a) === last(b) ? 1 : 0;
}

const data = JSON.parse(readFileSync(FILE, 'utf8'));
const squads26 = data.filter(s => s.copa === 2026);

let changed = 0, capped = 0;
const unmatched = [];
const patchedIds = new Set();

for (const [sel, entries] of Object.entries(PATCH)) {
  const squad = squads26.find(s => s.sel === sel);
  if (!squad) { unmatched.push(`${sel}: squad missing`); continue; }
  for (const [eaName, ovr] of entries) {
    // take the strongest match tier that yields exactly one candidate
    let cands = [];
    for (const rank of [3, 2, 1]) {
      const found = squad.squad.filter(p => matchRank(p.n, eaName) >= rank);
      if (found.length === 1) { cands = found; break; }
      if (found.length > 1) { cands = found; break; }
    }
    if (cands.length !== 1) {
      unmatched.push(`${sel} ${eaName} -> ${cands.length === 0 ? 'NO MATCH' : 'AMBIGUOUS: ' + cands.map(p => p.n).join('/')}`);
      continue;
    }
    const p = cands[0];
    patchedIds.add(p.id);
    if (p.f !== ovr) {
      console.log(`  ${sel} ${p.n}: ${p.f} -> ${ovr}`);
      p.f = ovr;
      changed++;
    }
  }
}

// every man rated 85+ in FC26 is covered above -> cap the rest at 84
for (const squad of squads26) {
  for (const p of squad.squad) {
    if (!patchedIds.has(p.id) && p.f >= 85) {
      console.log(`  cap ${squad.sel} ${p.n}: ${p.f} -> 84`);
      p.f = 84;
      capped++;
    }
  }
}

writeFileSync(FILE, JSON.stringify(data));

// recompute 2026 band strengths (overall = avg of top 13 forces, band = overall + 1)
const bandsUrl = new URL('../src/data/bands.ts', import.meta.url);
let bands = readFileSync(bandsUrl, 'utf8');
let rebanded = 0;
for (const squad of squads26) {
  const top = squad.squad.map(p => p.f).sort((a, b) => b - a).slice(0, 13);
  const overall = Math.round(top.reduce((a, b) => a + b, 0) / top.length);
  const re = new RegExp(`\\{"sel":"${squad.sel}","copa":2026,"overall":\\d+,"band":\\d+\\}`);
  const next = `{"sel":"${squad.sel}","copa":2026,"overall":${overall},"band":${overall + 1}}`;
  if (re.test(bands) && !bands.includes(next)) {
    bands = bands.replace(re, next);
    rebanded++;
  }
}
writeFileSync(bandsUrl, bands);

console.log(`\npatched: ${changed}, capped: ${capped}, bands updated: ${rebanded}`);
if (unmatched.length) {
  console.log('\nUNMATCHED:');
  for (const u of unmatched) console.log('  ' + u);
}
