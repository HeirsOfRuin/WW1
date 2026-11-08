// The war layer: one soldier's war, as a step machine that stops at every decision the player
// makes. A port of prototypes/killgate/model.js (round 2), rule for rule and draw for draw:
// `run()` does what the prototype's play() did between two policy calls, and `decide()` applies
// the choice the prototype asked its policy for. tests/war-equivalence.test.ts plays both on the
// same seeds and requires identical end states, so KILLGATE.md's numbers are this game's numbers.
//
// Pure: plain JSON state, no DOM, no clock, no Math.random. Callers clone before calling (the
// engine's choose() already has).

import { chance, float, pick, raw, seedStreams, type Streams, type StreamName } from './rng';
import {
  TOWNS, DEFAULT_GENERAL, WAR_SKILLS, SPECIALIST, APTITUDE, TOWN_COURSE, WAR_WORK, STAGES, DUTIES, WOUND, PATHS,
  CHOICES, GRADE, SECTION_SIZE, SUBALTERN, TOP_OR, RANKS, REST, FRIEND_BATTLE, PHASE_HIT, STALL, ROLES, ROLE,
  COMMISSION_BOARD, type Town, type Ending, type BattleChoice, type Battle, type Stage,
} from './data';

// ---- state -------------------------------------------------------------------------------

/** What the war is waiting for the player to decide. */
export type Pending =
  | { kind: 'tunnel' }
  | { kind: 'duty'; duty: string; friendAtRisk: boolean }
  | { kind: 'mission'; role: string }
  | { kind: 'sick' }
  | { kind: 'course'; skill: string }
  | { kind: 'battle'; battle: string; phase: number; type: string; stalled: boolean }
  | { kind: 'leave'; offers: string[]; commission: boolean };

export type Decision =
  | 'transfer' | 'stay'                 // tunnel
  | 'volunteer' | 'stay_back'           // duty
  | 'go' | 'decline'                    // mission, course
  | 'report' | 'carry_on'               // sick
  | 'take'                              // course
  | BattleChoice                        // battle
  | 'back' | 'commission' | `posting:${number}`; // leave

/** Where the machine is. Saved, so a war resumes mid-rotation. */
type Cursor =
  | { at: 'train' }
  | { at: 'stage' }
  | { at: 'path' }
  | { at: 'rotation' }
  | { at: 'duty'; sectionP: number; offered: string[]; i: number; cover: number }
  | { at: 'mission'; sectionP: number; cover: number }
  | { at: 'support'; sectionP: number; cover: number }
  | { at: 'course' }
  | { at: 'battle'; i: number; pts: number }
  | { at: 'tally' }
  | { at: 'leave' }
  | { at: 'done' };

export interface WarStats {
  minNerve: number; lowNerve: number; rotations: number; volunteered: number; detailed: number; courses: number;
  battles: number; missedBattles: number; offersAtLeave: Record<number, number>; friendsLostWithYou: number;
  missions: number; missionsWon: number;
}

export interface War {
  seed: number;
  town: Town;
  homeSet: Record<string, 1>;
  /** measurement only: skills whose effect is switched off (the inert check); empty in play */
  off: string[];
  war: Record<string, number>;
  nerve: number; standing: number; rank: number; commissioned: boolean; transferred: boolean;
  awards: string[];
  /** the nine men of his section from home: alive or not */
  friends: boolean[];
  merit: number; severe: number; out: number;
  battleNow: boolean; inBattle: boolean; blightyThisStage: boolean; courseThisStage: boolean;
  stage: number; clock: number; clockInStage: number; r: number;
  path: string; promotedThisStage: boolean;
  ending: Ending | null; endedStage: number; stagesDone: number; posting: string | null;
  /** what ended it, as the resolver recorded it (a duty, a battle, shellfire); worded by the module */
  endWhy: string;
  stats: WarStats;
  log: string[];
  rng: Streams;
  cursor: Cursor;
  pending: Pending | null;
}

export interface NewWarOptions { seed: number; town: Town; picks?: string[]; general?: string; off?: string[] }

