// In the Trenches: the content, the war through the engine, the calendar and saves.
import { describe, expect, it } from 'vitest';
import { loadContent } from '../tools/content-loader';
import { validate } from '../tools/validate';
import { runBot } from '../tools/bot';
import { playGame } from '../tools/war-bot';
import { newGame, view, choose, type GameState } from '../src/game/index';
import { toSave, fromSave, encodeSaveCode, decodeSaveCode } from '../src/game/save';
import { warMonth, seasonOf, monthName, ARMISTICE } from '../src/game/war/calendar';
import { phaseHit, battleOf, newWar, run, decide, decideFor, homeTier, sentHomeOf, missionHit, rankFull, ROLES as WAR_ROLES, POLICIES as WAR_POLICIES } from '../src/game/war/index';
import { riskWord, whereOf, endingLine } from '../src/game/module';
import { share } from '../tools/story-share';
import { recordOf } from '../src/game/character';
import { mapOf, project, EXTENT } from '../src/game/warmap';
import { rasterize, MAP_W, MAP_H, MAP_COLOURS } from '../src/game/pixelmap';

const content = loadContent();
const TOWNS = ['pit', 'mill', 'city', 'farm'] as const;
const POLICIES = ['reckless', 'careful', 'mates', 'climber', 'adaptive', 'quit1', 'quit2', 'quit3'];
const seedOf = (i: number, town: string) => 1 + i * 7919 + town.charCodeAt(0) * 131 + town.charCodeAt(1);
// the end state of a war, for comparing two plays of the same game
const warDigest = (s: GameState) => JSON.stringify([s.war.ending, s.war.clock, s.war.rank, s.war.nerve.toFixed(4), s.war.standing.toFixed(4), s.war.awards, s.war.friends]);

