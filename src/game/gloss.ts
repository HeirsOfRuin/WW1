// The soldier's words in the text (content/glossary/). glossOf() cuts a paragraph into plain text
// and glossary words, so the screen can make each word tappable; the screen computes nothing.
// Longest terms first, whole words only, any case; the first time a term appears on a screen.
import type { Gloss } from '../content/schema';

export type Piece = string | { word: string; means: string };
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const cache = new WeakMap<Gloss[], { re: RegExp; by: Map<string, Gloss> }>();
function index(glossary: Gloss[]) {
  let c = cache.get(glossary);
  if (!c) {
    const by = new Map<string, Gloss>();
    for (const g of glossary) if (!g.quiet) for (const t of [g.term, ...(g.also ?? [])]) by.set(t.toLowerCase(), g);
    // a space in a term matches any run of white space: the text wraps lines inside phrases
    const alts = [...by.keys()].sort((a, b) => b.length - a.length).map((t) => esc(t).replace(/ +/g, '\\s+')).join('|');
    c = { re: new RegExp(`(?<![\\p{L}\\p{N}])(${alts || '\\b\\B'})(?![\\p{L}\\p{N}])`, 'giu'), by };
    cache.set(glossary, c);
  }
  return c;
}
/** A paragraph as pieces. `seen` carries the terms already marked on this screen. */
export function glossOf(text: string, glossary: Gloss[], seen = new Set<string>()): Piece[] {
  const { re, by } = index(glossary);
  const out: Piece[] = []; let at = 0;
  for (const m of text.matchAll(re)) {
    const g = by.get(m[0].toLowerCase().replace(/\s+/g, ' '))!;
    // once a screen, by the word and by its meaning (two entries for forms of one word share a meaning's start)
    const key = g.means.slice(0, 24);
    if (seen.has(g.term) || seen.has(key)) continue;
    seen.add(g.term); seen.add(key);
    if (m.index > at) out.push(text.slice(at, m.index));
    out.push({ word: m[0], means: g.means }); at = m.index + m[0].length;
  }
  if (at < text.length) out.push(text.slice(at));
  return out;
}
