// quick sanity check: god picks must block every rival steal and take their best
import { defaultPicks, godPicks, resolveSteals, type DuelTeam } from '../src/challenge';
import type { PlacedPlayer, Pos } from '../src/game/types';

const mk = (id: string, f: number, pos: Pos = 'CM'): PlacedPlayer =>
  ({ id, n: id, pos: [pos], no: 1, f, sel: 'BRA', copa: 2002 });

const positions: Pos[] = ['GK', 'RB', 'CB', 'CB', 'LB', 'DM', 'CM', 'AM', 'RW', 'ST', 'LW'];
const mine = positions.map((p, i) => mk(`me${i}`, 99 - i, p)); // me0=99 ... me10=89
const theirs = positions.map((p, i) => mk(`op${i}`, 95 - i, p)); // op0=95 ... op10=85

const creator: DuelTeam = { formation: '4-3-3', style: 'balanced', team: mine };
const opponent: DuelTeam = { formation: '4-3-3', style: 'balanced', team: theirs };

const theirPicks = defaultPicks(theirs, mine); // rival plays optimally
const myPicks = godPicks(mine, theirs, theirPicks); // I counter their picks

const out = resolveSteals(creator, opponent, myPicks, theirPicks);

console.log('my steals  :', out.creatorResults.map(r => `${r.wanted.id}->${r.got?.id} ${r.blocked ? 'BLOCKED' : 'ok'}`));
console.log('their steals:', out.opponentResults.map(r => `${r.wanted.id}->${r.got?.id} ${r.blocked ? 'BLOCKED' : 'ok'}`));

const avg = (xs: PlacedPlayer[]) => (xs.reduce((a, p) => a + p.f, 0) / xs.length).toFixed(1);
console.log('me  : before', avg(mine), '-> after', avg(out.creatorFinal), `(${out.creatorFinal.length} players)`);
console.log('them: before', avg(theirs), '-> after', avg(out.opponentFinal), `(${out.opponentFinal.length} players)`);

const allBlocked = out.opponentResults.every(r => r.blocked);
// rival protected op0-2, so the best stealable players are op3-5
const iGotBest = out.creatorResults.every(r => !r.blocked) &&
  out.creatorResults.map(r => r.got?.id).join() === 'op3,op4,op5';
const theyGotWorst = out.opponentResults.every(r => r.got && ['me8', 'me9', 'me10'].includes(r.got.id));
console.log(allBlocked && iGotBest && theyGotWorst && out.creatorFinal.length === 11 && out.opponentFinal.length === 11
  ? 'PASS' : 'FAIL');
