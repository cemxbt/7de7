// Draft engine — faithful port of the original 7a0 mechanics.
import { FORMATIONS, type FormationName } from '../data/formations';
import type {
  DraftState, GameState, Mode, Player, PlacedPlayer, Pos, Ratings, Squad, SquadKey, Style,
} from './types';
import { MODES } from './types';
import { pick, pickWeighted, rngFromSeed, type Rng } from './rng';

export const squadKey = (sel: string, copa: number): SquadKey => `${sel}:${copa}`;

// countries that continue each other (Soviet Union -> Russia etc.)
const ALIASES: Record<string, string[]> = {
  URS: ['URS', 'RUS'], RUS: ['URS', 'RUS'],
  YUG: ['YUG', 'SRB'], SRB: ['YUG', 'SRB'],
  TCH: ['TCH', 'CZE'], CZE: ['TCH', 'CZE'],
};

export const POS_ORDER: Record<Pos, number> = {
  GK: 0, RB: 1, LB: 2, CB: 3, RM: 4, LM: 5, DM: 6, CM: 7, AM: 8, RW: 9, LW: 10, ST: 11,
};

const ATK_W: Record<Pos, number> = { GK: 0, RB: 0, CB: 0, LB: 0, RM: 0.5, LM: 0.5, DM: 0.2, CM: 0.5, AM: 0.8, RW: 1, ST: 1, LW: 1 };
const DEF_W: Record<Pos, number> = { GK: 1, RB: 1, CB: 1, LB: 1, RM: 0.5, LM: 0.5, DM: 0.8, CM: 0.5, AM: 0.2, RW: 0, ST: 0, LW: 0 };

// ---------- draft state ----------

export function createDraft(formation: FormationName, style: Style, mode: Mode): DraftState {
  const slots = FORMATIONS[formation][style];
  return {
    formation, style, mode,
    slots: slots.map(s => ({ ...s })),
    filled: slots.map(() => null),
    usedPlayerIds: [],
    rerollsLeft: MODES[mode].rerolls,
  };
}

export function createGame(seed: string, formation: FormationName, style: Style, mode: Mode): GameState {
  return {
    seed,
    rollIndex: 0,
    rerollNo: 0,
    draft: createDraft(formation, style, mode),
    current: null,
    recent: [],
  };
}

function emptyCountByPos(draft: DraftState): Record<string, number> {
  const counts: Record<string, number> = {};
  draft.slots.forEach((s, i) => {
    if (draft.filled[i] === null) counts[s.pos] = (counts[s.pos] ?? 0) + 1;
  });
  return counts;
}

/** positions of this player that still have an empty slot */
export function eligiblePositions(draft: DraftState, player: Player): Pos[] {
  const empty = emptyCountByPos(draft);
  return player.pos.filter(p => (empty[p] ?? 0) > 0);
}

export function isPlayerSelectable(draft: DraftState, player: Player): boolean {
  return !draft.usedPlayerIds.includes(player.id) && eligiblePositions(draft, player).length > 0;
}

/** true when the current squad offers no selectable player (free emergency reroll) */
export function poolStuck(draft: DraftState, squad: Squad | undefined): boolean {
  if (!squad) return false;
  if (draft.filled.every(f => f !== null)) return false;
  return squad.squad.every(p => !isPlayerSelectable(draft, p));
}

/** slots a placed player can move to (empty compatible, or swap with mutually compatible) */
export function moveTargets(draft: DraftState, from: number): number[] {
  const mover = draft.filled[from];
  const fromSlot = draft.slots[from];
  if (!mover || !fromSlot) return [];
  const targets: number[] = [];
  draft.slots.forEach((slot, i) => {
    if (i === from) return;
    const occupant = draft.filled[i];
    if (occupant) {
      if (mover.pos.includes(slot.pos) && occupant.pos.includes(fromSlot.pos)) targets.push(i);
    } else if (mover.pos.includes(slot.pos)) {
      targets.push(i);
    }
  });
  return targets;
}

