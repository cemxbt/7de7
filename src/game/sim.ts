// World Cup campaign simulation — faithful port of the original 7a0 model.
import { BANDS, type Band } from '../data/bands';
import type { DraftState, PlacedPlayer, Player, Pos, Squad } from './types';
import { ratings } from './engine';
import { pick, pickWeighted, poisson, rngFromSeed, type Rng } from './rng';

export type Stage = 'G1' | 'G2' | 'G3' | 'R16' | 'QF' | 'SF' | 'F';

const PHASES: { stage: Stage; group: boolean; overall: number }[] = [
  { stage: 'G1', group: true, overall: 68 },
  { stage: 'G2', group: true, overall: 72 },
  { stage: 'G3', group: true, overall: 76 },
  { stage: 'R16', group: false, overall: 79 },
  { stage: 'QF', group: false, overall: 83 },
  { stage: 'SF', group: false, overall: 87 },
  { stage: 'F', group: false, overall: 91 },
];

const MODEL = { baseLambda: 1.4, slope: 0.08, minLambda: 0.15, maxLambda: 5 };
const PENALTY = { base: 0.5, slope: 0.012, min: 0.1, max: 0.9 };
const CRUSHER_GD = 18;

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

function lambda(att: number, def: number): number {
  return clamp(MODEL.baseLambda + (att - def) * MODEL.slope, MODEL.minLambda, MODEL.maxLambda);
}

interface MatchScore { gf: number; ga: number; outcome: 'W' | 'D' | 'L' }

function playMatch(rng: Rng, attack: number, defense: number, opp: number): MatchScore {
  const gf = poisson(rng, lambda(attack, opp));
  const ga = poisson(rng, lambda(opp, defense));
  return { gf, ga, outcome: gf > ga ? 'W' : gf < ga ? 'L' : 'D' };
}

// ---------- scorers ----------

const SCORE_GROUP_W: Record<string, number> = { GK: 0.01, DEF: 0.12, DM: 0.22, MID: 0.45, AM: 0.7, ATT: 1 };
const POS_GROUP: Record<Pos, string> = {
  GK: 'GK', RB: 'DEF', CB: 'DEF', LB: 'DEF', RM: 'MID', LM: 'MID',
  DM: 'DM', CM: 'MID', AM: 'AM', RW: 'ATT', ST: 'ATT', LW: 'ATT',
};
// goalkeepers who actually scored in real life — allowed to score normally
const SCORING_GKS = new Set(['rogerio-ceni', 'jose-luis-chilavert', 'rene-higuita']);

const isGK = (p: Player) => p.pos.includes('GK');
const isScoringGK = (p: Player) => !!p.id && SCORING_GKS.has(p.id);
const scorerWeight = (p: Player) =>
  Math.max(...p.pos.map(pos => SCORE_GROUP_W[POS_GROUP[pos]] ?? 0.1)) * p.f;

/** pick scorer names for `goals` goals among `players` (weights decay after each goal) */
function pickScorers(rng: Rng, players: Player[], goals: number, opts?: { isKnockout?: boolean }): string[] {
  if (goals <= 0 || players.length === 0) return [];
  const weights = players.map(p => (isGK(p) && !isScoringGK(p) ? 0 : isGK(p) ? 0.25 * p.f : scorerWeight(p)));
  const names: string[] = [];
  for (let g = 0; g < goals; g++) {
    const last = g === goals - 1;
    const desperate = opts?.isKnockout === true && last;
    // a regular GK may only score the very last knockout goal (desperation header)
    const w = weights.map((base, i) => {
      const p = players[i];
      if (isGK(p) && !isScoringGK(p)) return desperate ? 0.15 * scorerWeight(p) : 0;
      return base;
    });
    const total = w.reduce((a, b) => a + b, 0);
    if (total <= 0) { names.push(players[0].n); continue; }
    let u = rng() * total;
    let i = 0;
    while (i < w.length - 1 && (u -= w[i]) > 0) i++;
    names.push(players[i].n);
    weights[i] *= 0.45;
  }
  return names;
}

