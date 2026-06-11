// Online competition: daily challenge + 1v1 duels on a shared seed.
import { FORMATIONS, type FormationName } from './data/formations';
import { simulateShowdown, type CampaignResult, type ShowdownMatch } from './game/sim';
import type { DraftState, Mode, PlacedPlayer, Player, Pos, Style } from './game/types';
import { supabase } from './online';

// ---------- shared ----------

export interface ChallengeResult {
  overall: number;
  champion: boolean;
  perfect: boolean;
  wins: number;
  losses: number;
  gd: number;
  gf: number;
  stage: string;
  formation: string;
  mode: Mode;
  // squad snapshot for head-to-head showdowns (absent in older results)
  attack?: number;
  defense?: number;
  team?: PlacedPlayer[];
  // god-mode run: the showdown is rigged so this side cannot lose
  god?: boolean;
}

export function toChallengeResult(res: CampaignResult, draft: DraftState): ChallengeResult {
  const last = res.campaign[res.campaign.length - 1];
  return {
    overall: res.overall,
    champion: res.champion,
    perfect: res.perfect,
    wins: res.wins,
    losses: res.losses,
    gd: res.gf - res.ga,
    gf: res.gf,
    stage: res.champion ? 'CHAMP' : last?.stage ?? 'G1',
    formation: draft.formation,
    mode: draft.mode,
    attack: res.attack,
    defense: res.defense,
    team: draft.filled.filter((p): p is PlacedPlayer => p !== null),
  };
}

const STAGE_RANK: Record<string, number> = { G1: 0, G2: 0, G3: 0, R16: 1, QF: 2, SF: 3, F: 4, CHAMP: 5 };

/** 1 if a beats b, -1 if b beats a, 0 draw */
export function compareResults(a: ChallengeResult, b: ChallengeResult): number {
  const keys: (keyof ChallengeResult)[] = ['wins', 'gd', 'gf', 'overall'];
  const ra = STAGE_RANK[a.stage] ?? 0, rb = STAGE_RANK[b.stage] ?? 0;
  if (ra !== rb) return ra > rb ? 1 : -1;
  for (const k of keys) {
    if (a[k] !== b[k]) return (a[k] as number) > (b[k] as number) ? 1 : -1;
  }
  return 0;
}

// ---------- daily challenge ----------

export const todayKey = () => new Date().toISOString().slice(0, 10); // UTC day
export const dailySeed = () => `DAILY-${todayKey()}`;

// ---------- weekly league (hardcore, one attempt per ISO week) ----------

export function weekKey(): string {
  const d = new Date();
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day); // Thursday decides the ISO week-year
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export const weeklySeed = () => `WEEKLY-${weekKey()}`;

