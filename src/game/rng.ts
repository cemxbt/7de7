// Deterministic seeded RNG: string hash + mulberry32 (ported from the original game)

function hash(str: string): number {
  let h = 0x6a09e667 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 0xcc9e2d51);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

export type Rng = () => number;

export function rngFromSeed(seed: string): Rng {
  let s = hash(seed);
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let a = Math.imul(s ^ (s >>> 15), 1 | s);
    a = (a + Math.imul(a ^ (a >>> 7), 61 | a)) ^ a;
    return ((a ^ (a >>> 14)) >>> 0) / 0x100000000;
  };
}

export function pick<T>(rng: Rng, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function pickWeighted<T>(rng: Rng, arr: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let n = rng() * total;
  for (let i = 0; i < arr.length; i++) {
    n -= weights[i];
    if (n <= 0) return arr[i];
  }
  return arr[arr.length - 1];
}

export function poisson(rng: Rng, lambda: number): number {
  if (lambda <= 0) return 0;
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rng();
  } while (p > L);
  return k - 1;
}

const SEED_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function randomSeed(): string {
  let s = '';
  for (let i = 0; i < 6; i++) s += SEED_CHARS[Math.floor(Math.random() * SEED_CHARS.length)];
  return s;
}
