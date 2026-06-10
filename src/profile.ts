// Local profile & tournament history (device-only, localStorage).
import type { CampaignResult } from './game/sim';
import type { Mode } from './game/types';

export interface Profile {
  name: string;
  avatar: string;
}

export interface HistoryEntry {
  ts: number;
  mode: Mode;
  formation: string;
  seed: string;
  record: string;
  champion: boolean;
  perfect: boolean;
  overall: number;
  gf: number;
  ga: number;
  stage: string; // stage reached: 'CHAMP' or last stage key
}

export const AVATARS = ['⚽', '🏆', '🦁', '🦅', '🐺', '🐂', '🔥', '⭐', '🎯', '🧤', '👑', '🌪️', '🐉', '🍀', '🚀', '🎩'];

const PROFILE_KEY = '7de7-profile';
const HISTORY_KEY = '7de7-history';
const HISTORY_MAX = 60;

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { name: '', avatar: '⚽' };
}

export function saveProfile(p: Profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

export function pushHistory(res: CampaignResult, mode: Mode, formation: string): HistoryEntry[] {
  const last = res.campaign[res.campaign.length - 1];
  const entry: HistoryEntry = {
    ts: Date.now(),
    mode, formation,
    seed: res.seed,
    record: res.record,
    champion: res.champion,
    perfect: res.perfect,
    overall: res.overall,
    gf: res.gf,
    ga: res.ga,
    stage: res.champion ? 'CHAMP' : last?.stage ?? 'G1',
  };
  const list = [entry, ...loadHistory()].slice(0, HISTORY_MAX);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  return list;
}

export function clearHistory(): HistoryEntry[] {
  localStorage.removeItem(HISTORY_KEY);
  return [];
}