export function newWar(o: NewWarOptions): War {
  const homeSet: Record<string, 1> = {};
  for (const k of [...(o.picks ?? TOWNS[o.town].pick), o.general ?? DEFAULT_GENERAL]) homeSet[k] = 1;
  const w: War = {
    seed: o.seed, town: o.town, homeSet, off: o.off ?? [],
    war: Object.fromEntries(WAR_SKILLS.map((k) => [k, 0])),
    nerve: 75, standing: 40, rank: 0, commissioned: false, transferred: false,
    awards: [], friends: Array.from({ length: SECTION_SIZE }, () => true),
    merit: 0, severe: 0, out: 0, battleNow: false, inBattle: false, blightyThisStage: false, courseThisStage: false,
    stage: 1, clock: 0, clockInStage: 0, r: 0, path: 'rifleman', promotedThisStage: false,
    ending: null, endedStage: 0, stagesDone: 0, posting: null, endWhy: '',
    stats: { minNerve: 75, lowNerve: 0, rotations: 0, volunteered: 0, detailed: 0, courses: 0, battles: 0, missedBattles: 0, offersAtLeave: {}, friendsLostWithYou: 0, missions: 0, missionsWon: 0 },
    log: [], rng: seedStreams(o.seed), cursor: { at: 'train' }, pending: null,
  };
  return w;
}

/** Hometown picks are made after the war state exists (character creation); before the war starts. */
export function setHome(w: War, picks: string[], general: string): void {
  w.homeSet = {};
  for (const k of [...picks, general]) w.homeSet[k] = 1;
}

// ---- small rules --------------------------------------------------------------------------

export const home = (w: War, k: string) => (w.homeSet[k] && !w.off.includes(k) ? 1 : 0);
export const skill = (w: War, k: string) => (w.off.includes(k) ? 0 : w.war[k]!);
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const say = (w: War, msg: string) => { w.log.push(`S${w.stage} r${w.clock} | ${msg}`); };
export const aliveFriends = (w: War) => w.friends.filter(Boolean).length;
const withSection = (w: War) => !w.transferred && w.out === 0;
const SEVERE_OUT = 4;
const ch = (w: War, l: StreamName, p: number) => chance(w.rng, l, p);
const stageOf = (w: War): Stage => STAGES[w.stage - 1]!;
export const isRole = (w: War) => w.path in ROLES;

function end(w: War, kind: Ending, why: string): void {
  if (w.ending) return;
  w.ending = kind; w.endedStage = w.stage; w.endWhy = why;
  say(w, `ENDING ${kind}: ${why}`);
}

// The section fights on after he leaves it, by whatever road: "friends home" means who came
// home in 1918, not who was alive the day he left (KILLGATE round 1, fault 4).
function finishWar(w: War): void {
  w.transferred = true;
  for (const st of STAGES) {
    if (st.n < w.endedStage) continue;
    const from = st.n === w.endedStage ? w.clockInStage : 0;
    for (let k = from; k < st.rotations; k++) {
      const b = st.battles[k];
      const p = b ? 1 - b.phases.reduce((a, [base]) => a * (1 - base * FRIEND_BATTLE), 1) : st.sectionLoss;
      for (let i = 0; i < w.friends.length; i++) if (w.friends[i] && ch(w, 'section', p)) w.friends[i] = false;
    }
  }
}

function learn(w: War, k: string, amt: number): void {
  const apt = APTITUDE[k];
  const mult = apt && home(w, apt) ? 1.6 : 1;
  w.war[k] = clamp(w.war[k]! + amt * mult, 0, 5);
}

// One derivation for every hit chance (rule 1): the risk words on screen read these too.
export const trenchMod = (w: War) => 1 - 0.06 * skill(w, 'trench');
const nerveMod = (w: War) => (home(w, 'stamina') ? 0.88 : 1);
function spendNerve(w: War, amt: number): void { w.nerve = clamp(w.nerve - amt * nerveMod(w), -10, 100); }

