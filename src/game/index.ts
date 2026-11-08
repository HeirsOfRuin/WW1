// In the Trenches's facade: a new game from a start, and the engine's view and choose for its state.
// Importing this registers the game module.
import './module';
import type { ContentBundle } from '../content/schema';
import { HERO_ID, type GameState } from './state';
import { RngCursor, seedRng } from '@engine/rng';
import { newNpcState } from '@engine/effects';
import { enterScene } from '@engine/director';
import { bornAtAge } from '@engine/character';
import { EngineError } from '@engine/index';
import type { Character, Sex } from '@engine/state';

export { EngineError, view, choose, visibleChoices, isAvailable } from '@engine/index';
export type { ChoiceView, SceneView, ChooseResult } from '@engine/index';
export { describeDate } from '@engine/calendar';
export { heroOf } from '@engine/character';
export type { GameState } from './state';

export interface NewGameOptions { start: string; seed: number; name: string; sex?: Sex }

export function newGame(content: ContentBundle, opts: NewGameOptions): GameState {
  const st = content.starts[opts.start];
  if (!st) throw new EngineError(`unknown start ${opts.start}`);
  const scene = content.scenes[st.start_scene];
  if (!scene) throw new EngineError(`start ${st.id}: unknown scene ${st.start_scene}`);
  const rng = new RngCursor(seedRng(opts.seed));
  const hero: Character = {
    name: opts.name.trim() || 'Wat',
    sex: opts.sex ?? 'male',
    born: bornAtAge(st.hero.age),
    alive: true,
    attributes: Object.fromEntries(content.config.attributes.map((a) => [a, st.hero.attributes[a] ?? 2])),
    skills: Object.fromEntries(content.config.skills.map((k) => [k, st.hero.skills[k] ?? 0])),
    health: 8,
    traits: [],
    injuries: [],
    items: [],
    station: st.hero.station,
  };
  const state: GameState = {
    version: 1,
    contentHash: content.hash,
    seed: opts.seed,
    rng: rng.state,
    characters: { [HERO_ID]: hero },
    hero: HERO_ID,
    start: st.id,
    ferry: { takings: 0, repair: 0 },
    chapter: scene.chapter,
    scene: scene.id,
    returnStack: [],
    time: 0,
    rep: Object.fromEntries(Object.keys(content.registry.factions).map((id) => [id, 0])),
    res: { coin: st.hero.coin },
    favors: {},
    flags: {},
    counters: {},
    npcs: Object.fromEntries(Object.keys(content.registry.npcs).map((id) => [id, newNpcState(content, id)])),
    aliases: {},
    queue: [],
    seen: {},
    journal: [],
  };
  enterScene(state, content, scene, [], rng);
  state.rng = rng.state;
  return state;
}

/** Every start a game can begin from. */
export const startsOf = (content: ContentBundle) => Object.keys(content.starts);
