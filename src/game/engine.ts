import { SQUADS, type Pos, type Player, type Squad } from '../data/squads';

export type Mode = 'classic' | 'memory' | 'hardcore';
export type Style = 'defensive' | 'balanced' | 'offensive';

export interface FormationRow {
  p: Pos;
  n: number;
}

export interface Formation {
  name: string;
  rows: FormationRow[]; // attack -> defense, GK last
}

export const FORMATIONS: Formation[] = [
  { name: '4-3-3', rows: [{ p: 'FW', n: 3 }, { p: 'MF', n: 3 }, { p: 'DF', n: 4 }, { p: 'GK', n: 1 }] },
  { name: '4-4-2', rows: [{ p: 'FW', n: 2 }, { p: 'MF', n: 4 }, { p: 'DF', n: 4 }, { p: 'GK', n: 1 }] },
  { name: '4-2-3-1', rows: [{ p: 'FW', n: 1 }, { p: 'MF', n: 3 }, { p: 'MF', n: 2 }, { p: 'DF', n: 4 }, { p: 'GK', n: 1 }] },
  { name: '4-2-4', rows: [{ p: 'FW', n: 4 }, { p: 'MF', n: 2 }, { p: 'DF', n: 4 }, { p: 'GK', n: 1 }] },
  { name: '3-5-2', rows: [{ p: 'FW', n: 2 }, { p: 'MF', n: 5 }, { p: 'DF', n: 3 }, { p: 'GK', n: 1 }] },
  { name: '5-3-2', rows: [{ p: 'FW', n: 2 }, { p: 'MF', n: 3 }, { p: 'DF', n: 5 }, { p: 'GK', n: 1 }] },
  { name: '4-5-1', rows: [{ p: 'FW', n: 1 }, { p: 'MF', n: 5 }, { p: 'DF', n: 4 }, { p: 'GK', n: 1 }] },
  { name: '3-4-3', rows: [{ p: 'FW', n: 3 }, { p: 'MF', n: 4 }, { p: 'DF', n: 3 }, { p: 'GK', n: 1 }] },
];

export interface Slot {
  id: number;
  pos: Pos;
  row: number; // index into formation.rows
  player: (Player & { squad: string; flag: string; year: number }) | null;
}

export function makeSlots(formation: Formation): Slot[] {
  const slots: Slot[] = [];
  let id = 0;
  formation.rows.forEach((row, ri) => {
    for (let i = 0; i < row.n; i++) {
      slots.push({ id: id++, pos: row.p, row: ri, player: null });
    }
  });
  return slots;
}

// ---------- squad strength ----------

function bestXIStrength(squad: Squad): number {
  const byPos = (p: Pos) => squad.players.filter(pl => pl.p === p).sort((a, b) => b.r - a.r);
  const pick: number[] = [];
  pick.push(...byPos('GK').slice(0, 1).map(p => p.r));
  pick.push(...byPos('DF').slice(0, 4).map(p => p.r));
  pick.push(...byPos('MF').slice(0, 4).map(p => p.r));
  pick.push(...byPos('FW').slice(0, 2).map(p => p.r));
  // pad with remaining best players if a line is short
  if (pick.length < 11) {
    const used = new Set<Player>();
    const rest = squad.players.slice().sort((a, b) => b.r - a.r).filter(p => !used.has(p));
    for (const p of rest) {
      if (pick.length >= 11) break;
      pick.push(p.r);
    }
  }
  return pick.reduce((a, b) => a + b, 0) / pick.length;
}

export interface Opponent {
  c: string;
  tr: string;
  f: string;
  y: number;
  str: number;
}

const OPPONENTS: Opponent[] = SQUADS.map(s => ({ c: s.c, tr: s.tr, f: s.f, y: s.y, str: bestXIStrength(s) }));

// ---------- draft ----------

export function rollSquad(usedIdx: Set<number>): { squad: Squad; idx: number } {
  const available = SQUADS.map((_, i) => i).filter(i => !usedIdx.has(i));
  const pool = available.length > 0 ? available : SQUADS.map((_, i) => i);
  const idx = pool[Math.floor(Math.random() * pool.length)];
  return { squad: SQUADS[idx], idx };
}

