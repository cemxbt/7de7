// Engine smoke test: data integrity + full auto-drafted runs + balance stats.
import fs from 'node:fs';
import {
  applyChoose, createGame, eligiblePositions, findSquad, modePool, poolStuck,
  ratings, reroll, rerollOptionsAvailable, roll,
} from '../src/game/engine';
import { simulateCampaign } from '../src/game/sim';
import { randomSeed } from '../src/game/rng';
import { FORMATION_NAMES } from '../src/data/formations';
import { COUNTRIES } from '../src/data/countries';
import { BANDS } from '../src/data/bands';
import type { Mode, Squad, Style } from '../src/game/types';

const squads: Squad[] = JSON.parse(fs.readFileSync('public/data/squads.json', 'utf8'));

// ---- data integrity ----
console.log(`squads: ${squads.length}, players: ${squads.reduce((a, s) => a + s.squad.length, 0)}`);
const validPos = new Set(['GK', 'RB', 'LB', 'CB', 'RM', 'LM', 'DM', 'CM', 'AM', 'RW', 'LW', 'ST']);
for (const s of squads) {
  if (!COUNTRIES[s.sel]) console.error('missing country:', s.sel);
  for (const p of s.squad) {
    if (p.pos.length === 0 || p.pos.some(x => !validPos.has(x))) console.error('bad pos', s.sel, s.copa, p.n, p.pos);
    if (p.f < 40 || p.f > 99) console.error('bad force', s.sel, s.copa, p.n, p.f);
  }
  if (!s.squad.some(p => p.pos.includes('GK'))) console.error('no GK', s.sel, s.copa);
}
if (BANDS.length !== squads.length) console.error('bands/squads mismatch', BANDS.length, squads.length);
console.log('2026 squads:', squads.filter(s => s.copa === 2026).map(s => s.sel).join(', '));

// ---- auto-drafted full runs ----
const N = 2000;
let champs = 0, perfects = 0, rerollsUsed = 0, stuckCount = 0;
const buckets: Record<string, [number, number]> = {};
const modes: Mode[] = ['classic', 'almanak', 'hardcore', 'wc2026'];
const styles: Style[] = ['defensive', 'balanced', 'offensive'];

for (let i = 0; i < N; i++) {
  const mode = modes[i % modes.length];
  const formation = FORMATION_NAMES[i % FORMATION_NAMES.length];
  const style = styles[i % styles.length];
  let game = createGame(randomSeed(), formation, style, mode);

  let guard = 0;
  while (game.draft.filled.some(f => f === null) && guard++ < 400) {
    game = roll(game, squads);
    let squad = findSquad(squads, game.current!.sel, game.current!.copa)!;
    // burn a wildcard sometimes, like a real player would
    if (game.draft.rerollsLeft > 0 && guard % 7 === 0) {
      const avail = rerollOptionsAvailable(game, squads);
      const axis = avail.cup && guard % 2 === 0 ? 'cup' : avail.team ? 'team' : avail.cup ? 'cup' : null;
      if (axis) {
        game = reroll(game, squads, axis);
        rerollsUsed++;
        squad = findSquad(squads, game.current!.sel, game.current!.copa)!;
      }
    }
    while (poolStuck(game.draft, squad)) {
      stuckCount++;
      const avail = rerollOptionsAvailable(game, squads);
      game = reroll(game, squads, avail.team ? 'team' : 'cup', true);
      squad = findSquad(squads, game.current!.sel, game.current!.copa)!;
    }
    // pick the strongest eligible player
    const eligible = squad.squad
      .filter(p => !game.draft.usedPlayerIds.includes(p.id) && eligiblePositions(game.draft, p).length > 0)
      .sort((a, b) => b.f - a.f);
    const p = eligible[0];
    const pos = eligiblePositions(game.draft, p)[0];
    const slotIdx = game.draft.slots.findIndex((s, si) => s.pos === pos && game.draft.filled[si] === null);
    game = { ...game, draft: applyChoose(game.draft, { ...p, sel: game.current!.sel, copa: game.current!.copa }, slotIdx), current: null };
  }
  if (game.draft.filled.some(f => f === null)) throw new Error('draft did not complete');

  const res = simulateCampaign(game.draft, game.seed, squads);
  if (res.campaign.length < 3 || res.campaign.length > 7) throw new Error('bad campaign length');
  for (const f of res.campaign) {
    if (f.scorers.length !== f.gf) throw new Error('scorer count mismatch');
    if (!COUNTRIES[f.oppSel]) throw new Error('bad opponent sel ' + f.oppSel);
  }
  // determinism check on first run
  if (i === 0) {
    const res2 = simulateCampaign(game.draft, game.seed, squads);
    if (JSON.stringify(res2.campaign.map(f => [f.gf, f.ga])) !== JSON.stringify(res.campaign.map(f => [f.gf, f.ga]))) {
      throw new Error('simulation is not deterministic for same seed');
    }
    console.log('sample run:', `overall ${res.overall} atk ${res.attack} def ${res.defense}`);
    res.campaign.forEach(f => console.log(` ${f.stage} ${f.gf}-${f.ga}${f.pens ? ` (p ${f.pens.score})` : ''} vs ${f.oppSel} ${f.oppCopa} -> ${f.group ? f.outcome : f.advanced ? 'adv' : 'OUT'}`));
  }
  if (res.champion) champs++;
  if (res.perfect) perfects++;
  const b = String(Math.floor(res.overall / 2) * 2);
  buckets[b] = buckets[b] || [0, 0];
  buckets[b][0]++;
  if (res.champion) buckets[b][1]++;
}

console.log(`\n${N} runs -> champion: ${(champs / N * 100).toFixed(1)}%, perfect: ${(perfects / N * 100).toFixed(1)}%, wildcards used: ${rerollsUsed}, stuck-pools: ${stuckCount}`);
Object.keys(buckets).sort((a, b) => +a - +b).forEach(b => {
  const [n, c] = buckets[b];
  console.log(`  overall ${b}-${+b + 2}: ${n} runs, champion ${(c / n * 100).toFixed(1)}%`);
});
