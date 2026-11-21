// Plays real games to moments for the store shots (tools/press.config.mjs) and writes their save codes
// to release/_press-<name>.txt. Run before tools/press.mjs: npx tsx tools/press-seed.mts
import { writeFileSync } from 'node:fs';
import { loadContent } from './content-loader';
import { newGame, view, choose } from '../src/game/index';
import { toSave, encodeSaveCode } from '../src/game/save';
const content = loadContent();
const want: Record<string, (id: string, s: import('../src/game/index').GameState) => boolean> = {
  loos: (id) => /^b_loos/.test(id),
  sniper: (id) => /^s_snipe_2_[b-e]$/.test(id),
  review: (id) => id === 'y_1917',
  map: (id, s) => s.war.stage === 3 && (s.war as unknown as { clockInStage: number }).clockInStage >= 7 && /^w_tour|^w_/.test(id),
};
const got: Record<string, string> = {};
for (let seed = 1; seed < 400 && Object.keys(got).length < Object.keys(want).length; seed++) {
  const town = ['mill', 'pit', 'city', 'farm'][seed % 4]!;
  let s = newGame(content, { start: Object.values(content.starts).find((x) => x.town === town)!.id, seed, name: 'Tom' });
  for (let k = 0; k < 4000 && !s.ended; k++) {
    const v = view(content, s);
    for (const [n, f] of Object.entries(want)) if (!got[n] && f(v.sceneId, s)) { got[n] = await encodeSaveCode(toSave(s, content)); console.log(n, seed, town, v.sceneId, v.date); }
    const c = v.choices.filter((x) => x.available);
    const pref = c.find((x) => /snipe/.test(x.id)) ?? c.find((x) => ['steady', 'ground', 'careful', 'on'].includes(x.id)) ?? c[(seed + k) % c.length];
    s = choose(content, s, pref!.id).state;
  }
}
for (const [n, code] of Object.entries(got)) writeFileSync(`release/_press-${n}.txt`, code);