// ---------- simulation ----------

function poisson(lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}

export function teamStrength(slots: Slot[]): number {
  const filled = slots.filter(s => s.player);
  if (filled.length === 0) return 0;
  return filled.reduce((a, s) => a + s.player!.r, 0) / filled.length;
}

interface StyleMod {
  atk: number;
  def: number;
}

const STYLE_MODS: Record<Style, StyleMod> = {
  offensive: { atk: 0.35, def: 0.3 },   // score more, concede more
  balanced: { atk: 0, def: 0 },
  defensive: { atk: -0.3, def: -0.35 }, // score less, concede less
};

function simScore(strA: number, strB: number, style: Style): [number, number] {
  const mod = STYLE_MODS[style];
  const diff = strA - strB;
  const xgA = clamp(1.3 + diff * 0.16 + mod.atk, 0.1, 5.2);
  const xgB = clamp(1.15 - diff * 0.13 + mod.def, 0.1, 5.2);
  return [poisson(xgA), poisson(xgB)];
}

export interface Scorer {
  name: string;
  minute: number;
}

function pickScorers(slots: Slot[], goals: number): Scorer[] {
  const players = slots.filter(s => s.player).map(s => s.player!);
  const weights = players.map(p => {
    const posW = p.p === 'FW' ? 8 : p.p === 'MF' ? 4 : p.p === 'DF' ? 1 : 0.05;
    return posW * Math.max(1, p.r - 55);
  });
  const total = weights.reduce((a, b) => a + b, 0);
  const scorers: Scorer[] = [];
  for (let g = 0; g < goals; g++) {
    let r = Math.random() * total;
    let i = 0;
    while (r > weights[i]) {
      r -= weights[i];
      i++;
    }
    scorers.push({ name: players[i].n, minute: 1 + Math.floor(Math.random() * 90) });
  }
  return scorers.sort((a, b) => a.minute - b.minute);
}

function simPenalties(gkA: number, gkB: number): [number, number] {
  // conversion prob reduced by opposing GK quality
  const pA = clamp(0.78 - (gkB - 80) * 0.008, 0.55, 0.92);
  const pB = clamp(0.78 - (gkA - 80) * 0.008, 0.55, 0.92);
  let a = 0;
  let b = 0;
  for (let i = 0; i < 5; i++) {
    if (Math.random() < pA) a++;
    if (Math.random() < pB) b++;
  }
  while (a === b) {
    const sa = Math.random() < pA ? 1 : 0;
    const sb = Math.random() < pB ? 1 : 0;
    a += sa;
    b += sb;
    if (sa !== sb) break;
  }
  return [a, b];
}

export type Stage = 'G1' | 'G2' | 'G3' | 'R16' | 'QF' | 'SF' | 'F';

export interface MatchResult {
  stage: Stage;
  opp: Opponent;
  gf: number;
  ga: number;
  scorers: Scorer[];
  pens: [number, number] | null;
  won: boolean;
  drawn: boolean;
}

export interface TableRow {
  name: string; // 'YOU' for player team
  tr: string;
  flag: string;
  year: number | null;
  pts: number;
  gf: number;
  ga: number;
}

export interface TournamentResult {
  matches: MatchResult[];
  groupTable: TableRow[];
  champion: boolean;
  perfect: boolean; // 7 wins in 90 minutes
  eliminatedAt: Stage | 'GROUP' | null;
  wins: number;
  draws: number;
  losses: number;
  gf: number;
  ga: number;
  teamStr: number;
}

function sample<T>(arr: T[], n: number, exclude: Set<T>): T[] {
  const pool = arr.filter(x => !exclude.has(x));
  const out: T[] = [];
  while (out.length < n && pool.length > 0) {
    const i = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(i, 1)[0]);
  }
  return out;
}

function pickKnockoutOpp(minPercentile: number, used: Set<Opponent>): Opponent {
  const sorted = OPPONENTS.slice().sort((a, b) => a.str - b.str);
  const from = Math.floor(sorted.length * minPercentile);
  const pool = sorted.slice(from).filter(o => !used.has(o));
  const fallback = sorted.filter(o => !used.has(o));
  const p = pool.length > 0 ? pool : fallback.length > 0 ? fallback : sorted;
  return p[Math.floor(Math.random() * p.length)];
}