export async function hasPlayedWeekly(userId: string): Promise<boolean> {
  const { count } = await supabase
    .from('weekly_scores')
    .select('week', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('week', weekKey());
  return (count ?? 0) > 0;
}

export async function submitWeekly(userId: string, r: ChallengeResult): Promise<void> {
  await supabase.from('weekly_scores').insert({
    user_id: userId,
    week: weekKey(),
    seed: weeklySeed(),
    overall: r.overall,
    champion: r.champion,
    perfect: r.perfect,
    wins: r.wins,
    losses: r.losses,
    gd: r.gd,
    gf: r.gf,
    stage: r.stage,
  });
}

export async function fetchWeeklyBoard(): Promise<DailyRow[]> {
  const { data, error } = await supabase
    .from('weekly_scores')
    .select('overall,champion,perfect,wins,gd,gf,stage,profiles(name,avatar)')
    .eq('week', weekKey())
    .order('champion', { ascending: false })
    .order('wins', { ascending: false })
    .order('gd', { ascending: false })
    .order('gf', { ascending: false })
    .order('overall', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as unknown as DailyRow[];
}

export async function hasPlayedDaily(userId: string): Promise<boolean> {
  const { count } = await supabase
    .from('daily_scores')
    .select('day', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('day', todayKey());
  return (count ?? 0) > 0;
}

export async function submitDaily(userId: string, r: ChallengeResult): Promise<void> {
  await supabase.from('daily_scores').insert({
    user_id: userId,
    day: todayKey(),
    seed: dailySeed(),
    overall: r.overall,
    champion: r.champion,
    perfect: r.perfect,
    wins: r.wins,
    losses: r.losses,
    gd: r.gd,
    gf: r.gf,
    stage: r.stage,
  });
}

export interface DailyRow {
  overall: number;
  champion: boolean;
  perfect: boolean;
  wins: number;
  gd: number;
  gf: number;
  stage: string;
  profiles: { name: string; avatar: string } | null;
}

export async function fetchDailyBoard(): Promise<DailyRow[]> {
  const { data, error } = await supabase
    .from('daily_scores')
    .select('overall,champion,perfect,wins,gd,gf,stage,profiles(name,avatar)')
    .eq('day', todayKey())
    .order('champion', { ascending: false })
    .order('wins', { ascending: false })
    .order('gd', { ascending: false })
    .order('gf', { ascending: false })
    .order('overall', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as unknown as DailyRow[];
}

// ---------- duels ----------

export interface Duel {
  id: string;
  code: string;
  seed: string;
  mode: Mode;
  creator: string;
  creator_result: ChallengeResult | null;
  opponent: string | null;
  opponent_result: ChallengeResult | null;
  invite?: boolean;
  created_at?: string;
  creator_draft?: DuelTeam | null;
  opponent_draft?: DuelTeam | null;
  creator_steal?: StealPicks | null;
  opponent_steal?: StealPicks | null;
  creator_seen?: string | null;
  opponent_seen?: string | null;
  creator_live?: LiveStatus | null;
  opponent_live?: LiveStatus | null;
  creator_profile?: { name: string; avatar: string } | null;
  opponent_profile?: { name: string; avatar: string } | null;
}

/** what a duel player is doing right now, broadcast with every heartbeat */
export interface LiveStatus {
  phase: 'draft' | 'steal' | 'cup' | 'done';
  filled?: number; // squad slots filled so far (draft phase)
}

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I

function randomCode(): string {
  const buf = new Uint8Array(6);
  crypto.getRandomValues(buf);
  return [...buf].map(b => CODE_CHARS[b % CODE_CHARS.length]).join('');
}

/**
 * Each side rolls their own squads: the shared duel seed is salted per role,
 * so the matchup is settled by drafting skill, not by who got luckier first.
 */
export const duelPlaySeed = (seed: string, role: 'creator' | 'opponent') =>
  `${seed}-${role === 'creator' ? 'A' : 'B'}`;

/** Creates the duel room up-front so the code can be shared before playing. */
export async function createDuel(userId: string, seed: string, mode: Mode, open = false): Promise<{ id: string; code: string }> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = randomCode();
    const { data, error } = await supabase
      .from('duels')
      .insert({ code, seed, mode, creator: userId, open })
      .select('id')
      .single();
    if (!error && data) return { id: data.id as string, code };
    if (error && !error.message.includes('duplicate')) throw error;
  }
  throw new Error('could not generate duel code');
}

/** Creator finished playing: fill in their result. */
export async function fillDuelResult(duelId: string, r: ChallengeResult): Promise<void> {
  const { error } = await supabase
    .from('duels')
    .update({ creator_result: r })
    .eq('id', duelId);
  if (error) throw error;
}

export async function fetchDuel(code: string): Promise<Duel | null> {
  const { data, error } = await supabase
    .from('duels')
    .select(DUEL_COLS)
    .eq('code', code.toUpperCase().trim())
    .maybeSingle();
  if (error) throw error;
  return data as unknown as Duel | null;
}

export async function joinDuel(duelId: string, userId: string, r: ChallengeResult): Promise<void> {
  const { error } = await supabase
    .from('duels')
    .update({
      opponent: userId,
      opponent_result: r,
      finished_at: new Date().toISOString(),
    })
    .eq('id', duelId)
    .or(`opponent.is.null,opponent.eq.${userId}`); // also covers quick-match duels claimed earlier
  if (error) throw error;
}

// ---------- direct invites (challenge a friend, no code typing needed) ----------

/** Creates a duel pre-assigned to a friend; it shows up in their incoming invites. */
export async function createInviteDuel(userId: string, friendId: string, seed: string, mode: Mode): Promise<{ id: string; code: string }> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = randomCode();
    const { data, error } = await supabase
      .from('duels')
      .insert({ code, seed, mode, creator: userId, opponent: friendId, invite: true })
      .select('id')
      .single();
    if (!error && data) return { id: data.id as string, code };
    if (error && !error.message.includes('duplicate')) throw error;
  }
  throw new Error('could not generate duel code');
}

