// Connects the kill-gate model to the game-measure kit (run.js, ablate.js).
//   node prototypes/killgate/run.js --adapter=prototypes/killgate/adapter.js --runs=300 --by=policy --pool=town

import { play as playWar, grade, aliveFriends } from './model.js';
import { POLICIES } from './policies.js';
import { TOWNS, GENERAL } from './data.js';

export const axes = { policy: Object.keys(POLICIES), town: Object.keys(TOWNS), general: GENERAL };
export const defaults = { policy: 'adaptive', town: 'pit', general: 'firstaid' };

export const play = (seed, opts) => playWar(seed, opts);

export function progress(s) {
  const missing = [];
  if (!s.ending) missing.push('never ended');
  if (s.clock < 1) missing.push('never reached a rotation');
  if (s.ending === 'armistice' && s.stagesDone !== 4) missing.push('armistice without four stages');
  return missing;
}

const LOSSES = ['killed', 'broken', 'courtMartial', 'invalided', 'captured'];

export function metrics(s) {
  return {
    armistice: s.ending === 'armistice',
    survivedS1: !(s.endedStage === 1 && LOSSES.includes(s.ending)),
    killed: s.ending === 'killed',
    broken: s.ending === 'broken',
    courtMartial: s.ending === 'courtMartial',
    invalided: s.ending === 'invalided',
    captured: s.ending === 'captured',
    posting: s.ending === 'posting',
    homeAlive: !['killed', 'courtMartial'].includes(s.ending), // came home or will
    offerAtLeave1: (s.stats.offersAtLeave[1] || 0) > 0,
    commissioned: s.commissioned,
    grade: Math.round(grade(s) * 10) / 10,
    stagesDone: s.stagesDone,
    rank: s.rank,
    awards: s.awards.length,
    medal: s.awards.some((a) => a !== 'MiD'),
    friendsAlive: aliveFriends(s),
    endStage: s.endedStage,
  };
}

export function digest(s) {
  return JSON.stringify([s.ending, s.endedStage, s.clock, s.rank, s.nerve.toFixed(4), s.standing.toFixed(4),
    Object.values(s.war).map((v) => v.toFixed(4)), s.awards, s.friends, s.posting]);
}

export function trace(s) {
  return [`${s.town} / ${s.policy} / seed ${s.seed}`, ...s.log,
    `grade ${grade(s).toFixed(1)}, rank ${s.rank}, awards [${s.awards}], friends alive ${aliveFriends(s)}`].join('\n');
}