function hit(w: War, cause: string): void {
  const r = raw(w.rng, 'fire');
  if (r < WOUND.killed) { w.inBattle = w.battleNow; return end(w, 'killed', cause); }
  if (r < WOUND.killed + WOUND.severe) {
    w.severe += 1;
    if (ch(w, 'fire', WOUND.downgrade) || w.severe >= 3) return end(w, 'invalided', `${cause}, severe wound, downgraded`);
    w.out = SEVERE_OUT; w.blightyThisStage = true;
    w.nerve = clamp(w.nerve + 10, 0, 100);
    return say(w, `severe wound (${cause}): hospital in England, out ${SEVERE_OUT} rotations`);
  }
  w.out = home(w, 'stamina') ? 1 : 2;
  spendNerve(w, 4);
  say(w, `light wound (${cause}): out ${w.out} rotation(s)`);
}

function friendLosses(w: War, p: number, why: string): void {
  const present = withSection(w);
  for (let i = 0; i < w.friends.length; i++) {
    if (!w.friends[i]) continue;
    if (ch(w, 'section', p)) {
      w.friends[i] = false;
      spendNerve(w, present ? 7 : 3);
      if (present) w.stats.friendsLostWithYou++;
      say(w, `friend ${i + 1} killed (${why})`);
    }
  }
}

function sectionMod(w: War): number {
  if (!withSection(w)) return 1;
  let m = home(w, 'firstaid') ? 0.85 : 1;
  if (w.path === 'nco' || w.path === 'subaltern') m *= 1 - 0.05 * skill(w, 'lead');
  return m;
}

function promote(w: War, why: string): void {
  if (w.commissioned || w.rank >= TOP_OR) return;
  w.rank += 1; w.promotedThisStage = true;
  say(w, `promoted to ${RANKS[w.rank]} (${why})`);
}

function award(w: War, pts: number): void {
  if (pts <= 0 || !ch(w, 'career', Math.min(0.6, pts / 22))) return;
  let a = 'MiD';
  if (pts >= 14 && ch(w, 'career', 0.06)) a = 'VC';
  else if (pts >= 9 && ch(w, 'career', 0.3)) a = 'DCM';
  else if (w.stage >= 2) a = w.commissioned ? 'MC' : 'MM';
  w.awards.push(a);
  w.standing = clamp(w.standing + 8, 0, 100);
  w.nerve = clamp(w.nerve + 4, 0, 100);
  say(w, `awarded ${a}`);
}

function rest(w: War): void {
  const present = withSection(w) ? aliveFriends(w) : w.transferred && w.out === 0 ? ROLE.crew : 0;
  const pay = isRole(w) ? ROLE.restBonus : 0;
  w.nerve = clamp(w.nerve + REST.base + REST.voice * home(w, 'voice') + REST.perFriend * present + pay, -10, 100);
  if (home(w, 'voice') && withSection(w)) w.standing = clamp(w.standing + 1, 0, 100);
}

// ---- leave ------------------------------------------------------------------------------------

/** One function decides which home postings exist: the leave screen, the bot and the stats read it. */
export function postingOffers(w: War): string[] {
  const out: string[] = [];
  if (w.blightyThisStage) out.push('home service (wounded)');
  const ww = WAR_WORK[w.town];
  if (home(w, ww.skill) && w.stage >= ww.from && ch(w, 'leave', 0.15 * w.stage + w.standing / 300)) out.push(`war work (${w.town})`);
  const best = Math.max(...SPECIALIST.map((k) => skill(w, k)), skill(w, 'lead'), skill(w, 'tunnel'));
  if (w.stage >= 2 && w.rank >= 2 && best >= 3 && ch(w, 'leave', 0.55)) out.push('instructor');
  return out;
}

function commissionOffer(w: War): boolean {
  return w.stage === 3 && !w.commissioned && w.rank >= 3 && w.standing >= 70
    && (!!home(w, 'lit') || w.awards.some((a) => a !== 'MiD') || skill(w, 'lead') >= 3.5)
    && ch(w, 'leave', COMMISSION_BOARD);
}

function pathFor(w: War): string {
  if (w.commissioned) return 'subaltern';
  if (w.transferred) return 'tunnel';
  let best: string | null = null;
  for (const k of SPECIALIST) if (skill(w, k) >= 2 && (!best || skill(w, k) > skill(w, best))) best = k;
  if (w.rank >= 2 && !(best && skill(w, best) >= ROLE.keepRole)) return 'nco';
  return best || 'rifleman';
}