/** distinct goal minutes, biased to later (pow .85) */
function goalMinutes(rng: Rng, count: number): number[] {
  if (count <= 0) return [];
  const set = new Set<number>();
  let guard = 0;
  while (set.size < count && guard++ < 1000) {
    set.add(1 + Math.floor(90 * Math.pow(rng(), 0.85)));
  }
  return [...set].sort((a, b) => a - b);
}

export interface GoalEvent { min: number; scorer: string; opp: boolean }

function buildGoals(rng: Rng, myScorers: string[], oppScorers: string[]): GoalEvent[] {
  const mins = goalMinutes(rng, myScorers.length);
  const oppMins = goalMinutes(rng, oppScorers.length);
  return [
    ...mins.map((min, i) => ({ min, scorer: myScorers[i], opp: false })),
    ...oppMins.map((min, i) => ({ min, scorer: oppScorers[i], opp: true })),
  ].sort((a, b) => a.min - b.min);
}

// ---------- match events (narrative layer: cards, penalties, drama) ----------

export type MatchEventType = 'goal' | 'pengoal' | 'penmiss' | 'yellow' | 'red' | 'post' | 'save' | 'miss';
export interface MatchEvent { min: number; type: MatchEventType; opp: boolean; player: string }

const CARD_W: Record<string, number> = { GK: 0.08, DEF: 1, DM: 1, MID: 0.55, AM: 0.4, ATT: 0.32 };
const cardWeight = (p: Player) => Math.max(...p.pos.map(pos => CARD_W[POS_GROUP[pos]] ?? 0.5));

/**
 * Generates the in-match storyline around the already-decided goals:
 * some goals become penalties, occasional missed pens, yellow/red cards
 * (second yellow always after the first), woodwork/save/miss drama.
 * Uses its own RNG stream so scores stay seed-compatible.
 */
function buildEvents(rng: Rng, goals: GoalEvent[], mine: Player[], theirs: Player[]): MatchEvent[] {
  const events: MatchEvent[] = [];
  const used = new Set(goals.map(g => g.min));
  const freeMin = (after = 1) => {
    for (let i = 0; i < 60; i++) {
      const m = after + Math.floor(rng() * (91 - after));
      if (m >= 1 && m <= 90 && !used.has(m)) { used.add(m); return m; }
    }
    return Math.min(90, after + 1);
  };

  // some goals were penalties
  for (const g of goals) {
    const pen = rng() < 0.1;
    events.push({ min: g.min, type: pen ? 'pengoal' : 'goal', opp: g.opp, player: g.scorer });
  }

  // occasional missed penalty
  for (const opp of [false, true]) {
    if (rng() < 0.07) {
      const squad = opp ? theirs : mine;
      if (squad.length > 0) {
        const taker = pickWeighted(rng, squad, squad.map(scorerWeight));
        events.push({ min: freeMin(), type: 'penmiss', opp, player: taker.n });
      }
    }
  }

  // yellow cards; a second yellow for the same player becomes a red
  const booked = new Map<string, number>(); // "side:name" -> minute of first yellow
  const nYellow = Math.min(6, poisson(rng, 1.7));
  for (let i = 0; i < nYellow; i++) {
    const opp = rng() < 0.55;
    const squad = opp ? theirs : mine;
    if (squad.length === 0) continue;
    const p = pickWeighted(rng, squad, squad.map(cardWeight));
    const key = `${+opp}:${p.n}`;
    const first = booked.get(key);
    if (first === undefined) {
      const m = freeMin();
      booked.set(key, m);
      events.push({ min: m, type: 'yellow', opp, player: p.n });
    } else if (first > 0) {
      events.push({ min: freeMin(first + 1), type: 'red', opp, player: p.n });
      booked.set(key, -1);
    }
  }

  // rare straight red
  if (rng() < 0.045) {
    const opp = rng() < 0.5;
    const squad = opp ? theirs : mine;
    if (squad.length > 0) {
      const p = pickWeighted(rng, squad, squad.map(cardWeight));
      if (booked.get(`${+opp}:${p.n}`) !== -1) {
        events.push({ min: freeMin(), type: 'red', opp, player: p.n });
        booked.set(`${+opp}:${p.n}`, -1);
      }
    }
  }

  // drama: woodwork, big saves, sitters missed
  const nFlavor = 1 + Math.floor(rng() * 3);
  for (let i = 0; i < nFlavor; i++) {
    const opp = rng() < 0.45;
    const squad = opp ? theirs : mine;
    if (squad.length === 0) continue;
    const p = pickWeighted(rng, squad, squad.map(scorerWeight));
    const r = rng();
    const type: MatchEventType = r < 0.34 ? 'post' : r < 0.67 ? 'save' : 'miss';
    events.push({ min: freeMin(), type, opp, player: p.n });
  }

  return events.sort((a, b) => a.min - b.min);
}

