// npm run gloss: how much of the text uses the soldier's words, and that every word listed is used.
//   --strict: fail on a glossary term that appears nowhere (rule 2: nothing declared is decoration).
import { loadContent } from './content-loader';
import { glossOf } from '../src/game/gloss';
const content = loadContent();
// quiet words are listed in the Journal, not underlined: counted apart, and still checked for use
const quiet = content.glossary.filter((g) => g.quiet).length;
const loud = content.glossary.filter((g) => !g.quiet);
const all = content.glossary.map((g) => ({ term: g.term, means: g.means, ...(g.also ? { also: g.also } : {}) }));
const used = new Map<string, number>(); let screens = 0, withWord = 0, words = 0, marked = 0;
const count = (t: string | undefined) => {
  if (!t) return 0; let n = 0;
  for (const para of t.split(/\n\s*\n/)) { for (const x of glossOf(para, loud, new Set())) if (typeof x !== 'string') n++; for (const x of glossOf(para, all, new Set())) if (typeof x !== 'string') { const g = all.find((e) => e.means === x.means)!; used.set(g.term, (used.get(g.term) ?? 0) + 1); } }
  words += t.split(/\s+/).length; return n;
};
for (const sc of Object.values(content.scenes)) {
  const n = count(sc.text) + (sc.choices ?? []).reduce((a, c) => a + count(c.text) + count((c as { text_after?: string }).text_after), 0);
  screens++; if (n) withWord++; marked += n;
}
const unused = content.glossary.filter((g) => !used.has(g.term)).map((g) => g.term);
console.log(`gloss: ${content.glossary.length} words (${quiet} quiet: listed, not underlined), ${marked} underlined places in ${words} words of text; ${withWord} of ${screens} scenes (${Math.round((100 * withWord) / screens)}%) carry at least one`);
console.log('most used:', [...used.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([t, n]) => `${t} ${n}`).join(', '));
if (unused.length) { console.log(`unused (${unused.length}): ${unused.join(', ')}`); if (process.argv.includes('--strict')) process.exit(1); }
