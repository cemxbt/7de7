// Curates the legend (⭐) flags: removes stars from players who are not
// (yet) legends and adds the missing national-team icons.
// Criterion: all-time greats / national-team icons of that squad's era —
// young talents and merely in-form players do not qualify.
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = new URL('../public/data/squads.json', import.meta.url);

// [copa, sel, exact name, optional force to disambiguate duplicates]
const REMOVE = [
  [2026, 'ESP', 'Lamine Yamal'], // generational talent, not a legend yet
  [2026, 'TUR', 'Arda Güler'],
  [2026, 'TUR', 'Kenan Yıldız'],
  [2018, 'SWE', 'Lindelöf'], // solid CB, never icon-tier
];

const ADD = [
  // 2018 — missing icons
  [2018, 'ENG', 'Kane'], // Golden Boot 2018, England's all-time top scorer
  [2018, 'KOR', 'Son Heung-min'],
  [2018, 'RUS', 'Akinfeev'],
  [2018, 'FRA', 'Griezmann'],
  [2018, 'FRA', 'Kanté'],
  [2018, 'BEL', 'Lukaku'],
  [2018, 'ESP', 'Piqué'],
  [2018, 'ESP', 'Busquets'],
  [2018, 'ESP', 'D. Silva'],
  [2018, 'CRO', 'Rakitić'],
  [2018, 'CRO', 'Mandžukić'],
  [2018, 'SUI', 'Shaqiri'],
  [2018, 'SUI', 'Xhaka'],
  [2018, 'POR', 'Pepe'],
  // 2022 — missing icons
  [2022, 'FRA', 'Benzema'], // Ballon d'Or 2022
  [2022, 'FRA', 'Griezmann'],
  [2022, 'ARG', 'Di María'],
  [2022, 'BRA', 'Thiago Silva'],
  [2022, 'BRA', 'Casemiro'],
  [2022, 'BRA', 'Dani Alves'],
  [2022, 'POR', 'Pepe'],
  [2022, 'SEN', 'Koulibaly'],
  [2022, 'SRB', 'Tadić'],
  [2022, 'SRB', 'Mitrović', 83], // Aleksandar (two Mitrović entries in the squad)
  [2022, 'ECU', 'E. Valencia'],
  // 2026 — missing icons
  [2026, 'ENG', 'Kane'],
  [2026, 'FRA', 'Kanté'],
  [2026, 'NED', 'Depay'], // Netherlands' all-time top scorer
  [2026, 'GER', 'Kimmich'],
  [2026, 'BRA', 'Casemiro'],
  [2026, 'CRO', 'Ivan Perišić'],
  [2026, 'SUI', 'Granit Xhaka'],
  [2026, 'SCO', 'Andy Robertson'],
  [2026, 'USA', 'Christian Pulisic'],
  [2026, 'CAN', 'Alphonso Davies'],
  [2026, 'AUS', 'Mat Ryan'],
  [2026, 'NZL', 'Chris Wood'], // New Zealand's all-time top scorer
  [2026, 'GHA', 'Jordan Ayew'], // Ghana's most capped player
  [2026, 'SEN', 'Kalidou Koulibaly'],
];

const data = JSON.parse(readFileSync(FILE, 'utf8'));

function find(copa, sel, name, force) {
  const sq = data.find(s => s.copa === copa && s.sel === sel);
  if (!sq) return { err: 'squad missing' };
  const cands = sq.squad.filter(p => p.n === name && (force === undefined || p.f === force));
  if (cands.length !== 1) return { err: cands.length === 0 ? 'no match' : 'ambiguous' };
  return { p: cands[0] };
}

let added = 0, removed = 0;
const problems = [];

for (const [copa, sel, name, force] of REMOVE) {
  const { p, err } = find(copa, sel, name, force);
  if (!p) { problems.push(`REMOVE ${copa} ${sel} ${name}: ${err}`); continue; }
  if (p.leg) { delete p.leg; removed++; console.log(`  - ${copa} ${sel} ${name}`); }
}

for (const [copa, sel, name, force] of ADD) {
  const { p, err } = find(copa, sel, name, force);
  if (!p) { problems.push(`ADD ${copa} ${sel} ${name}: ${err}`); continue; }
  if (!p.leg) { p.leg = true; added++; console.log(`  + ${copa} ${sel} ${name}`); }
}

writeFileSync(FILE, JSON.stringify(data));
console.log(`\nadded: ${added}, removed: ${removed}`);
if (problems.length) {
  console.log('PROBLEMS:');
  for (const x of problems) console.log('  ' + x);
  process.exit(1);
}