// ---------- penalties ----------

export interface PenaltyShootout {
  me: number[]; // 1 scored / 0 missed, in kick order
  them: number[];
  meNames: string[];
  themNames: string[];
  sd?: { me: number[]; them: number[]; meNames: string[]; themNames: string[] };
  score: string;
}

/** outfielders by force take the kicks */
function kickerNames(players: Player[], count: number): string[] {
  const sorted = [...players].sort((a, b) => {
    const ag = +isGK(a), bg = +isGK(b);
    return ag !== bg ? ag - bg : b.f - a.f;
  });
  return Array.from({ length: count }, (_, i) => sorted[i % sorted.length]?.n ?? '?');
}

/** when does a best-of-5 shootout stop early */
function shootoutCut(me: number[], them: number[]): [number, number] {
  let m = 0, t = 0;
  const n = me.length;
  for (let i = 0; i < n; i++) {
    m += me[i];
    if (m > t + (n - i)) return [i + 1, i];
    t += them[i];
    const left = n - 1 - i;
    if (m > t + left || t > m + left) return [i + 1, i + 1];
  }
  return [n, n];
}

function simShootout(rng: Rng, iWin: boolean, mine: Player[], theirs: Player[]): PenaltyShootout {
  for (let attempt = 0; attempt < 100; attempt++) {
    const me = Array.from({ length: 5 }, () => +(rng() < 0.78));
    const them = Array.from({ length: 5 }, () => +(rng() < 0.78));
    const mySum = me.reduce((a, b) => a + b, 0);
    const theirSum = them.reduce((a, b) => a + b, 0);
    if ((iWin ? mySum : theirSum) > (iWin ? theirSum : mySum)) {
      const [mc, tc] = shootoutCut(me, them);
      return {
        me: me.slice(0, mc), them: them.slice(0, tc),
        meNames: kickerNames(mine, mc), themNames: kickerNames(theirs, tc),
        score: `${mySum}–${theirSum}`,
      };
    }
    if (mySum === theirSum) {
      // sudden death
      const sdMe: number[] = [], sdThem: number[] = [];
      let m = mySum, t = theirSum, round = 0;
      while (m === t && round < 5) {
        round++;
        const a = +(rng() < 0.78), b = +(rng() < 0.78);
        if (a !== b) {
          const wa = +iWin, wb = +!iWin;
          sdMe.push(wa); sdThem.push(wb); m += wa; t += wb;
        } else {
          sdMe.push(a); sdThem.push(b); m += a; t += b;
        }
      }
      if (m === t) {
        const wa = +iWin, wb = +!iWin;
        sdMe.push(wa); sdThem.push(wb); m += wa; t += wb;
      }
      return {
        me, them,
        meNames: kickerNames(mine, 5), themNames: kickerNames(theirs, 5),
        sd: {
          me: sdMe, them: sdThem,
          meNames: kickerNames(mine, 5 + sdMe.length).slice(5),
          themNames: kickerNames(theirs, 5 + sdThem.length).slice(5),
        },
        score: `${m}–${t}`,
      };
    }
  }
  return iWin
    ? { me: [1, 0, 0, 0, 0], them: [0, 0, 0, 0, 0], meNames: kickerNames(mine, 5), themNames: kickerNames(theirs, 5), score: '1–0' }
    : { me: [0, 0, 0, 0, 0], them: [1, 0, 0, 0, 0], meNames: kickerNames(mine, 5), themNames: kickerNames(theirs, 5), score: '0–1' };
}

