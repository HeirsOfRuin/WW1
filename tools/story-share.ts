// The share of screens that are story, not generic missions (the author, 2026-11-09: "follow a
// story more so than just playing generic missions. Have a general play through (only volunteering
// half the time) to split between story and generic missions 50/50").
// Plays whole mill-town games with the 'half' policy and counts every screen by kind.
//   npx tsx tools/story-share.ts [runs=200] [start=mill]
import { loadContent } from './content-loader';
import { view, choose, newGame } from '../src/game/index';
import { POLICIES, decideFor, battleOf } from '../src/game/war/index';

/** Generic: the war's own questions and missions. Everything else is story. */
export function kindOf(id: string): 'story' | 'generic' {
  if (id === 'w_tour' || id === 'w_tunnel_pit') return 'story'; // the tour's passage of the year; the pit's written offer
  if (/^(w_|s_)/.test(id) || /^x_(raid|patrol|wiring|listening|carrying|bomb|lewis|snipe|signals|tunnel)_done$/.test(id) || id === 'x_sortie') return 'generic';
  return 'story';
}

export function share(runs: number, start = 'mill') {
  const content = loadContent();
  let story = 0, generic = 0;
  const byScene: Record<string, number> = {};
  const byYear: Record<number, { story: number; generic: number }> = {};
  for (let i = 0; i < runs; i++) {
    let s = newGame(content, { start, seed: 1000 + i * 7919, name: 'Tom' });
    for (let k = 0; k < 5000 && !s.ended; k++) {
      const v = view(content, s);
      const kind = kindOf(v.sceneId);
      if (kind === 'story') story++; else generic++;
      const y = s.war.stage; (byYear[y] ??= { story: 0, generic: 0 })[kind]++;
      const key = v.sceneId.replace(/_\d$/, '_*');
      byScene[key] = (byScene[key] ?? 0) + 1;
      let id: string;
      if (v.sceneId.startsWith('c_enlist')) id = 'pick_0'; else if (v.sceneId === 'c_general') id = 'firstaid'; else if (v.sceneId === 'c_training') id = 'embark';
      else if (content.scenes[v.sceneId]?.kind === 'pool' || v.sceneId.startsWith('x_') || v.sceneId.startsWith('y_')) id = v.choices.filter((c) => c.available)[(k % 2) % v.choices.filter((c) => c.available).length]!.id;
      else id = decideFor(POLICIES.half!, s.war, s.war.pending!, battleOf).replace(':', '_');
      s = choose(content, s, id).state;
    }
  }
  return { story, generic, byScene, byYear };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const runs = Number(process.argv[2] || 200);
  const r = share(runs, process.argv[3] || 'mill');
  const pct = (a: number, b: number) => `${((100 * a) / (a + b)).toFixed(1)}%`;
  console.log(`story ${pct(r.story, r.generic)} of ${r.story + r.generic} screens over ${runs} games (${((r.story + r.generic) / runs).toFixed(0)} a game)`);
  for (const [y, c] of Object.entries(r.byYear)) console.log(`  year ${Number(y) + 1914}: story ${pct(c.story, c.generic)} (${((c.story + c.generic) / runs).toFixed(0)} screens a game)`);
  console.log('most-seen screens a game:');
  for (const [k, n] of Object.entries(r.byScene).sort((a, b) => b[1] - a[1]).slice(0, 14)) console.log(`  ${(n / runs).toFixed(1).padStart(6)}  ${kindOf(k.replace('_*', '_1'))}  ${k}`);
}