/** Duels friends sent to me that I haven't played yet. */
export async function fetchIncomingInvites(userId: string): Promise<Duel[]> {
  const { data, error } = await supabase
    .from('duels')
    .select(DUEL_COLS)
    .eq('opponent', userId)
    .eq('invite', true)
    .is('opponent_result', null)
    .order('created_at', { ascending: false })
    .limit(10);
  if (error) throw error;
  return (data ?? []) as unknown as Duel[];
}

// ---------- synced duel flow: drafts, steal phase, heartbeats ----------

export type DuelSide = 'creator' | 'opponent';

/** snapshot of a completed draft, published before the steal phase */
export interface DuelTeam {
  formation: string;
  style: Style;
  team: PlacedPlayer[]; // slot-ordered XI
}

/** the steal-phase picks: protect 3 of mine, steal 3 of theirs, offer 3 of mine */
export interface StealPicks {
  ban: string[]; // own player ids the rival cannot take
  steal: string[]; // rival player ids I want
  give: string[]; // own player ids I am willing to lose instead
}

export const STEAL_N = 3;
export const DRAFT_SECONDS = 240;
export const STEAL_SECONDS = 60;

/** claims the opponent seat of a code duel before drafting starts */
export async function claimDuel(duelId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('duels')
    .update({ opponent: userId })
    .eq('id', duelId)
    .is('opponent', null);
  if (error) throw error;
}

export async function submitDuelDraft(duelId: string, side: DuelSide, draft: DuelTeam): Promise<void> {
  const { error } = await supabase
    .from('duels')
    .update({ [`${side}_draft`]: draft })
    .eq('id', duelId);
  if (error) throw error;
}

export async function submitDuelSteal(duelId: string, side: DuelSide, picks: StealPicks): Promise<void> {
  const { error } = await supabase
    .from('duels')
    .update({ [`${side}_steal`]: picks })
    .eq('id', duelId);
  if (error) throw error;
}

export async function duelHeartbeat(duelId: string, side: DuelSide, live?: LiveStatus): Promise<void> {
  await supabase
    .from('duels')
    .update({
      [`${side}_seen`]: new Date().toISOString(),
      ...(live ? { [`${side}_live`]: live } : {}),
    })
    .eq('id', duelId);
}

export const seenRecently = (iso: string | null | undefined, withinMs = 25_000) =>
  !!iso && Date.now() - new Date(iso).getTime() < withinMs;

/** timeout fallback: protect my best 3, steal their best 3, offer my worst 3 */
export function defaultPicks(mine: PlacedPlayer[], theirs: PlacedPlayer[]): StealPicks {
  const byForce = (xs: PlacedPlayer[]) => [...xs].sort((a, b) => b.f - a.f);
  return {
    ban: byForce(mine).slice(0, STEAL_N).map(p => p.id),
    steal: byForce(theirs).slice(0, STEAL_N).map(p => p.id),
    give: byForce(mine).slice(-STEAL_N).map(p => p.id),
  };
}

/**
 * God-mode picks, crafted AFTER the rival's picks are known: my entire squad
 * is secretly protected (resolveSide only caps the steal list, so an
 * oversized ban list works) — every rival steal bounces to my worst players —
 * and I steal their best players that they left unprotected.
 */
export function godPicks(mine: PlacedPlayer[], theirs: PlacedPlayer[], theirPicks: StealPicks): StealPicks {
  const byForce = (xs: PlacedPlayer[]) => [...xs].sort((a, b) => b.f - a.f);
  const banned = new Set(theirPicks.ban);
  const stealable = byForce(theirs).filter(p => !banned.has(p.id));
  // fall back to banned targets if fewer than 3 are open (they then bounce to their give list)
  const steal = [...stealable, ...byForce(theirs)].slice(0, STEAL_N);
  return {
    ban: mine.map(p => p.id),
    steal: steal.map(p => p.id),
    give: byForce(mine).slice(-STEAL_N).map(p => p.id),
  };
}

export interface StealResult {
  wanted: PlacedPlayer; // who was picked
  got: PlacedPlayer | null; // who actually arrives (substitute when blocked)
  blocked: boolean;
}