export function applyMove(draft: DraftState, from: number, to: number): DraftState {
  const filled = draft.filled.slice();
  const mover = filled[from];
  filled[from] = filled[to] ?? null;
  filled[to] = mover;
  return { ...draft, filled };
}

export function applyChoose(draft: DraftState, player: PlacedPlayer, slotIdx: number): DraftState {
  if (draft.usedPlayerIds.includes(player.id)) throw new Error('player already used');
  if (draft.filled[slotIdx] !== null) throw new Error('slot occupied');
  if (!player.pos.includes(draft.slots[slotIdx].pos)) throw new Error('incompatible position');
  const filled = draft.filled.slice();
  filled[slotIdx] = player;
  return { ...draft, filled, usedPlayerIds: [...draft.usedPlayerIds, player.id] };
}

// ---------- ratings ----------

export function overall(draft: DraftState): number {
  const placed = draft.filled.filter((p): p is PlacedPlayer => p !== null);
  if (placed.length === 0) return 0;
  return Math.round(placed.reduce((a, p) => a + p.f, 0) / placed.length);
}

export function ratings(draft: DraftState): Ratings {
  let atkSum = 0, atkW = 0, defSum = 0, defW = 0, total = 0, count = 0;
  draft.slots.forEach((slot, i) => {
    const p = draft.filled[i];
    const aw = ATK_W[slot.pos];
    const dw = DEF_W[slot.pos];
    atkW += aw;
    defW += dw;
    if (p) {
      atkSum += p.f * aw;
      defSum += p.f * dw;
      total += p.f;
      count++;
    }
  });
  return {
    attack: atkW > 0 ? Math.round(atkSum / atkW) : 0,
    defense: defW > 0 ? Math.round(defSum / defW) : 0,
    overall: count > 0 ? Math.round(total / count) : 0,
  };
}

// ---------- rolling ----------

/** strength weights: stronger squads appear more often (0.15..1, quadratic) */
function squadWeights(pool: Squad[]): Map<SquadKey, number> {
  const avgs = pool.map(s => ({
    key: squadKey(s.sel, s.copa),
    avg: s.squad.length === 0 ? 75 : s.squad.reduce((a, p) => a + p.f, 0) / s.squad.length,
  }));
  const vals = avgs.map(a => a.avg);
  const min = Math.min(...vals);
  const range = Math.max(...vals) - min || 1;
  const map = new Map<SquadKey, number>();
  for (const a of avgs) map.set(a.key, 0.15 + 0.85 * ((a.avg - min) / range) ** 2);
  return map;
}

export function modePool(all: Squad[], mode: Mode): Squad[] {
  const copa = MODES[mode].poolCopa;
  return copa === null ? all : all.filter(s => s.copa === copa);
}

const keepRecent = (recent: SquadKey[], k: SquadKey): SquadKey[] => [...recent, k].slice(-6);

export function roll(game: GameState, all: Squad[]): GameState {
  const pool = modePool(all, game.draft.mode);
  const rng = rngFromSeed(`${game.seed}:roll:${game.rollIndex}`);
  const weights = squadWeights(pool);
  const entries = pool.map(s => ({ sel: s.sel, copa: s.copa }));
  const recent = new Set(game.recent);
  const fresh = entries.filter(e => !recent.has(squadKey(e.sel, e.copa)));
  const candidates = fresh.length ? fresh : entries;
  const chosen = pickWeighted(rng, candidates, candidates.map(e => weights.get(squadKey(e.sel, e.copa)) ?? 0.5));
  return {
    ...game,
    current: chosen,
    rollIndex: game.rollIndex + 1,
    rerollNo: 0,
    recent: keepRecent(game.recent, squadKey(chosen.sel, chosen.copa)),
  };
}

export type RerollAxis = 'team' | 'cup';

