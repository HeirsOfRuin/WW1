// In the Trenches's state: the engine's CoreState plus the war. Plain JSON; the engine clones it.
import type { CoreState } from '@engine/state';
import type { War } from './war/war';

export interface GameState extends CoreState {
  /** the start this game began from: the home town (content/starts/) */
  start: string;
  /** the soldier's war: the step machine in src/game/war/war.ts */
  war: War;
  /** character creation: the two town skills and the general one */
  home: { picks: string[]; general: string };
}

export const HERO_ID = 'hero';
