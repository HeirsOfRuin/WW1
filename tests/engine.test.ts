// The engine on this game's content: every construct the placeholder story uses, end to end.
// When the story is replaced, keep these passing on a test arc (tests/fixtures/test-arc.yaml in
// Knight of Adalia): engine tests that read the shipped story break with every content edit.
import { describe, expect, it } from 'vitest';
import { loadContent } from '../tools/content-loader';
import { validate } from '../tools/validate';
import { runBot } from '../tools/bot';
import { newGame, view, choose, type GameState } from '../src/game/index';
import { toSave, fromSave, encodeSaveCode, decodeSaveCode } from '../src/game/save';

const content = loadContent();
const start = (s: string, seed = 1) => newGame(content, { start: s, seed, name: 'Hal' });
const pick = (s: GameState, id: string, force?: 'success' | 'partial' | 'failure') => choose(content, s, id, { force }).state;

describe('content', () => {
  it('validates with no errors', () => {
    expect(validate(content).filter((i) => i.severity === 'error')).toEqual([]);
  });
  it('every bot run reaches an ending', () => {
    const bad = runBot(12).filter((r) => r.outcome !== 'ending');
    expect(bad.map((r) => `${r.start} ${r.seed}: ${r.outcome} ${r.detail ?? ''}`)).toEqual([]);
  });
});

describe('text', () => {
  it('[if] and variants follow the start; {name} renders', () => {
    const heir = view(content, start('heir'));
    expect(heir.text).toContain("Your father's boat");
    expect(heir.text).toContain('Hal, says a voice');
    expect(view(content, start('stranger')).text).toContain('They call you the ferry');
  });
  it('a game text variable renders ({takings})', () => {
    let s = pick(start('heir'), 'toll');
    s = pick(s, 'wait');
    while (s.scene !== 'c_reckoning') s = pick(s, view(content, s).choices.find((c) => c.available)!.id);
    expect(view(content, s).text).toMatch(/taken 6(d| pence)/);
  });
});

describe('choices', () => {
  it('requires: locked with a reason; visible_if: hidden', () => {
    const v = view(content, start('heir'));
    const reeve = v.choices.find((c) => c.id === 'reeve')!;
    expect(reeve.available).toBe(false);
    expect(reeve.lockReason).toBeTruthy();
    expect(view(content, start('stranger')).choices.find((c) => c.id === 'reeve')!.available).toBe(true);
    expect(view(content, pick(start('heir'), 'toll')).choices.map((c) => c.id)).not.toContain('bribe');
    expect(view(content, pick(start('heir'), 'mend')).choices.map((c) => c.id)).toContain('bribe');
  });
  it('a lethal choice says so, with its warning and odds', () => {
    const carry = view(content, pick(start('heir'), 'mend')).choices.find((c) => c.id === 'carry')!;
    expect(carry.lethal).toBe(true);
    expect(carry.band).toBeTruthy();
  });
  it('a check: failure kills, partial injures, success goes on through the pool', () => {
    const s = pick(start('heir'), 'mend');
    const dead = pick(s, 'carry', 'failure');
    expect(dead.ended?.ending).toBe('death');
    const hurt = pick(s, 'carry', 'partial');
    expect(hurt.characters[hurt.hero]!.injuries.map((i) => i.id)).toContain('cracked_ribs');
    const ok = pick(s, 'carry', 'success');
    expect(ok.npcs.osric!.met).toBe(true);
    expect(['e_otter', 'e_quiet']).toContain(ok.scene); // drawn from the river pool
  });
  it('a pool scene returns to the pool\'s then; the calendar advances', () => {
    let s = pick(pick(start('heir'), 'mend'), 'carry', 'success');
    s = pick(s, view(content, s).choices[0]!.id);
    expect(s.scene).toBe('c_reckoning');
    expect(s.time).toBe(2);
  });
  it('a queued event comes when its delay runs out', () => {
    let s = pick(pick(start('heir'), 'mend'), 'wait');
    const seen: string[] = [];
    for (let i = 0; i < 10 && !s.ended; i++) { seen.push(s.scene); s = pick(s, view(content, s).choices.find((c) => c.available)!.id); }
    expect(seen).toContain('q_friar_word');
  });
  it('switch: trust decides the ending', () => {
    let s = pick(pick(start('stranger'), 'reeve'), 'carry', 'success');
    s = pick(s, view(content, s).choices[0]!.id);
    expect(pick(s, 'truth').ended?.ending).toBe('kept');
  });
});

describe('saves', () => {
  it('round-trip through the save file and the save code', async () => {
    const s = pick(start('heir', 7), 'mend');
    const back = fromSave(JSON.parse(JSON.stringify(toSave(s, content))), content).state;
    expect(back).toEqual(s);
    const code = await encodeSaveCode(toSave(s, content));
    expect(fromSave(await decodeSaveCode(code), content).state).toEqual(s);
  });
  it('refuses a save from another game', () => {
    expect(() => fromSave({ format: 'other-save', saveVersion: 1, state: {} }, content)).toThrow();
  });
});
