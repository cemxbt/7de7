import { FORMATIONS, makeSlots, rollSquad, simulateTournament, teamStrength } from '../src/game/engine';
import { SQUADS } from '../src/data/squads';

// data sanity
for (const s of SQUADS) {
  const counts = { GK: 0, DF: 0, MF: 0, FW: 0 };
  s.players.forEach(p => counts[p.p]++);
  if (counts.GK < 1 || counts.DF < 3 || counts.MF < 3 || counts.FW < 2) {
    console.error('THIN SQUAD:', s.c, s.y, counts);
  }
  const names = new Set(s.players.map(p => p.n));
  if (names.size !== s.players.length) console.error('DUP NAME in', s.c, s.y);
}
console.log(`squads: ${SQUADS.length}, players: ${SQUADS.reduce((a, s) => a + s.players.length, 0)}`);

// simulate full runs with auto-drafted teams
let champs = 0;
let perfects = 0;
const buckets: Record<string, [number, number]> = {};
const N = 2000;
for (let i = 0; i < N; i++) {
  const formation = FORMATIONS[i % FORMATIONS.length];
  const slots = makeSlots(formation);
  const used = new Set<number>();
  for (const slot of slots) {
    // roll until a squad offers the needed position (always should)
    for (let tries = 0; tries < 50 && !slot.player; tries++) {
      const { squad } = rollSquad(used);
      const candidates = squad.players.filter(p => p.p === slot.pos);
      if (candidates.length > 0) {
        const best = candidates.sort((a, b) => b.r - a.r)[0];
        slot.player = { ...best, squad: squad.c, flag: squad.f, year: squad.y };
      }
    }
    if (!slot.player) throw new Error('could not fill slot ' + slot.pos);
  }
  const res = simulateTournament(slots, i % 3 === 0 ? 'offensive' : i % 3 === 1 ? 'balanced' : 'defensive');
  if (res.matches.length < 3 || res.matches.length > 7) throw new Error('bad match count');
  if (res.champion) champs++;
  if (res.perfect) perfects++;
  const b = String(Math.floor(teamStrength(slots) / 2) * 2);
  buckets[b] = buckets[b] || [0, 0];
  buckets[b][0]++;
  if (res.champion) buckets[b][1]++;
  if (i === 0) {
    console.log('sample run, team str', teamStrength(slots).toFixed(1));
    res.matches.forEach(m => console.log(` ${m.stage} ${m.gf}-${m.ga}${m.pens ? ` (p ${m.pens[0]}-${m.pens[1]})` : ''} vs ${m.opp.c} ${m.opp.y} -> ${m.won ? 'W' : m.drawn ? 'D' : 'L'}`));
    console.log(' champion:', res.champion, 'eliminatedAt:', res.eliminatedAt);
  }
}
console.log(`${N} sims -> champion rate: ${(champs / N * 100).toFixed(1)}%, perfect: ${(perfects / N * 100).toFixed(1)}%`);
Object.keys(buckets).sort().forEach(b => {
  const [n, c] = buckets[b];
  console.log(`  str ${b}-${+b + 2}: ${n} runs, champion ${(c / n * 100).toFixed(1)}%`);
});
