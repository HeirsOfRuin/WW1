// The save contract: every save version that ever shipped has a fixture in tests/fixtures/
// (v<N>-save.json), and each must load through fromSave (with its migrations) and play on.
// When SAVE_VERSION rises, commit a fixture saved by the old build FIRST.
// Make one: npx tsx tools/make-fixture.ts (a save a few choices in, from the current build).
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { loadContent } from '../tools/content-loader';
import { SAVE_VERSION, fromSave } from '../src/game/save';
import { view, choose } from '../src/game/index';

const content = loadContent();
const dir = new URL('./fixtures/', import.meta.url);
const fixtures = readdirSync(dir).filter((f) => /^v\d+-save\.json$/.test(f)).sort();

describe('save contract', () => {
  it('has a fixture for every save version', () => {
    for (let v = 1; v <= SAVE_VERSION; v++) expect(fixtures).toContain(`v${v}-save.json`);
  });
  for (const f of fixtures) {
    it(`${f} loads and plays on`, () => {
      const { state } = fromSave(JSON.parse(readFileSync(new URL(f, dir), 'utf8')), content);
      expect(content.scenes[state.scene], `scene ${state.scene} from ${f} no longer exists`).toBeTruthy();
      const c = view(content, state).choices.find((x) => x.available);
      if (c) expect(choose(content, state, c.id).state.journal.length).toBeGreaterThan(state.journal.length);
    });
  }
});
