// Online competition: daily challenge + 1v1 duels on a shared seed.
import type { CampaignResult } from './game/sim';
import type { Mode } from './game/types';
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
}

export function toChallengeResult(res: CampaignResult, mode: Mode, formation: string): ChallengeResult {
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
    formation,
    mode,
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
  creator_result: ChallengeResult;
  opponent: string | null;
  opponent_result: ChallengeResult | null;
  creator_profile?: { name: string; avatar: string } | null;
  opponent_profile?: { name: string; avatar: string } | null;
}

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I

function randomCode(): string {
  const buf = new Uint8Array(6);
  crypto.getRandomValues(buf);
  return [...buf].map(b => CODE_CHARS[b % CODE_CHARS.length]).join('');
}

export async function createDuel(userId: string, seed: string, mode: Mode, r: ChallengeResult): Promise<string> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = randomCode();
    const { error } = await supabase.from('duels').insert({
      code, seed, mode,
      creator: userId,
      creator_result: r,
    });
    if (!error) return code;
    if (!error.message.includes('duplicate')) throw error;
  }
  throw new Error('could not generate duel code');
}

export async function fetchDuel(code: string): Promise<Duel | null> {
  const { data, error } = await supabase
    .from('duels')
    .select('id,code,seed,mode,creator,creator_result,opponent,opponent_result,creator_profile:profiles!duels_creator_fkey(name,avatar),opponent_profile:profiles!duels_opponent_fkey(name,avatar)')
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
    .is('opponent', null);
  if (error) throw error;
}

export const duelLink = (code: string) => `https://cemxbt.github.io/7de7/?duel=${code}`;