function rerollPick(
  rng: Rng, pool: Squad[], current: { sel: string; copa: number },
  axis: RerollAxis, exclude: Set<SquadKey>,
): { sel: string; copa: number } {
  if (axis === 'cup') {
    // same team (incl. historical aliases), another cup — weighted toward stronger eras
    const weights = squadWeights(pool);
    const sels = ALIASES[current.sel] ?? [current.sel];
    const opts = pool
      .filter(s => sels.includes(s.sel) && (s.sel !== current.sel || s.copa !== current.copa))
      .map(s => ({ sel: s.sel, copa: s.copa }));
    if (opts.length === 0) return current;
    const fresh = opts.filter(o => !exclude.has(squadKey(o.sel, o.copa)));
    const candidates = fresh.length ? fresh : opts;
    return pickWeighted(rng, candidates, candidates.map(o => weights.get(squadKey(o.sel, o.copa)) ?? 0.5));
  }
  // same cup, another team — uniform
  const sels = pool.filter(s => s.copa === current.copa && s.sel !== current.sel).map(s => s.sel);
  if (sels.length === 0) return current;
  const fresh = sels.filter(sel => !exclude.has(squadKey(sel, current.copa)));
  return { sel: pick(rng, fresh.length ? fresh : sels), copa: current.copa };
}

export function rerollOptionsAvailable(game: GameState, all: Squad[]): { team: boolean; cup: boolean } {
  if (!game.current) return { team: false, cup: false };
  const pool = modePool(all, game.draft.mode);
  const sels = ALIASES[game.current.sel] ?? [game.current.sel];
  const cur = game.current;
  return {
    team: pool.some(s => s.copa === cur.copa && s.sel !== cur.sel),
    cup: pool.some(s => sels.includes(s.sel) && (s.sel !== cur.sel || s.copa !== cur.copa)),
  };
}

export function reroll(game: GameState, all: Squad[], axis: RerollAxis, free = false): GameState {
  if (!game.current) throw new Error('nothing to reroll');
  if (!free && game.draft.rerollsLeft <= 0) throw new Error('no rerolls left');
  const pool = modePool(all, game.draft.mode);
  const rng = rngFromSeed(`${game.seed}:roll:${game.rollIndex}:rr:${game.rerollNo}:${axis}`);
  const exclude = new Set(game.recent);
  const next = rerollPick(rng, pool, game.current, axis, exclude);
  return {
    ...game,
    current: next,
    rerollNo: game.rerollNo + 1,
    draft: free ? game.draft : { ...game.draft, rerollsLeft: game.draft.rerollsLeft - 1 },
    recent: keepRecent(game.recent, squadKey(next.sel, next.copa)),
  };
}

export function findSquad(all: Squad[], sel: string, copa: number): Squad | undefined {
  return all.find(s => s.sel === sel && s.copa === copa);
}

/**
 * Fills the remaining slots automatically (used when a timed duel draft
 * expires): keeps rolling and placing the strongest eligible player.
 */
export function autoCompleteGame(game: GameState, all: Squad[]): GameState {
  let g = game;
  for (let guard = 0; guard < 400; guard++) {
    const empty = g.draft.filled.some(f => f === null);
    if (!empty) break;
    if (!g.current) {
      g = roll(g, all);
      continue;
    }
    const squad = findSquad(all, g.current.sel, g.current.copa);
    const candidates = (squad?.squad ?? []).filter(p => isPlayerSelectable(g.draft, p));
    if (candidates.length === 0) {
      g = reroll(g, all, 'team', true); // emergency reroll, free of charge
      continue;
    }
    const best = candidates.reduce((a, b) => (b.f > a.f ? b : a));
    const slotPos = eligiblePositions(g.draft, best)[0];
    const slotIdx = g.draft.slots.findIndex((s, i) => s.pos === slotPos && g.draft.filled[i] === null);
    const placed: PlacedPlayer = { ...best, sel: g.current.sel, copa: g.current.copa };
    g = { ...g, draft: applyChoose(g.draft, placed, slotIdx), current: null };
  }
  return g;
}