export function simulateTournament(slots: Slot[], style: Style): TournamentResult {
  const str = teamStrength(slots);
  const gk = slots.find(s => s.pos === 'GK' && s.player)?.player?.r ?? 70;
  const used = new Set<Opponent>();
  const matches: MatchResult[] = [];

  // ----- group stage -----
  const groupOpps = sample(OPPONENTS, 3, used);
  groupOpps.forEach(o => used.add(o));

  const stages: Stage[] = ['G1', 'G2', 'G3'];
  const myRow: TableRow = { name: 'YOU', tr: 'YOU', flag: '⭐', year: null, pts: 0, gf: 0, ga: 0 };
  const oppRows: TableRow[] = groupOpps.map(o => ({ name: o.c, tr: o.tr, flag: o.f, year: o.y, pts: 0, gf: 0, ga: 0 }));

  groupOpps.forEach((o, i) => {
    const [gf, ga] = simScore(str, o.str, style);
    matches.push({
      stage: stages[i], opp: o, gf, ga,
      scorers: pickScorers(slots, gf), pens: null,
      won: gf > ga, drawn: gf === ga,
    });
    myRow.gf += gf;
    myRow.ga += ga;
    myRow.pts += gf > ga ? 3 : gf === ga ? 1 : 0;
    oppRows[i].gf += ga;
    oppRows[i].ga += gf;
    oppRows[i].pts += ga > gf ? 3 : ga === gf ? 1 : 0;
  });

  // matches among the 3 opponents
  for (let i = 0; i < 3; i++) {
    for (let j = i + 1; j < 3; j++) {
      const [gi, gj] = simScore(groupOpps[i].str, groupOpps[j].str, 'balanced');
      oppRows[i].gf += gi;
      oppRows[i].ga += gj;
      oppRows[j].gf += gj;
      oppRows[j].ga += gi;
      oppRows[i].pts += gi > gj ? 3 : gi === gj ? 1 : 0;
      oppRows[j].pts += gj > gi ? 3 : gj === gi ? 1 : 0;
    }
  }

  const table = [myRow, ...oppRows].sort((a, b) =>
    b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf || (a.name === 'YOU' ? -1 : 1)
  );
  const myPlace = table.findIndex(r => r.name === 'YOU');

  const result: TournamentResult = {
    matches, groupTable: table, champion: false, perfect: false,
    eliminatedAt: null, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, teamStr: str,
  };

  const tally = () => {
    result.wins = matches.filter(m => m.won).length;
    result.draws = matches.filter(m => m.drawn && !m.pens).length;
    result.losses = matches.filter(m => !m.won && !(m.drawn && !m.pens)).length;
    result.gf = matches.reduce((a, m) => a + m.gf, 0);
    result.ga = matches.reduce((a, m) => a + m.ga, 0);
  };

  if (myPlace > 1) {
    result.eliminatedAt = 'GROUP';
    tally();
    return result;
  }

  // ----- knockout -----
  const knockout: { stage: Stage; pct: number }[] = [
    { stage: 'R16', pct: 0.1 },
    { stage: 'QF', pct: 0.35 },
    { stage: 'SF', pct: 0.55 },
    { stage: 'F', pct: 0.7 },
  ];

  for (const k of knockout) {
    const opp = pickKnockoutOpp(k.pct, used);
    used.add(opp);
    const [gf, ga] = simScore(str, opp.str, style);
    let pens: [number, number] | null = null;
    let won = gf > ga;
    if (gf === ga) {
      const oppGk = 74 + (opp.str - 74) * 0.5;
      pens = simPenalties(gk, oppGk);
      won = pens[0] > pens[1];
    }
    matches.push({ stage: k.stage, opp, gf, ga, scorers: pickScorers(slots, gf), pens, won, drawn: gf === ga });
    if (!won) {
      result.eliminatedAt = k.stage;
      tally();
      return result;
    }
  }

  result.champion = true;
  result.perfect = matches.every(m => m.won && !m.pens);
  tally();
  return result;
}
