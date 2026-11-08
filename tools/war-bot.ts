// The kill gate's policies played through the real game: the story engine's view and choose, one
// scene and one choice at a time, exactly as a player would. tests/war-equivalence.test.ts holds
// these wars equal to the prototype's on the same seeds; sim/adapter.ts measures them.
import { view, choose, newGame, type GameState } from '../src/game/index';
import { POLICIES, withForce, decideFor, battleOf, TOWNS, type Force, type Town } from '../src/game/war/index';
import type { ContentBundle } from '../src/content/schema';

export interface BotOptions { seed: number; town: Town; policy: string; general?: string; pick?: number; force?: Force; off?: string[] }

const startFor = (content: ContentBundle, town: Town) => Object.values(content.starts).find((s) => s.town === town)!.id;

/** One whole war through the engine. Throws on a dead end, an unknown choice or a stall. */
export function playGame(content: ContentBundle, o: BotOptions): GameState {
  const base = POLICIES[o.policy];
  if (!base) throw new Error(`unknown policy ${o.policy}`);
  const pol = withForce(base, o.force);
  let s = newGame(content, { start: startFor(content, o.town), seed: o.seed, name: 'Bot' });
  if (o.off) s.war.off = [...o.off];
  for (let step = 0; step < 5000; step++) {
    const v = view(content, s);
    if (v.ended) return s;
    let id: string;
    if (v.sceneId.startsWith('c_enlist_')) id = `pick_${o.pick ?? 0}`;
    else if (v.sceneId === 'c_general') id = o.general ?? 'firstaid';
    else if (v.sceneId === 'c_training') id = 'embark';
    else if (v.sceneId.startsWith('v_') || v.sceneId.startsWith('x_')) id = v.choices.find((x) => x.available)!.id; // an event or news: no war question
    else {
      const q = s.war.pending;
      if (!q) throw new Error(`${v.sceneId}: no question pending`);
      id = decideFor(pol, s.war, q, battleOf).replace(':', '_');
    }
    const c = v.choices.find((x) => x.id === id);
    if (!c || !c.available) throw new Error(`${v.sceneId}: choice ${id} is not open (${v.choices.map((x) => x.id).join(', ')})`);
    s = choose(content, s, id).state;
  }
  throw new Error(`seed ${o.seed}: no ending after 5000 choices`);
}

export { TOWNS };
