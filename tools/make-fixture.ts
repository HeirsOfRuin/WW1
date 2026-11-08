// Writes tests/fixtures/v<SAVE_VERSION>-save.json: a save a few choices into the first start,
// from the current build. Run it once per save version, BEFORE the version rises, and commit it.
import { writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadContent } from './content-loader';
import { newGame, view, choose, startsOf } from '../src/game/index';
import { toSave, SAVE_VERSION } from '../src/game/save';

const content = loadContent();
const file = join(import.meta.dirname, '..', 'tests', 'fixtures', `v${SAVE_VERSION}-save.json`);
if (existsSync(file) && !process.argv.includes('--force')) { console.error(`${file} exists: a shipped fixture is never rewritten (--force if it never shipped)`); process.exit(1); }
let s = newGame(content, { start: startsOf(content)[0]!, seed: 12345, name: 'Fixture' });
for (let i = 0; i < 2 && !s.ended; i++) s = choose(content, s, view(content, s).choices.find((c) => c.available)!.id).state;
writeFileSync(file, JSON.stringify(toSave(s, content), null, 1));
console.log(`wrote ${file} (scene ${s.scene})`);