// ---------- opponent identities (real historical squads by strength band) ----------

const BANDS_2026: Band[] = BANDS.filter(b => b.copa === 2026);
const bandKey = (b: { sel: string; copa: number }) => `${b.sel}:${b.copa}`;

/** 7 real squads, weakest band bucket to strongest, weighted to stronger within window */
export function pickOpponents(rng: Rng, exclude: Set<string>, source: Band[] = BANDS): { sel: string; copa: number }[] {
  const sorted = [...source].sort((a, b) => a.band - b.band);
  const n7 = sorted.length;
  const bucket = n7 / 7;
  const overlap = 0.6 * bucket;
  const used = new Set<string>();
  const out: { sel: string; copa: number }[] = [];
  for (let n = 0; n < 7; n++) {
    const center = (n + 0.5) * bucket;
    const from = Math.max(0, Math.floor(center - bucket / 2 - overlap));
    const to = Math.min(n7, Math.ceil(center + bucket / 2 + overlap));
    const window = sorted.slice(from, to);
    let cands = window.filter(b => !used.has(bandKey(b)) && !exclude.has(bandKey(b)));
    if (cands.length === 0) cands = window.filter(b => !used.has(bandKey(b)));
    if (cands.length === 0) cands = window;
    const minBand = Math.min(...cands.map(b => b.band));
    const chosen = pickWeighted(rng, cands, cands.map(b => (b.band - minBand + 1) ** 2));
    used.add(bandKey(chosen));
    out.push({ sel: chosen.sel, copa: chosen.copa });
  }
  return out;
}

function pickEliminator(rng: Rng, exclude: Set<string>, source: Band[] = BANDS): { sel: string; copa: number } {
  const elims = source.filter(b => b.band >= 84);
  let pool = elims.filter(b => !exclude.has(bandKey(b)));
  if (pool.length === 0) pool = elims;
  const b = pick(rng, pool);
  return { sel: b.sel, copa: b.copa };
}

// ---------- campaign ----------

export interface GroupRow {
  me: boolean;
  sel?: string;
  copa?: number;
  pts: number;
  gd: number;
  gf: number;
}

export interface OtherMatch {
  aSel: string;
  aCopa: number;
  bSel: string;
  bCopa: number;
  ga: number;
  gb: number;
}

export interface Fixture {
  stage: Stage;
  group: boolean;
  oppOverall: number;
  oppSel: string;
  oppCopa: number;
  gf: number;
  ga: number;
  outcome: 'W' | 'D' | 'L';
  advanced: boolean;
  penalties?: boolean;
  pens?: PenaltyShootout;
  scorers: string[];
  conceded: string[];
  goals: GoalEvent[];
  events: MatchEvent[];
  groupTable?: GroupRow[];
  other?: OtherMatch;
}

export type Badge = 'CRUSHER' | 'WALL' | null;

export interface CampaignResult {
  record: string;
  champion: boolean;
  perfect: boolean;
  wins: number;
  draws: number;
  losses: number;
  gf: number;
  ga: number;
  overall: number;
  attack: number;
  defense: number;
  campaign: Fixture[];
  group: { sel: string; copa: number }[]; // the 3 group-stage rivals, in draw order
  badge: Badge;
  seed: string;
}