export interface StealOutcome {
  creatorResults: StealResult[]; // creator's 3 picks, resolved
  opponentResults: StealResult[];
  creatorFinal: PlacedPlayer[]; // slot-ordered final XIs
  opponentFinal: PlacedPlayer[];
}

/** one side's picks against the rival roster: banned picks become give-list substitutes */
function resolveSide(picks: StealPicks, rival: PlacedPlayer[], rivalPicks: StealPicks): StealResult[] {
  const byId = new Map(rival.map(p => [p.id, p]));
  const banned = new Set(rivalPicks.ban);
  const taken = new Set<string>();
  const giveQueue = rivalPicks.give.filter(id => byId.has(id));
  const out: StealResult[] = [];

  for (const id of picks.steal.slice(0, STEAL_N)) {
    const wanted = byId.get(id);
    if (!wanted) continue;
    if (!banned.has(id) && !taken.has(id)) {
      taken.add(id);
      out.push({ wanted, got: wanted, blocked: false });
      continue;
    }
    const subId = giveQueue.find(g => !taken.has(g));
    const sub = subId ? byId.get(subId) ?? null : null;
    if (sub) taken.add(sub.id);
    out.push({ wanted, got: sub, blocked: true });
  }
  return out;
}

/** the formation slot positions for a published draft (slot-ordered) */
export function teamSlots(team: DuelTeam): Pos[] {
  const slots = FORMATIONS[team.formation as FormationName]?.[team.style];
  if (slots && slots.length === team.team.length) return slots.map(s => s.pos);
  return team.team.map(p => p.pos[0]);
}

/** fills the vacated slots with the gained players, best position fit first */
function rebuildSquad(original: PlacedPlayer[], lostIds: Set<string>, gains: PlacedPlayer[], slots: Pos[]): PlacedPlayer[] {
  const final: (PlacedPlayer | null)[] = original.map(p => (lostIds.has(p.id) ? null : p));
  const remaining = [...gains];
  // pass 1: position-compatible slots
  final.forEach((p, i) => {
    if (p !== null) return;
    const fit = remaining.findIndex(g => g.pos.includes(slots[i]));
    if (fit >= 0) final[i] = remaining.splice(fit, 1)[0];
  });
  // pass 2: anything left goes anywhere
  final.forEach((p, i) => {
    if (p === null && remaining.length > 0) final[i] = remaining.shift()!;
  });
  return final.filter((p): p is PlacedPlayer => p !== null);
}

/**
 * Deterministic, simultaneous steal resolution: both sides pick against the
 * original rosters, banned picks fall back to the rival's give list.
 */
export function resolveSteals(creator: DuelTeam, opponent: DuelTeam, creatorPicks: StealPicks, opponentPicks: StealPicks): StealOutcome {
  const creatorResults = resolveSide(creatorPicks, opponent.team, opponentPicks);
  const opponentResults = resolveSide(opponentPicks, creator.team, creatorPicks);

  const creatorLost = new Set(opponentResults.flatMap(r => (r.got ? [r.got.id] : [])));
  const opponentLost = new Set(creatorResults.flatMap(r => (r.got ? [r.got.id] : [])));
  const creatorGains = creatorResults.flatMap(r => (r.got ? [r.got] : []));
  const opponentGains = opponentResults.flatMap(r => (r.got ? [r.got] : []));

  return {
    creatorResults,
    opponentResults,
    creatorFinal: rebuildSquad(creator.team, creatorLost, creatorGains, teamSlots(creator)),
    opponentFinal: rebuildSquad(opponent.team, opponentLost, opponentGains, teamSlots(opponent)),
  };
}

/** rebuilds a playable DraftState from a published draft and its final (post-steal) XI */
export function finalDraftState(team: DuelTeam, finalXI: PlacedPlayer[], mode: Mode): DraftState {
  const slots = FORMATIONS[team.formation as FormationName]?.[team.style]
    ?? team.team.map((p, i) => ({ pos: p.pos[0], x: 50, y: 10 + i * 8 }));
  return {
    formation: team.formation,
    style: team.style,
    mode,
    slots: slots.map(s => ({ ...s })),
    filled: finalXI.slice(0, slots.length),
    usedPlayerIds: finalXI.map(p => p.id),
    rerollsLeft: 0,
  };
}

// ---------- quick match (open matchmaking pool) ----------

/**
 * Finds and atomically claims an open duel from the matchmaking pool.
 * Returns null when nobody is waiting — the caller should then open
 * their own duel with `createDuel(..., open = true)`.
 */
