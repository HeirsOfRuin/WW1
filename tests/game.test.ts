// In the Trenches: the content, the war through the engine, the calendar and saves.
import { describe, expect, it } from 'vitest';
import { loadContent } from '../tools/content-loader';
import { validate } from '../tools/validate';
import { runBot } from '../tools/bot';
import { playGame } from '../tools/war-bot';
import { newGame, view, choose, type GameState } from '../src/game/index';
import { toSave, fromSave, encodeSaveCode, decodeSaveCode } from '../src/game/save';
import { warMonth, seasonOf, monthName, ARMISTICE } from '../src/game/war/calendar';
import { phaseHit, battleOf } from '../src/game/war/index';
import { riskWord, whereOf, endingLine } from '../src/game/module';
// The kill-gate prototype: the rules of record until Phase 1 retires it (DESIGN §9).
import { play as protoPlay } from '../prototypes/killgate/model.js';
import { digest as protoDigest } from '../prototypes/killgate/adapter.js';

const content = loadContent();
const TOWNS = ['pit', 'mill', 'city', 'farm'] as const;
const POLICIES = ['reckless', 'careful', 'mates', 'climber', 'adaptive', 'quit1', 'quit2', 'quit3'];
const seedOf = (i: number, town: string) => 1 + i * 7919 + town.charCodeAt(0) * 131 + town.charCodeAt(1);
const warDigest = (s: GameState) => protoDigest({ ...s.war, off: new Set() });

describe('content', () => {
  it('validates with no errors', () => {
    expect(validate(content).filter((i) => i.severity === 'error')).toEqual([]);
  });
  it('random players reach a real ending every time', () => {
    const bad = runBot(10).filter((r) => r.outcome !== 'ending' || r.ending === 'error');
    expect(bad.map((r) => `${r.start} ${r.seed}: ${r.outcome} ${r.ending ?? ''} ${r.detail ?? ''}`)).toEqual([]);
  });
});

describe('the war through the engine equals the kill-gate prototype', () => {
  // Same seed, same policy: the same war, to the fourth decimal of nerve. While this holds,
  // KILLGATE.md's tables are this game's. Remove it at the first deliberate change of a rule.
  for (const policy of POLICIES) it(policy, () => {
    for (const town of TOWNS) for (let i = 0; i < 5; i++) {
      const seed = seedOf(i, town);
      expect(warDigest(playGame(content, { seed, town, policy })), `${policy} ${town} ${seed}`).toBe(protoDigest(protoPlay(seed, { policy, town })));
    }
  });
});

describe('the calendar', () => {
  it('the engine season follows the war month; ages and the date line agree', () => {
    for (const town of TOWNS) for (let i = 0; i < 6; i++) {
      let s = newGame(content, { start: Object.values(content.starts).find((x) => x.town === town)!.id, seed: seedOf(i, town), name: 'Cal' });
      let last = s.time;
      for (let step = 0; step < 4000 && !s.ended; step++) {
        const v = view(content, s);
        expect(v.date).toBe(monthName(warMonth(s.war)));
        expect(s.time).toBeGreaterThanOrEqual(last);
        if (s.war.clock > 0) expect(s.time).toBe(seasonOf(warMonth(s.war)));
        last = s.time;
        const c = v.choices.find((x) => x.available)!;
        s = choose(content, s, c.id).state;
      }
      expect(s.ended).toBeTruthy();
    }
  });
  it('a man who reaches the Armistice is 22 in November 1918', () => {
    let found = 0;
    for (let i = 0; i < 300 && found < 3; i++) {
      const s = playGame(content, { seed: seedOf(i, 'farm'), town: 'farm', policy: 'adaptive' });
      if (s.war.ending !== 'armistice') continue;
      found++;
      expect(s.time).toBe(seasonOf(ARMISTICE));
      expect(Math.floor((s.time - s.characters[s.hero]!.born) / 4)).toBe(22);
      expect(view(content, s).text).toContain('22 years old');
    }
    expect(found).toBeGreaterThan(0);
  });
});

describe('what the screen says is what the resolver does', () => {
  it('battle risk words come from the resolver', () => {
    let s = newGame(content, { start: 'mill', seed: 77, name: 'Risk' });
    for (let step = 0; step < 4000 && !s.ended; step++) {
      const v = view(content, s);
      const q = s.war.pending;
      if (q?.kind === 'battle') {
        const b = battleOf(s.war);
        for (const c of ['push', 'help', 'ground'] as const) {
          const word = riskWord(phaseHit(s.war, b, b.phases[q.phase]![0], q.type, c));
          expect(v.choices.find((x) => x.id === c)!.text).toContain(word);
        }
      }
      s = choose(content, s, v.choices.find((x) => x.available)!.id).state;
    }
  });
});

describe('endings say what happened, in words', () => {
  // A smoke run showed "listening." on the death screen: the raw duty id. Every recorded cause
  // must have words, and the record (friends home, the grade) must be on the page that shows.
  it('every cause of every ending is worded', () => {
    const seen = new Set<string>();
    for (const policy of POLICIES) for (const town of TOWNS) for (let i = 0; i < 40; i++) {
      const s = playGame(content, { seed: seedOf(i, town), town, policy });
      const w = s.war;
      seen.add(w.ending!);
      expect(endingLine(w), `${w.ending} ${w.endWhy}`).not.toBe('');
      if (!['armistice', 'posting'].includes(w.ending!) && !(w.ending === 'broken' && !w.endWhy.includes(':'))) {
        expect(whereOf(w.endWhy), `unworded cause "${w.endWhy}"`).not.toBe('in France');
      }
      const v = view(content, s);
      expect(v.text).toContain('came home');
      expect(v.text).not.toMatch(/^\s*(raid|patrol|wiring|listening|carrying|shellfire|courtMartial)\.?\s*$/m);
    }
    expect([...seen].sort()).toEqual(['armistice', 'broken', 'captured', 'courtMartial', 'invalided', 'killed', 'posting']);
  });
});

describe('saves', () => {
  it('a war saved and loaded mid-rotation plays on exactly as if never saved', async () => {
    let a = newGame(content, { start: 'pit', seed: 4242, name: 'Save' });
    for (let k = 0; k < 25 && !a.ended; k++) a = choose(content, a, view(content, a).choices.find((x) => x.available)!.id).state;
    let b = fromSave(JSON.parse(JSON.stringify(toSave(a, content))), content).state;
    const viaCode = fromSave(await decodeSaveCode(await encodeSaveCode(toSave(a, content))), content).state;
    expect(warDigest(viaCode)).toBe(warDigest(a));
    for (let k = 0; k < 4000 && !a.ended; k++) {
      const id = view(content, a).choices.find((x) => x.available)!.id;
      a = choose(content, a, id).state; b = choose(content, b, id).state;
    }
    expect(warDigest(b)).toBe(warDigest(a));
  });
});
