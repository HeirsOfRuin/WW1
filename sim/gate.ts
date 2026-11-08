// @ts-nocheck: a straight port of prototypes/killgate/gate.js; types add nothing here
// The gate tables from the real game (the kill gate's tables, KILLGATE.md, now played through the
// story engine): policy x town matrix, endings, the push-your-luck comparison and the town check.
//   npm run gate            (npx tsx sim/gate.ts [runsPerTown=500])

import { loadContent } from '../tools/content-loader';
import { playGame } from '../tools/war-bot';
import { grade, aliveFriends, POLICIES, TOWNS, type Town } from '../src/game/war/index';
import { seRate } from './stats.js';

const content = loadContent();
const play = (seed: number, o: { policy: string; town: string }) => playGame(content, { seed, town: o.town as Town, policy: o.policy }).war;
const progress = (s: { cursor: { at: string } }) => (s.cursor.at === 'done' ? [] : ['the war never ended']);

const runs = Number(process.argv[2] || 500);
const policies = Object.keys(POLICIES), towns = Object.keys(TOWNS);
const seedOf = (i, town) => 1 + i * 7919 + town.charCodeAt(0) * 131 + town.charCodeAt(1);

function cell(policy, town) {
  const rows = [];
  for (let i = 0; i < runs; i++) {
    const s = play(seedOf(i, town), { policy, town });
    const miss = progress(s);
    if (miss.length) throw new Error(`${policy}/${town} seed ${seedOf(i, town)}: ${miss.join('; ')}`);
    rows.push({ s, g: grade(s) });
  }
  return rows;
}

const pct = (k, n) => `${(100 * k / n).toFixed(1)}±${seRate(k / n, n).toFixed(1)}`;
const mean = (a) => a.reduce((x, y) => x + y, 0) / (a.length || 1);
const sem = (a) => { const m = mean(a); return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / Math.max(1, a.length - 1) / a.length); };
const LOSS = ['killed', 'broken', 'courtMartial', 'invalided', 'captured'];

const all = {};
for (const p of policies) { all[p] = {}; for (const t of towns) all[p][t] = cell(p, t); }

console.log(`\n${runs} runs per policy per town; ${runs * towns.length} per policy row. Rates in %, ±1 SE.\n`);
console.log('policy    | armistice | survive S1 | home alive | killed | k.battle | broken | c-martial | invalided | captured | posting | grade mean±SE | medal | rank | friends');
for (const p of policies) {
  const r = towns.flatMap((t) => all[p][t]); const n = r.length;
  const c = (f) => r.filter(f).length;
  console.log([
    p.padEnd(9), pct(c((x) => x.s.ending === 'armistice'), n).padStart(9),
    pct(c((x) => !(x.s.endedStage === 1 && LOSS.includes(x.s.ending))), n).padStart(10),
    pct(c((x) => !['killed', 'courtMartial'].includes(x.s.ending)), n).padStart(10),
    pct(c((x) => x.s.ending === 'killed'), n).padStart(6),
    pct(c((x) => x.s.ending === 'killed' && x.s.inBattle), n).padStart(8),
    pct(c((x) => x.s.ending === 'broken'), n).padStart(6),
    pct(c((x) => x.s.ending === 'courtMartial'), n).padStart(9),
    pct(c((x) => x.s.ending === 'invalided'), n).padStart(9),
    pct(c((x) => x.s.ending === 'captured'), n).padStart(8),
    pct(c((x) => x.s.ending === 'posting'), n).padStart(7),
    `${mean(r.map((x) => x.g)).toFixed(1)}±${sem(r.map((x) => x.g)).toFixed(1)}`.padStart(13),
    pct(c((x) => x.s.awards.some((a) => a !== 'MiD')), n).padStart(5),
    mean(r.map((x) => x.s.rank)).toFixed(2).padStart(4),
    mean(r.map((x) => aliveFriends(x.s))).toFixed(2).padStart(7),
  ].join(' | '));
}

console.log('\nBy town (adaptive): armistice | home alive | grade mean | offer at leave 1 | commissioned');
for (const t of towns) {
  const r = all.adaptive[t]; const n = r.length;
  console.log(`${t.padEnd(5)} | ${pct(r.filter((x) => x.s.ending === 'armistice').length, n)} | ${pct(r.filter((x) => !['killed', 'courtMartial'].includes(x.s.ending)).length, n)} | ${mean(r.map((x) => x.g)).toFixed(1)}±${sem(r.map((x) => x.g)).toFixed(1)} | ${pct(r.filter((x) => (x.s.stats.offersAtLeave[1] || 0) > 0).length, n)} | ${pct(r.filter((x) => x.s.commissioned).length, n)}`);
}

console.log('\nBy town, every policy pooled: armistice | home alive | grade mean');
for (const t of towns) {
  const r = policies.flatMap((p) => all[p][t]); const n = r.length;
  console.log(`${t.padEnd(5)} | ${pct(r.filter((x) => x.s.ending === 'armistice').length, n)} | ${pct(r.filter((x) => !['killed', 'courtMartial'].includes(x.s.ending)).length, n)} | ${mean(r.map((x) => x.g)).toFixed(1)}±${sem(r.map((x) => x.g)).toFixed(1)}`);
}

// Push your luck: of the runs that reached leave N with an offer in hand, what did
// taking it give (quitN) against going back (adaptive)? Same seeds, so the runs are the same men up to that leave.
console.log('\nPush your luck at each leave (runs with an offer in hand; same seeds): take it vs go back');
for (const N of [1, 2, 3]) {
  const take = [], back = [];
  for (const t of towns) for (let i = 0; i < runs; i++) {
    const q = all[`quit${N}`][t][i], a = all.adaptive[t][i];
    if (q.s.ending === 'posting' && q.s.endedStage === N) { take.push(q.g); back.push(a.g); }
  }
  const aBack = [];
  for (const t of towns) for (let i = 0; i < runs; i++) {
    const q = all[`quit${N}`][t][i], a = all.adaptive[t][i];
    if (q.s.ending === 'posting' && q.s.endedStage === N) aBack.push(a.s);
  }
  const later = aBack.filter((s) => ['killed', 'courtMartial', 'broken'].includes(s.ending)).length;
  console.log(`leave ${N}: n=${take.length}  take ${mean(take).toFixed(1)}±${sem(take).toFixed(1)}  go back ${mean(back).toFixed(1)}±${sem(back).toFixed(1)}  (going back: killed, broken or court-martialled later in ${pct(later, aBack.length)}%, armistice ${pct(aBack.filter((s) => s.ending === 'armistice').length, aBack.length)}%)`);
}