export async function findOpenDuel(userId: string): Promise<Duel | null> {
  const since = new Date(Date.now() - 24 * 3600_000).toISOString();
  const { data, error } = await supabase
    .from('duels')
    .select(DUEL_COLS)
    .eq('open', true)
    .is('opponent', null)
    .neq('creator', userId)
    .gte('created_at', since)
    .order('created_at', { ascending: true })
    .limit(5);
  if (error) throw error;
  for (const row of (data ?? []) as unknown as Duel[]) {
    // conditional update: only one player can win the claim race
    const { data: claimed, error: claimErr } = await supabase
      .from('duels')
      .update({ opponent: userId })
      .eq('id', row.id)
      .is('opponent', null)
      .select('id');
    if (!claimErr && claimed && claimed.length > 0) {
      return { ...row, opponent: userId };
    }
  }
  return null;
}

export const duelLink = (code: string) => `https://cemxbt.github.io/7de7/?duel=${code}`;

const DUEL_COLS = 'id,code,seed,mode,creator,creator_result,opponent,opponent_result,invite,created_at,'
  + 'creator_draft,opponent_draft,creator_steal,opponent_steal,creator_seen,opponent_seen,creator_live,opponent_live,'
  + 'creator_profile:profiles!duels_creator_fkey(name,avatar),opponent_profile:profiles!duels_opponent_fkey(name,avatar)';

/** All duels I created or joined, newest first. */
export async function fetchMyDuels(userId: string): Promise<Duel[]> {
  const { data, error } = await supabase
    .from('duels')
    .select(DUEL_COLS)
    .or(`creator.eq.${userId},opponent.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(15);
  if (error) throw error;
  return (data ?? []) as unknown as Duel[];
}

// ---------- showdown: the duel is settled by a simulated match between the two XIs ----------

/**
 * Deterministic head-to-head between the creator's XI (side A) and the
 * opponent's XI (side B), seeded by the duel id so both players see the
 * exact same match. Returns null while a side is missing or for old duels
 * without squad snapshots (those fall back to stat comparison).
 */
/**
 * Tournament form: how well you played your World Cup carries into the
 * showdown as an attack/defense boost (wins, goals and the title all count).
 */
export function duelForm(r: ChallengeResult): number {
  const raw = r.wins * 0.4 + r.gf * 0.08 + (r.champion ? 1.5 : 0);
  return Math.min(4, Math.round(raw * 10) / 10);
}

export function duelShowdown(duel: Duel): ShowdownMatch | null {
  const cr = duel.creator_result;
  const or = duel.opponent_result;
  if (!cr?.team?.length || !or?.team?.length) return null;
  if (cr.attack == null || cr.defense == null || or.attack == null || or.defense == null) return null;
  const cf = duelForm(cr), of = duelForm(or);
  const sideA = { attack: cr.attack + cf, defense: cr.defense + cf, players: cr.team as Player[] };
  const sideB = { attack: or.attack + of, defense: or.defense + of, players: or.team as Player[] };

  // god mode never loses: deterministically re-salt the seed until the god
  // side wins (escalating its sim strength so a win is inevitable) — both
  // clients run the same loop and land on the exact same match
  const cg = !!cr.god, og = !!or.god;
  if (cg !== og) {
    for (let i = 0; i < 400; i++) {
      const boost = 6 + Math.floor(i / 10) * 4;
      const a = cg ? { ...sideA, attack: sideA.attack + boost, defense: sideA.defense + boost } : sideA;
      const b = og ? { ...sideB, attack: sideB.attack + boost, defense: sideB.defense + boost } : sideB;
      const m = simulateShowdown(a, b, `SHOWDOWN:${duel.id}${i ? `:g${i}` : ''}`);
      if (m.aWins === cg) return m;
    }
  }
  return simulateShowdown(sideA, sideB, `SHOWDOWN:${duel.id}`);
}

/** 1 creator wins, -1 opponent wins, 0 draw (only possible for legacy duels). */
export function duelVerdict(duel: Duel): number | null {
  const sd = duelShowdown(duel);
  if (sd) return sd.aWins ? 1 : -1;
  if (duel.creator_result && duel.opponent_result) {
    return compareResults(duel.creator_result, duel.opponent_result);
  }
  return null;
}