describe('content', () => {
  it('validates with no errors', () => {
    expect(validate(content).filter((i) => i.severity === 'error')).toEqual([]);
  });
  it('random players reach a real ending every time', () => {
    const bad = runBot(10).filter((r) => r.outcome !== 'ending' || r.ending === 'error');
    expect(bad.map((r) => `${r.start} ${r.seed}: ${r.outcome} ${r.ending ?? ''} ${r.detail ?? ''}`)).toEqual([]);
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
      // a news scene (a friend killed) can show while a battle question waits: check battle screens only
      if (q?.kind === 'battle' && (v.sceneId.startsWith('b_') || v.sceneId === 'w_battle')) {
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
  }, 60_000); // 1,280 whole wars through the engine
});

describe('the story leads', () => {
  // The author, 2026-11-09: "follow a story more so than just playing generic missions. Have a
  // general play through (only volunteering half the time) to split between story and generic
  // missions 50/50". Measured on the written years (the mill town, 1915-1918): a year that drifts
  // far from even fails here.
  it('story is about half the screens in each written year', () => {
    const r = share(40);
    for (const y of [1, 2, 3, 4]) {
      const c = r.byYear[y]!;
      const p = c.story / (c.story + c.generic);
      expect(p, `year ${1914 + y}: story ${(100 * p).toFixed(1)}%`).toBeGreaterThan(0.44);
      expect(p, `year ${1914 + y}: story ${(100 * p).toFixed(1)}%`).toBeLessThan(0.7);
    }
  }, 120_000);
  it('the pit town\'s written years (1915-1917) are about half story too', () => {
    const r = share(40, 'pit');
    for (const y of [1, 2, 3]) {
      const c = r.byYear[y]!;
      const p = c.story / (c.story + c.generic);
      expect(p, `pit ${1914 + y}: story ${(100 * p).toFixed(1)}%`).toBeGreaterThan(0.44);
      expect(p, `pit ${1914 + y}: story ${(100 * p).toFixed(1)}%`).toBeLessThan(0.7);
    }
  }, 120_000);
});

describe('the farm and city towns', () => {
  it('the city town\'s written years (1915-1917) are about half story', () => {
    const r = share(120, 'city'); // 120: 1917 has 10-15 screens a game, and 40 games was too few to hold the band
    for (const y of [1, 2, 3]) {
      const c = r.byYear[y]!;
      const p = c.story / (c.story + c.generic);
      expect(p, `city ${1914 + y}: story ${(100 * p).toFixed(1)}%`).toBeGreaterThan(0.44);
      expect(p, `city ${1914 + y}: story ${(100 * p).toFixed(1)}%`).toBeLessThan(0.7);
    }
  }, 120_000);
  it('the farm town\'s written years (1915-1917) are about half story', () => {
    const r = share(120, 'farm'); // 120: 1917 has 10-15 screens a game, and 40 games was too few to hold the band
    for (const y of [1, 2, 3]) {
      const c = r.byYear[y]!;
      const p = c.story / (c.story + c.generic);
      expect(p, `farm ${1914 + y}: story ${(100 * p).toFixed(1)}%`).toBeGreaterThan(0.44);
      expect(p, `farm ${1914 + y}: story ${(100 * p).toFixed(1)}%`).toBeLessThan(0.7);
    }
  }, 120_000);
});

describe('every role has words', () => {
  // A choice whose text is built role by role ("[if war.path == lewis]...[/if]...") shows a blank
  // button to any role it forgets. The stretcher-bearer (2026-11-14) was the first role added after
  // the battles were written; this holds every role to every battle and mission choice.
  const ROLES_1916 = ['rifleman', 'nco', 'lewis', 'signals', 'bomb', 'snipe', 'bearer', 'tunnel', 'subaltern', 'tank', 'air'];
  const render = (t: string, path: string) => t.replace(/\[if ([^\]]*war\.path[^\]]*)\](.*?)\[\/if\]/g, (_m, cond: string, body: string) => {
    const ok = cond.split('||').some((c) => { const m = /war\.path (==|!=) (\w+)/.exec(c.trim()); return !!m && (m[1] === '==' ? m[2] === path : m[2] !== path); });
    return ok ? body : '';
  });
  it('no battle or mission choice is blank for any role', () => {
    const blank: string[] = [];
    for (const sc of Object.values(content.scenes)) {
      if (!/^(b_|w_mission)/.test(sc.id)) continue;
      for (const ch of sc.choices ?? []) {
        if (!ch.text.includes('war.path')) continue;
        for (const path of ROLES_1916) {
          if ((path === 'tank' || path === 'air') && sc.id !== 'w_mission') continue; // their battles are bt_tank and bt_air
          const words = render(ch.text, path).replace(/\(\{[a-z_]+\}\)/g, '').trim();
          if (!words) blank.push(`${sc.id}/${ch.id} as ${path}`);
        }
      }
    }
    // a tunneller's and an officer's choices on the first of July are only for the towns that have them
    expect(blank.filter((b) => !/(w_mission\/go as (rifleman|nco|subaltern))|( as (tunnel|subaltern)$)/.test(b))).toEqual([]);
  });
});

