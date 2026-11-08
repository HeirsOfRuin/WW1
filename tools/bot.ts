// CLI: npm run bot -- [--runs 200]. Plays every start with every policy and fails on anything but
// an ending: a dead end (no available choice), a softlock (no new scene, chapter or season for
// 60 steps), an engine error. Prints how the runs ended, by start.
import { playOnce, POLICIES, policyName, type Run } from '@tools/play';
import { loadContent } from './content-loader';
import { newGame, startsOf } from '../src/game/index';

export function runBot(runs: number): Run[] {
  const content = loadContent();
  const out: Run[] = [];
  for (const start of startsOf(content)) for (let i = 0; i < runs; i++) {
    const policy = POLICIES[i % POLICIES.length]!;
    out.push(playOnce(content, start, (seed) => newGame(content, { start, seed, name: 'Bot' }), 1 + i * 7919, policy));
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = process.argv.slice(2);
  const runs = Number(a[a.indexOf('--runs') + 1]) || 50;
  const res = runBot(runs);
  const bad = res.filter((r) => r.outcome !== 'ending');
  const tally: Record<string, Record<string, number>> = {};
  for (const r of res) { const k = r.outcome === 'ending' ? r.ending! : r.outcome; (tally[r.start] ??= {})[k] = (tally[r.start]![k] ?? 0) + 1; }
  for (const [s, t] of Object.entries(tally)) console.log(`${s.padEnd(12)} ${Object.entries(t).map(([k, n]) => `${k} ${n}`).join(' · ')}`);
  for (const r of bad.slice(0, 10)) console.log(`!! ${r.start} seed ${r.seed} ${r.policy}: ${r.outcome} ${r.detail ?? ''}`);
  console.log(`\nbot: ${res.length} runs, ${bad.length} failed (${POLICIES.map(policyName).join(', ')})`);
  process.exit(bad.length ? 1 : 0);
}
