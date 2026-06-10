import type { Squad } from '../game/types';

let cache: Squad[] | null = null;

export async function loadSquads(): Promise<Squad[]> {
  if (cache) return cache;
  const res = await fetch(`${import.meta.env.BASE_URL}data/squads.json`);
  if (!res.ok) throw new Error(`failed to load squads: HTTP ${res.status}`);
  cache = (await res.json()) as Squad[];
  return cache;
}