// ---- the machine ------------------------------------------------------------------------------

/** Advance until the player must decide (w.pending) or the war is over (w.cursor.at === 'done'). */
export function run(w: War): War {
  for (let guard = 0; guard < 10000 && !w.pending && w.cursor.at !== 'done'; guard++) step(w);
  return w;
}

function step(w: War): void {
  const c = w.cursor;
  const st = stageOf(w);
  switch (c.at) {
    case 'train': {
      learn(w, 'trench', 0.5); // training, after the hometown skills are chosen
      w.cursor = { at: 'stage' };
      return;
    }
    case 'stage': {
      w.promotedThisStage = false; w.blightyThisStage = false; w.courseThisStage = false; w.out = 0; w.r = 0;
      w.clockInStage = 0; // the date reads the stage's first month until its first rotation
      w.cursor = { at: 'path' };
      if (st.n === 2 && w.town === 'pit' && home(w, 'dig') && !w.transferred) w.pending = { kind: 'tunnel' };
      return;
    }
    case 'path': {
      w.path = pathFor(w);
      w.cursor = { at: 'rotation' };
      return;
    }
    case 'rotation': {
      w.clock += 1; w.clockInStage = w.r + 1;
      const b = st.battles[w.r];
      if (b && w.out === 0) {
        w.stats.battles++; w.battleNow = true;
        say(w, `battle: ${b.name} as ${w.path}`);
        w.cursor = { at: 'battle', i: 0, pts: 0 };
        askPhase(w, b, 0);
        return;
      }
      if (b) w.stats.missedBattles++;
      rotationStart(w, st);
      return;
    }
    case 'duty': nextDuty(w, c); return;
    case 'mission': {
      if (isRole(w) && w.out === 0 && !w.ending) {
        const m = ROLES[w.path]!;
        if (ch(w, 'duty', m.chance)) { w.pending = { kind: 'mission', role: w.path }; return; }
      }
      if (w.ending) { w.cursor = { at: 'tally' }; return; }
      w.cursor = { at: 'support', sectionP: c.sectionP, cover: c.cover };
      return;
    }
    case 'support': {
      if (w.out === 0 && ch(w, 'fire', st.fire * 0.25 * trenchMod(w))) hit(w, 'shelled in support');
      if (w.ending) { w.cursor = { at: 'tally' }; return; }
      friendLosses(w, c.sectionP * c.cover, 'in the line');
      if (w.out >= SEVERE_OUT) { w.cursor = { at: 'tally' }; return; }
      rest(w);
      w.cursor = { at: 'course' };
      if (w.nerve < 35) w.pending = { kind: 'sick' };
      return;
    }
    case 'course': {
      if (!w.courseThisStage && !w.transferred && w.standing >= 45 && ch(w, 'career', 0.22 + 0.1 * home(w, 'lit'))) {
        const k = w.rank >= 1 && skill(w, 'lead') < 2 ? 'lead' : ch(w, 'career', 0.5) ? TOWN_COURSE[w.town] : pick(w.rng, 'career', SPECIALIST);
        w.cursor = { at: 'tally' }; // afterCourse() runs when the decision is made
        w.pending = { kind: 'course', skill: k };
        return;
      }
      afterCourse(w);
      return;
    }
    case 'battle': return; // waits on askPhase's pending
    case 'tally': {
      w.stats.rotations++;
      w.stats.minNerve = Math.min(w.stats.minNerve, w.nerve);
      if (w.nerve < 40) w.stats.lowNerve++;
      if (w.ending) { finishWar(w); w.cursor = { at: 'done' }; return; }
      w.r += 1;
      if (w.r < st.rotations) { w.cursor = { at: 'rotation' }; return; }
      w.stagesDone = st.n;
      if (st.n === STAGES.length) { end(w, 'armistice', 'alive on 11 November 1918'); w.cursor = { at: 'done' }; return; }
      w.clockInStage = st.rotations;
      w.nerve = clamp(w.nerve + REST.leave, -10, 100);
      const offers = postingOffers(w);
      const commission = commissionOffer(w);
      w.stats.offersAtLeave[w.stage] = offers.length;
      w.cursor = { at: 'leave' };
      w.pending = { kind: 'leave', offers, commission };
      return;
    }
    case 'leave': return;
    case 'done': return;
  }
}

