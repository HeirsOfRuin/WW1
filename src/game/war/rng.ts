// The war layer's random streams: mulberry32, one 32-bit state per named stream, kept in the
// save. A port of prototypes/killgate/rng.js (the game-scaffold generator), draw for draw, so the
// game and the kill-gate prototype play identical wars from identical seeds (tests/war-equivalence).
// Streams keep systems apart: adding a draw to battles does not shift every shell in the line.

export const STREAMS = ['fire', 'duty', 'section', 'battle', 'career', 'leave'] as const;
export type StreamName = (typeof STREAMS)[number];
export type Streams = Record<StreamName, number>;

const UINT32 = 4294967296;

export function hashString(str: string): number {
  let h = 0x811c9dc5; // FNV-1a
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function seedStreams(seed: number): Streams {
  const out = {} as Streams;
  for (const l of STREAMS) out[l] = (hashString(`${seed}|${l}`) >>> 0) || 1;
  return out;
}

/** One draw in [0, 1) from a stream, advancing it in place. */
export function raw(st: Streams, l: StreamName): number {
  const s = (st[l] + 0x6d2b79f5) >>> 0;
  st[l] = s;
  let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / UINT32;
}

export const chance = (st: Streams, l: StreamName, p: number) => raw(st, l) < p;
export const float = (st: Streams, l: StreamName, lo: number, hi: number) => lo + raw(st, l) * (hi - lo);
export function pick<T>(st: Streams, l: StreamName, arr: readonly T[]): T {
  return arr[Math.floor(raw(st, l) * arr.length)]!;
}