describe('the tanks and the Flying Corps', () => {
  // FRAME-TANK.md, FRAME-AIR.md (2026-11-14). A war-layer man who takes each offer, played to the end.
  const play = (corps: 'tank' | 'air', seed: number, town: (typeof TOWNS)[number]) => {
    const p = { ...WAR_POLICIES.adaptive!, corps: (_w: unknown, c: string) => c === corps };
    const w = newWar({ seed, town });
    const months: Record<string, string> = {};
    for (let g = 0; g < 5000 && !w.ending; g++) {
      run(w);
      if (!w.pending) break;
      if (w.pending.kind === 'battle') months[w.pending.battle] = monthName(warMonth(w));
      decide(w, decideFor(p as never, w, w.pending, battleOf) as never);
    }
    return { w, months };
  };
  it('every mission has a real risk (an unknown skill read as NaN made flying missions harmless)', () => {
    const w = newWar({ seed: 1, town: 'mill' });
    for (const k of Object.keys(WAR_ROLES)) { expect(Number.isFinite(missionHit(w, k)), k).toBe(true); expect(missionHit(w, k), k).toBeGreaterThan(0); }
  });
  it('the tank man fights Cambrai in November 1917; the air gunner flies, under RFC ranks', () => {
    let tanks = 0, cambrai = 0, airs = 0;
    for (let i = 0; i < 400; i++) {
      const t = play('tank', 7000 + i, 'mill');
      if (t.w.corps === 'tank') {
        tanks++; expect(t.w.log.join('\n')).toMatch(/S3 r19 \| transferred to the Tank Corps/);
        if (t.months.Cambrai) { cambrai++; expect(t.months.Cambrai).toBe('November 1917'); }
      }
      const a = play('air', 7000 + i, TOWNS[i % 4]!);
      if (a.w.corps === 'air') {
        airs++; expect(a.w.log.join('\n')).toMatch(/S3 r2[34] \| transferred to the Royal Flying Corps/);
        expect(rankFull(a.w)).not.toMatch(/^(Private|Lance corporal)/);
        if (a.w.ending === 'captured' && a.w.endWhy.endsWith('shot down')) expect(endingLine(a.w)).toMatch(/^Shot down/);
      }
    }
    expect(tanks).toBeGreaterThan(20); expect(cambrai).toBeGreaterThan(5); expect(airs).toBeGreaterThan(4);
  }, 60_000);
});

describe('the crew on the Soldier tab', () => {
  // A crewman's fate is a story choice that comes true later: the record must not show it early.
  it('shows Polaris\'s crew, and Lacey dead only after Cambrai', () => {
    let seen = 0;
    for (let i = 0; i < 300 && seen < 3; i++) {
      let s = newGame(content, { start: 'mill', seed: 3000 + i * 13, name: 'Tom' });
      const pol = { ...WAR_POLICIES.adaptive!, corps: (_w: unknown, c: string) => c === 'tank' };
      for (let k = 0; k < 5000 && !s.ended; k++) {
        const v = view(content, s);
        if (s.war.corps === 'tank') {
          const lacey = recordOf(content, { ...s, flags: { ...s.flags, tk17_lacey_praised: true } } as GameState).crew!.men[0]!;
          const fought = s.war.log.some((l) => l.includes('battle: Cambrai as')) || s.war.clock > 29;
          expect(lacey.alive, `tour ${s.war.clock}`).toBe(!fought);
          if (fought) seen++;
        }
        const ok = v.choices.filter((c) => c.available);
        const id = s.war.pending && !v.sceneId.startsWith('v1') && !v.sceneId.startsWith('x_') && !v.sceneId.startsWith('y_') && !v.sceneId.startsWith('c_') ? decideFor(pol as never, s.war, s.war.pending, battleOf).replace(':', '_') : ok[0]?.id;
        if (!id || !ok.some((c) => c.id === id)) { if (!ok[0]) break; s = choose(content, s, ok[0].id).state; continue; }
        s = choose(content, s, id).state;
      }
    }
    expect(seen).toBeGreaterThan(0);
  }, 60_000);
});

