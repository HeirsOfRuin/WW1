// The game-measure adapter for In the Trenches: whole wars played through the real engine by the
// kill gate's policies (tools/war-bot.ts). The metrics are the kill gate's, so the tables compare.
//   npx tsx sim/run.js --adapter=sim/adapter.ts --runs=500 --by=policy --pool=town
import { loadContent } from '../tools/content-loader';
import { playGame } from '../tools/war-bot';
import { grade, aliveFriends, POLICIES, TOWNS, GENERAL, type Town } from '../src/game/war/index';
import type { GameState } from '../src/game/index';

const content = loadContent();
export const axes = { policy: Object.keys(POLICIES), town: Object.keys(TOWNS), general: GENERAL };
export const defaults = { policy: 'adaptive', town: 'pit', general: 'firstaid' };

/** The kill gate's seeds (prototypes/killgate/gate.js seedOf), so these tables match KILLGATE.md run for run. */
export function seedFor(i: number, opts: Record<string, unknown>): number {
  const town = String(opts.town);
  return 1 + i * 7919 + town.charCodeAt(0) * 131 + town.charCodeAt(1);
}

export function play(seed: number, opts: Record<string, unknown>): GameState {
  const { policy, town, general, off, ...force } = opts as { policy: string; town: Town; general: string; off?: string[] };
  return playGame(content, { seed, town, policy, general, off, force });
}

export function progress(s: GameState): string[] {
  const w = s.war; const missing: string[] = [];
  if (!s.ended) missing.push('the engine never reached an ending');
  if (w.cursor.at !== 'done') missing.push('the war never ended');
  if (w.clock < 1) missing.push('never reached a rotation');
  if (w.ending === 'armistice' && w.stagesDone !== 4) missing.push('armistice without four stages');
  return missing;
}

const LOSSES = ['killed', 'broken', 'courtMartial', 'invalided', 'captured'];

export function metrics(s: GameState) {
  const w = s.war;
  return {
    armistice: w.ending === 'armistice',
    survivedS1: !(w.endedStage === 1 && LOSSES.includes(w.ending!)),
    killed: w.ending === 'killed', broken: w.ending === 'broken', courtMartial: w.ending === 'courtMartial',
    invalided: w.ending === 'invalided', captured: w.ending === 'captured', posting: w.ending === 'posting',
    homeAlive: !['killed', 'courtMartial'].includes(w.ending!),
    offerAtLeave1: (w.stats.offersAtLeave[1] || 0) > 0,
    commissioned: w.commissioned,
    grade: Math.round(grade(w) * 10) / 10,
    stagesDone: w.stagesDone, rank: w.rank, awards: w.awards.length,
    medal: w.awards.some((a) => a !== 'MiD'),
    friendsAlive: aliveFriends(w), endStage: w.endedStage,
    roleMissions: w.stats.missions,
    sortieOk: w.stats.sorties ? Math.round((100 * (w.stats.sortiesOk ?? 0)) / w.stats.sorties) : NaN,
    age: Math.floor((s.time - s.characters[s.hero]!.born) / 4),
  };
}

export function digest(s: GameState): string {
  const w = s.war;
  return JSON.stringify([w.ending, w.endedStage, w.clock, w.rank, w.nerve.toFixed(4), w.standing.toFixed(4),
    Object.values(w.war).map((v) => v.toFixed(4)), w.awards, w.friends, w.posting]);
}

export function trace(s: GameState): string {
  return [`${s.war.town} / seed ${s.war.seed}`, ...s.war.log, `ending ${s.ended?.ending}, grade ${grade(s.war).toFixed(1)}`].join('\n');
}