// the other group match each round (opponent indices): G1 -> 1v2, G2 -> 0v2, G3 -> 0v1
const OTHER_PAIR: [number, number][] = [[1, 2], [0, 2], [0, 1]];

export function simulateCampaign(draft: DraftState, seed: string, all: Squad[]): CampaignResult {
  const upper = seed.toUpperCase();
  const { attack, defense, overall } = ratings(draft);
  const xi = draft.filled.filter((p): p is PlacedPlayer => p !== null);
  const draftedFrom = new Set(xi.map(p => `${p.sel}:${p.copa}`));

  // WC 2026 mode is a closed universe: rivals come from the 48 real participants only
  const bandSource = draft.mode === 'wc2026' ? BANDS_2026 : BANDS;
  const opponents = pickOpponents(rngFromSeed(`${upper}:opp`), draftedFrom, bandSource);
  const oppSquad = (sel: string, copa: number): Player[] =>
    all.find(s => s.sel === sel && s.copa === copa)?.squad ?? [];

  const matchRng = rngFromSeed(`${upper}:copa`);
  const goalsRng = rngFromSeed(`${upper}:copa:gols`);
  const avg = (attack + defense) / 2;

  const campaign: Fixture[] = [];
  let wins = 0, draws = 0, losses = 0, gfTotal = 0, gaTotal = 0;
  let eliminated = false;
  let oppIdx = 0;

  // cumulative group standings: row 0 = me, rows 1..3 = group rivals
  const groupRows = [
    { me: true, oppIndex: -1, pts: 0, gd: 0, gf: 0 },
    ...[0, 1, 2].map(i => ({ me: false, oppIndex: i, pts: 0, gd: 0, gf: 0 })),
  ];
  const groupOveralls = PHASES.filter(p => p.group).map(p => p.overall);

  for (const phase of PHASES) {
    if (eliminated) break;
    const identity = opponents[oppIdx] ?? { sel: '', copa: 0 };
    const matchIndex = oppIdx;
    oppIdx++;

    const score = playMatch(matchRng, attack, defense, phase.overall);
    gfTotal += score.gf;
    gaTotal += score.ga;

    const oppPlayers = oppSquad(identity.sel, identity.copa);
    const scorers = pickScorers(goalsRng, xi, score.gf, { isKnockout: !phase.group });
    const conceded = pickScorers(goalsRng, oppPlayers, score.ga, { isKnockout: !phase.group });
    const goals = buildGoals(rngFromSeed(`${upper}:min:${matchIndex}`), scorers, conceded);
    const events = buildEvents(rngFromSeed(`${upper}:ev:${matchIndex}`), goals, xi, oppPlayers);

    if (phase.group) {
      if (score.outcome === 'W') wins++;
      else if (score.outcome === 'D') draws++;
      else losses++;

      // my result into the table
      groupRows[0].pts += score.outcome === 'W' ? 3 : score.outcome === 'D' ? 1 : 0;
      groupRows[0].gd += score.gf - score.ga;
      groupRows[0].gf += score.gf;
      const myOpp = groupRows[1 + matchIndex];
      myOpp.pts += score.outcome === 'L' ? 3 : score.outcome === 'D' ? 1 : 0;
      myOpp.gd += score.ga - score.gf;
      myOpp.gf += score.ga;

      // the parallel match of this round
      const [ai, bi] = OTHER_PAIR[matchIndex];
      const o = playMatch(matchRng, groupOveralls[ai], groupOveralls[ai], groupOveralls[bi]);
      const ra = groupRows[1 + ai], rb = groupRows[1 + bi];
      if (o.outcome === 'W') ra.pts += 3;
      else if (o.outcome === 'D') { ra.pts += 1; rb.pts += 1; }
      else rb.pts += 3;
      ra.gd += o.gf - o.ga; ra.gf += o.gf;
      rb.gd += o.ga - o.gf; rb.gf += o.ga;

      const sorted = [...groupRows].sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
      const fixture: Fixture = {
        stage: phase.stage, group: true, oppOverall: phase.overall,
        oppSel: identity.sel, oppCopa: identity.copa,
        gf: score.gf, ga: score.ga, outcome: score.outcome,
        advanced: true, scorers, conceded, goals, events,
        other: {
          aSel: opponents[ai].sel, aCopa: opponents[ai].copa,
          bSel: opponents[bi].sel, bCopa: opponents[bi].copa,
          ga: o.gf, gb: o.ga,
        },
        groupTable: sorted.map(r => r.me
          ? { me: true, pts: r.pts, gd: r.gd, gf: r.gf }
          : { me: false, pts: r.pts, gd: r.gd, gf: r.gf, sel: opponents[r.oppIndex]?.sel, copa: opponents[r.oppIndex]?.copa }),
      };
      campaign.push(fixture);
      if (phase.stage === 'G3' && sorted.findIndex(r => r.me) >= 2) eliminated = true;
      continue;
    }

    // knockout
    let advanced: boolean;
    let pens: PenaltyShootout | undefined;
    if (score.outcome === 'W') advanced = true;
    else if (score.outcome === 'L') advanced = false;
    else {
      const p = clamp(PENALTY.base + (avg - phase.overall) * PENALTY.slope, PENALTY.min, PENALTY.max);
      advanced = matchRng() < p;
      pens = simShootout(rngFromSeed(`${upper}:pen:${matchIndex}`), advanced, xi, oppPlayers);
    }
    if (advanced && score.outcome !== 'D') wins++;
    else if (!advanced && score.outcome !== 'D') losses++;
    else if (score.outcome === 'D') draws++;

    campaign.push({
      stage: phase.stage, group: false, oppOverall: phase.overall,
      oppSel: identity.sel, oppCopa: identity.copa,
      gf: score.gf, ga: score.ga, outcome: score.outcome,
      advanced, penalties: score.outcome === 'D', pens, scorers, conceded, goals, events,
    });
    if (!advanced) eliminated = true;
  }

  const champion = !eliminated;
  const perfect = champion && wins === 7 && draws === 0 && losses === 0;

  // your eliminator is always remembered as a giant of the game
  if (!champion) {
    const idx = campaign.findIndex(f => !f.advanced || (f.stage === 'G3' && f.groupTable && f.groupTable.findIndex(r => r.me) >= 2));
    const lastIdx = idx >= 0 ? idx : campaign.length - 1;
    const fixture = campaign[lastIdx];
    const exclude = new Set([...draftedFrom, ...opponents.map(bandKey)]);
    const elim = pickEliminator(rngFromSeed(`${upper}:elim`), exclude, bandSource);
    const elimSquad = oppSquad(elim.sel, elim.copa);
    if (elimSquad.length > 0 && !fixture.group) {
      fixture.oppSel = elim.sel;
      fixture.oppCopa = elim.copa;
      const regen = pickScorers(rngFromSeed(`${upper}:elim:gols`), elimSquad, fixture.ga, { isKnockout: true });
      fixture.conceded = regen;
      fixture.goals = buildGoals(rngFromSeed(`${upper}:elim:min`), fixture.scorers, regen);
      fixture.events = buildEvents(rngFromSeed(`${upper}:elim:ev`), fixture.goals, xi, elimSquad);
      if (fixture.pens) fixture.pens.themNames = kickerNames(elimSquad, fixture.pens.them.length);
    }
  }

  const badge: Badge = perfect && gfTotal - gaTotal >= CRUSHER_GD ? 'CRUSHER' : champion && gaTotal === 0 ? 'WALL' : null;

  return {
    record: `${wins}-${losses}`,
    champion, perfect, wins, draws, losses,
    gf: gfTotal, ga: gaTotal,
    overall, attack, defense,
    campaign, group: opponents.slice(0, 3), badge, seed: upper,
  };
}