function rotationStart(w: War, st: Stage): void {
  const sectionP = st.sectionLoss * sectionMod(w);
  if (w.out > 0) {
    w.out -= 1; rest(w);
    friendLosses(w, sectionP, 'in the line');
    w.cursor = { at: 'tally' };
    return;
  }
  const path = PATHS[w.path]!;
  if (ch(w, 'fire', st.fire * trenchMod(w) * (path.fire || 1))) hit(w, 'shellfire');
  if (w.ending) { w.cursor = { at: 'tally' }; return; }
  if (path.collapse && ch(w, 'fire', path.collapse * (1 - 0.12 * skill(w, 'tunnel')))) { end(w, 'killed', 'mine collapse or camouflet'); w.cursor = { at: 'tally' }; return; }
  spendNerve(w, st.nerve);
  learn(w, 'trench', 0.25);
  const keys = Object.keys(DUTIES);
  const offered = w.transferred ? [] : [pick(w.rng, 'duty', keys), pick(w.rng, 'duty', keys)];
  w.cursor = { at: 'duty', sectionP, offered, i: 0, cover: 1 };
}

function nextDuty(w: War, c: Extract<Cursor, { at: 'duty' }>): void {
  if (c.i >= c.offered.length || w.out > 0 || w.ending) {
    if (w.ending) { w.cursor = { at: 'tally' }; return; }
    w.cursor = { at: 'mission', sectionP: c.sectionP, cover: c.cover };
    return;
  }
  const key = c.offered[c.i]!;
  const friendAtRisk = ch(w, 'duty', 0.4) && aliveFriends(w) > 0;
  w.pending = { kind: 'duty', duty: key, friendAtRisk };
}

function afterCourse(w: War): void {
  if (w.rank < 3 && w.standing >= 55 + 10 * w.rank && ch(w, 'career', 0.1)) promote(w, 'standing');
  if (w.nerve <= 0) end(w, 'broken', 'nerve gone in the line');
  w.cursor = { at: 'tally' };
}

function askPhase(w: War, b: Battle, i: number): void {
  const [, , ptype] = b.phases[i]!;
  const stalled = (ptype === 'advance' || ptype === 'trench') && ch(w, 'battle', STALL);
  w.pending = { kind: 'battle', battle: b.name, phase: i, type: stalled ? 'stalled' : ptype, stalled };
}

function battleOf(w: War): Battle { return stageOf(w).battles[w.r]!; }

function finishBattle(w: War, pts: number): void {
  award(w, pts);
  if (w.rank < 3 && w.standing >= 45 + 10 * w.rank && ch(w, 'career', 0.35)) promote(w, `vacancy after ${battleOf(w).name}`);
  w.battleNow = false;
  if (w.out === 0) rest(w);
  w.cursor = { at: 'tally' };
}

// ---- risk: one derivation for what is shown under a choice and what is resolved -----------------

/** Chance of being hit on a duty, as resolved. */
export function dutyHit(w: War, key: string): number {
  const dd = DUTIES[key]!;
  let hp = dd.hit * trenchMod(w);
  if (dd.field && home(w, 'field')) hp *= 0.7;
  if (dd.dig && home(w, 'dig')) hp *= 0.7;
  if (key === 'raid') hp *= 1 - 0.05 * skill(w, 'bomb');
  if (key === 'patrol') hp *= 1 - 0.05 * skill(w, 'snipe');
  return hp;
}

/** Chance of being hit on a role mission, as resolved. */
export function missionHit(w: War, role: string): number {
  return ROLES[role]!.hit * trenchMod(w) * (1 - ROLE.hitPerSkill * skill(w, role));
}

