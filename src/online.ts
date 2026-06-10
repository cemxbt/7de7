// Supabase online layer: auth, cloud profile/history sync, leaderboard.
import { createClient, type User } from '@supabase/supabase-js';
import type { HistoryEntry, Profile } from './profile';

const SUPABASE_URL = 'https://ubpdthutaupqakbkkntt.supabase.co';
const SUPABASE_KEY = 'sb_publishable__iwJ7SHx9kJ_VmxC8oLtzQ_HmG-aakh';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
export type { User };

const SYNC_FLAG = '7de7-history-synced';

const SITE_URL = 'https://cemxbt.github.io/7de7/';

export async function signUp(email: string, password: string): Promise<{ needsConfirm: boolean }> {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { emailRedirectTo: SITE_URL },
  });
  if (error) throw error;
  return { needsConfirm: !data.session };
}

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
  localStorage.removeItem(SYNC_FLAG);
}

export async function upsertCloudProfile(userId: string, profile: Profile): Promise<void> {
  await supabase.from('profiles').upsert({
    id: userId,
    name: profile.name,
    avatar: profile.avatar,
    updated_at: new Date().toISOString(),
  });
}

const toRow = (userId: string, h: HistoryEntry) => ({
  user_id: userId,
  played_at: new Date(h.ts).toISOString(),
  mode: h.mode,
  formation: h.formation,
  seed: h.seed,
  record: h.record,
  champion: h.champion,
  perfect: h.perfect,
  overall: h.overall,
  gf: h.gf,
  ga: h.ga,
  stage: h.stage,
});

export async function insertCampaign(userId: string, h: HistoryEntry): Promise<void> {
  await supabase.from('campaigns').insert(toRow(userId, h));
}

/** one-time upload of pre-login local history (also seeds cloud aggregate stats via trigger) */
export async function syncLocalHistoryOnce(userId: string, history: HistoryEntry[]): Promise<void> {
  if (localStorage.getItem(SYNC_FLAG)) return;
  const { count } = await supabase
    .from('campaigns')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  if ((count ?? 0) === 0 && history.length > 0) {
    await supabase.from('campaigns').insert(history.map(h => toRow(userId, h)));
  }
  localStorage.setItem(SYNC_FLAG, '1');
}

export interface LeaderboardRow {
  name: string;
  avatar: string;
  played: number;
  titles: number;
  perfect: number;
  best: number;
}

export async function fetchLeaderboard(): Promise<LeaderboardRow[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('name,avatar,played,titles,perfect,best')
    .gt('played', 0)
    .order('titles', { ascending: false })
    .order('perfect', { ascending: false })
    .order('best', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}
