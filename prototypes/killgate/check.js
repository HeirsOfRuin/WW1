// Invariants and determinism over every policy x town x general pick. Exits 1 on any failure.
//   node prototypes/killgate/check.js [seedsPerCell=40]
import { play, grade } from './model.js';
import { POLICIES } from './policies.js';
import { TOWNS, GENERAL, STAGES, GRADE, AWARDS, SECTION_SIZE, SUBALTERN } from './data.js';
import { digest, progress } from './adapter.js';

const n = Number(process.argv[2] || 40);
const fails = [];
let runs = 0;
for (const policy of Object.keys(POLICIES)) for (const town of Object.keys(TOWNS)) for (const general of GENERAL) {
  for (let i = 0; i < n; i++) {
    const seed = 101 + i * 31, opts = { policy, town, general };
    const s = play(seed, opts), t = play(seed, opts);
    const id = `${policy}/${town}/${general}/seed ${seed}`;
    const bad = (m) => fails.push(`${id}: ${m}`);
    runs++;
    if (digest(s) !== digest(t)) bad('not deterministic');
    for (const m of progress(s)) bad(m);
    if (!(s.ending in GRADE.mult)) bad(`unknown ending ${s.ending}`);
    if (s.nerve < -10 || s.nerve > 100) bad(`nerve ${s.nerve}`);
    if (s.standing < 0 || s.standing > 100) bad(`standing ${s.standing}`);
    if (s.rank < 0 || s.rank > SUBALTERN) bad(`rank ${s.rank}`);
    if (s.commissioned !== (s.rank === SUBALTERN)) bad('commission and rank disagree');
    if (s.friends.length !== SECTION_SIZE) bad('section size changed');
    if (s.awards.some((a) => !(a in AWARDS))) bad(`unknown award ${s.awards}`);
    if (s.awards.includes('MM') && s.awards.length && s.log.some((l) => /awarded MM/.test(l) && /^S1 /.test(l))) bad('MM before 1916');
    if (s.ending === 'armistice' && s.stagesDone !== STAGES.length) bad('armistice early');
    if (s.ending === 'posting' && !/leave after stage/.test(s.log.at(-2) || '')) bad('posting outside a leave');
    if (!Number.isFinite(grade(s))) bad('grade not finite');
    if (Object.values(s.war).some((v) => v < 0 || v > 5)) bad('war skill out of range');
  }
}
if (fails.length) { console.log(fails.slice(0, 20).join('\n')); console.log(`${fails.length} failures in ${runs} runs`); process.exit(1); }
console.log(`check: ${runs} runs, deterministic, invariants hold`);