/** Chance of being hit in a battle phase for a choice, as resolved (freezing aside). */
export function phaseHit(w: War, b: Battle, base: number, type: string, choice: BattleChoice): number {
  const path = PATHS[w.path]!;
  let hp = base * PHASE_HIT[type as keyof typeof PHASE_HIT][choice] * path.hit * trenchMod(w);
  if (b.defence && path.defence) hp *= path.defence;
  return hp;
}

// ---- decisions ----------------------------------------------------------------------------------

/** Apply the player's decision to the pending question, then run to the next one. */
export function decide(w: War, d: Decision): War {
  const p = w.pending;
  if (!p) throw new Error('the war is not waiting for a decision');
  w.pending = null;
  const st = stageOf(w);
  switch (p.kind) {
    case 'tunnel': {
      if (d === 'transfer') { w.transferred = true; w.war.tunnel = 2; say(w, 'transferred to a tunnelling company'); }
      break;
    }
    case 'duty': {
      const c = w.cursor as Extract<Cursor, { at: 'duty' }>;
      const key = p.duty; const dd = DUTIES[key]!;
      const vol = d === 'volunteer';
      const detailed = !vol && ch(w, 'duty', 0.2 + (w.standing < 30 ? 0.25 : 0));
      c.i += 1;
      if (!vol && !detailed) { w.standing = clamp(w.standing - (p.friendAtRisk ? 2 : 1), 0, 100); break; }
      if (vol) w.stats.volunteered++; else w.stats.detailed++;
      if (ch(w, 'duty', dutyHit(w, key))) hit(w, key);
      if (w.ending) { w.cursor = { at: 'tally' }; break; }
      spendNerve(w, dd.nerve);
      learn(w, dd.skill, 0.4);
      if (vol) {
        w.standing = clamp(w.standing + dd.standing, 0, 100);
        if (p.friendAtRisk) { c.cover *= 0.75; w.nerve = clamp(w.nerve + 2, 0, 100); }
        if (dd.award) award(w, dd.award * (1 + 0.5 * home(w, 'sport')) * float(w.rng, 'career', 0.3, 1.2));
      } else w.standing = clamp(w.standing + 0.5, 0, 100);
      break;
    }
    case 'mission': {
      const c = w.cursor as Extract<Cursor, { at: 'mission' }>;
      const m = ROLES[p.role]!; const k = p.role;
      w.cursor = { at: 'support', sectionP: c.sectionP, cover: c.cover };
      if (d !== 'go' && !ch(w, 'duty', ROLE.detail)) { w.standing = clamp(w.standing - 2, 0, 100); break; }
      w.stats.missions++;
      if (ch(w, 'duty', missionHit(w, k))) hit(w, m.mission);
      if (w.ending) { w.cursor = { at: 'tally' }; break; }
      if (w.out > 0) break;
      spendNerve(w, m.nerve);
      learn(w, k, 0.3);
      if (ch(w, 'duty', m.success + ROLE.successPerSkill * skill(w, k))) {
        w.stats.missionsWon++; w.merit += 1;
        w.standing = clamp(w.standing + 4, 0, 100);
        award(w, m.award * float(w.rng, 'career', 0.4, 1.4));
        if (w.merit >= ROLE.meritToPromote && ch(w, 'career', ROLE.promoteChance)) { w.merit = 0; promote(w, `${m.mission} went well`); }
      } else spendNerve(w, 3);
      break;
    }
    case 'sick': {
      if (d === 'report' && ch(w, 'career', 0.5)) {
        w.out = Math.max(w.out, 1); w.standing = clamp(w.standing - 4, 0, 100);
        say(w, 'reported sick: excused one tour');
      }
      break; // cursor already at 'course'
    }
    case 'course': {
      if (d === 'take') {
        w.courseThisStage = true; w.stats.courses++;
        w.out = Math.max(w.out, 1); learn(w, p.skill, 2); w.standing = clamp(w.standing + 2, 0, 100);
        say(w, `course: ${p.skill}`);
      }
      afterCourse(w);
      break;
    }
    case 'battle': {
      const c = w.cursor as Extract<Cursor, { at: 'battle' }>;
      const b = battleOf(w);
      const [base, ncost] = b.phases[c.i]!;
      let choice = d as BattleChoice;
      const freeze = w.nerve < 12 && ch(w, 'battle', 0.35);
      if (freeze) choice = 'ground';
      if (choice === 'ground' && !p.stalled && w.nerve < 25 && (freeze || ch(w, 'battle', 0.12))) {
        if (ch(w, 'battle', w.standing < 40 ? 0.5 : 0.2)) { end(w, 'courtMartial', `${b.name}: froze under fire, charged with cowardice`); w.cursor = { at: 'tally' }; break; }
        w.standing = clamp(w.standing - 15, 0, 100);
        say(w, 'froze; the sergeant covered for him');
      }
      const cm = CHOICES[choice];
      const path = PATHS[w.path]!;
      if (ch(w, 'battle', phaseHit(w, b, base, p.type, choice))) hit(w, b.name);
      if (w.ending) { w.cursor = { at: 'tally' }; break; }
      if (b.capture && ch(w, 'battle', b.capture * (choice === 'ground' ? 2 : 1))) { end(w, 'captured', `${b.name}: overrun`); w.cursor = { at: 'tally' }; break; }
      spendNerve(w, ncost);
      w.nerve = clamp(w.nerve + cm.nerve, -10, 100);
      w.standing = clamp(w.standing + (p.stalled && choice === 'ground' ? 0 : cm.standing), 0, 100);
      c.pts += cm.award * path.award * float(w.rng, 'battle', 0.5, 1.5);
      if (ch(w, 'battle', cm.lead * 0.5)) {
        learn(w, 'lead', 0.6); w.standing = clamp(w.standing + 3, 0, 100); c.pts += 1;
        if (w.rank < 2 && ch(w, 'career', 0.3)) promote(w, `took charge at ${b.name}`);
      }
      if (w.path === 'nco' || w.path === 'subaltern') learn(w, 'lead', 0.3);
      if (w.path in { bomb: 1, lewis: 1, snipe: 1, signals: 1 }) learn(w, w.path, 0.2);
      let fp = base * FRIEND_BATTLE * cm.friends * (withSection(w) ? path.section : 1) * sectionMod(w);
      if (choice === 'help' && home(w, 'firstaid')) fp *= 0.8;
      friendLosses(w, fp, b.name);
      if (w.out > 0) { finishBattle(w, c.pts); break; }
      if (w.nerve <= 0) { end(w, 'broken', `${b.name}: shell shock`); w.cursor = { at: 'tally' }; break; }
      c.i += 1;
      if (c.i < b.phases.length) { askPhase(w, b, c.i); return w; }
      finishBattle(w, c.pts);
      break;
    }
    case 'leave': {
      say(w, `leave after stage ${w.stage}: offers [${p.offers.join(', ')}]${p.commission ? ' + commission' : ''} -> ${d}`);
      if (d.startsWith('posting:') && p.offers.length) {
        const i = Number(d.slice(8));
        w.posting = p.offers[i] ?? p.offers[0]!;
        end(w, 'posting', w.posting);
        w.endedStage = st.n + 1; w.clockInStage = 0; finishWar(w); w.endedStage = st.n;
        w.cursor = { at: 'done' };
        return w;
      }
      if (d === 'commission' && p.commission) { w.commissioned = true; w.rank = SUBALTERN; }
      else if (w.rank < TOP_OR && !w.commissioned) promote(w, 'returned to the front');
      else w.standing = clamp(w.standing + 10, 0, 100);
      w.stage += 1;
      w.cursor = { at: 'stage' };
      break;
    }
  }
  return run(w);
}

// ---- the grade ----------------------------------------------------------------------------------

export function grade(w: War): number {
  if (!w.ending) return 0;
  let rec = GRADE.stages[w.stagesDone]! + GRADE.perRank * Math.min(w.rank, TOP_OR);
  if (w.commissioned) rec += GRADE.subalternBonus;
  for (const a of w.awards) rec += GRADE.award[a] || 0;
  rec += GRADE.perFriend * aliveFriends(w) + GRADE.nervePer10 * Math.max(0, w.nerve) / 10;
  return rec * GRADE.mult[w.ending];
}

export const done = (w: War) => w.cursor.at === 'done';