describe('playtest 2', () => {
  // The author's save: a course on the tour before 1 July took him away from the battle without a word.
  it('no course comes on the tour before a battle, and a missed battle is told', () => {
    let missed = 0;
    for (let i = 0; i < 300; i++) {
      const w = newWar({ seed: 5100 + i, town: TOWNS[i % 4]! });
      for (let g = 0; g < 5000 && !w.ending; g++) {
        run(w); if (!w.pending) break;
        if (w.pending.kind === 'course') expect(battleOf({ ...w, r: w.r + 1 } as never), `course at S${w.stage} r${w.r}`).toBeUndefined();
        decide(w, decideFor(WAR_POLICIES.adaptive!, w, w.pending, battleOf) as never);
        const b = w.news?.battle; if (b?.done && !b.fought) { missed++; expect(['course', 'wound']).toContain(b.why); }
      }
    }
    expect(missed).toBeGreaterThan(10);
  }, 60_000);
  // "Nerve +7" after a raid: the rest that followed was counted as the raid's.
  it('nerve won back at rest is shown apart from what the choice cost', () => {
    let seen = 0;
    for (let i = 0; i < 40 && seen < 20; i++) {
      let s = newGame(content, { start: TOWNS[i % 4]!, seed: 700 + i, name: 'Tom' });
      for (let k = 0; k < 3000 && !s.ended; k++) {
        const v = view(content, s);
        const ok = v.choices.filter((c) => c.available);
        const id = s.war.pending && v.choices.some((c) => c.id === decideFor(WAR_POLICIES.half!, s.war, s.war.pending!, battleOf).replace(':', '_')) ? decideFor(WAR_POLICIES.half!, s.war, s.war.pending!, battleOf).replace(':', '_') : ok[0]?.id;
        if (!id) break;
        const r = choose(content, s, id); s = r.state;
        const ch = view(content, s).outcome?.changes ?? [];
        if (ch.some((c) => c.startsWith('Out at rest'))) seen++;
        expect(ch.filter((c) => /^Nerve [+−]/.test(c)).length).toBeLessThanOrEqual(1);
      }
    }
    expect(seen).toBeGreaterThan(0);
  }, 60_000);
});

describe('the war map', () => {
  // The author, 2026-11-17: "a pixel map of the overall war". Every month has a line and a place for
  // him on the map (or England, or a prison camp), every battle in his log is marked, and the marker
  // for him is drawn where the map says he is.
  it('places him, his battles and the line for every month of real wars', () => {
    for (let i = 0; i < 60; i++) {
      const w = newWar({ seed: 8100 + i, town: TOWNS[i % 4]! });
      for (let g = 0; g < 5000 && !w.ending; g++) {
        run(w); if (!w.pending) break;
        const v = mapOf(w);
        expect(v.line.points.length).toBeGreaterThan(5);
        if (v.here.at) {
          const [lat, lon] = v.here.at;
          expect(lat >= EXTENT.lat0 && lat <= EXTENT.lat1 && lon >= EXTENT.lon0 && lon <= EXTENT.lon1, `${v.month} ${v.here.where}`).toBe(true);
        }
        const fought = w.log.filter((l) => / \| battle: /.test(l)).length;
        expect(v.battles.filter((b) => b.fought).length).toBeLessThanOrEqual(fought);
        decide(w, decideFor(WAR_POLICIES.half!, w, w.pending, battleOf) as never);
      }
      const v = mapOf(w);
      if (v.here.at) {
        const px = rasterize(v); const [x, y] = project(v.here.at, MAP_W, MAP_H); const k = (y * MAP_W + x) * 4;
        expect([px[k], px[k + 1], px[k + 2]]).toEqual([...MAP_COLOURS.here]);
      }
    }
  }, 60_000);
});

describe('pay sent home', () => {
  // The author, 2026-11-09: "pay becomes money sent home that changes the family's circumstances
  // on leave". A shown number must change something: it grows every tour, it is in the soldier's
  // record, and at each leave it splits men by rank and role into different home circumstances.
  it('grows every tour and splits each leave by what was sent', () => {
    const tiersAt: Record<number, Set<number>> = { 1: new Set(), 2: new Set(), 3: new Set() };
    for (let i = 0; i < 300; i++) {
      const w = newWar({ seed: 9100 + i, town: TOWNS[i % 4]! });
      let last = 0;
      for (let g = 0; g < 3000 && !w.ending; g++) {
        run(w);
        if (!w.pending) break;
        expect(sentHomeOf(w)).toBeGreaterThanOrEqual(last);
        last = sentHomeOf(w);
        if (w.pending.kind === 'leave' && !w.transferred) tiersAt[w.stage]!.add(homeTier(w));
        decide(w, decideFor(WAR_POLICIES.half!, w, w.pending, battleOf) as never);
      }
    }
    for (const st of [1, 2, 3]) expect(tiersAt[st]!.size, `leave ${st} tiers`).toBeGreaterThanOrEqual(2);
  }, 60_000);
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
