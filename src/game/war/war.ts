// The war layer: one soldier's war, as a step machine that stops at every decision the player
// makes. A port of prototypes/killgate/model.js (round 2), rule for rule and draw for draw:
// `run()` does what the prototype's play() did between two policy calls, and `decide()` applies
// the choice the prototype asked its policy for. tests/war-equivalence.test.ts plays both on the
// same seeds and requires identical end states, so KILLGATE.md's numbers are this game's numbers.
//
// Pure: plain JSON state, no DOM, no clock, no Math.random. Callers clone before calling (the
// engine's choose() already has).

import { chance, float, pick, raw, seedStreams, hashString, type Streams, type StreamName } from './rng';
import {
  TOWNS, DEFAULT_GENERAL, WAR_SKILLS, SPECIALIST, APTITUDE, TOWN_COURSE, WAR_WORK, STAGES, DUTIES, WOUND, PATHS,
  CHOICES, GRADE, SECTION_SIZE, SUBALTERN, TOP_OR, RANKS, REST, FRIEND_BATTLE, PHASE_HIT, STALL, ROLES, ROLE, PAY,
  PROMO, SERGEANT, CSM, LIEUTENANT, CAPTAIN, ASSIGN, ASSIGNMENTS, CORPS, CORPS_BATTLES, AIR_RANKS, CLOSE, SERVANT, type CloseChoice, type Corps,
  COMMISSION_BOARD, SORTIES, SORTIE_CHOICE, type SortieChoice, type Town, type Ending, type BattleChoice, type Battle, type Stage, DECKS } from './data';

// ---- state -------------------------------------------------------------------------------

/** What the war is waiting for the player to decide. */
export type Pending =
  | { kind: 'tunnel' }
  /** the start of a tour in the line: a story stop, no decision (the tour's passage, the year page, an event) */
  | { kind: 'tour' }
  /** his platoon officer wants a soldier-servant: the first officer, or the next after the first is killed */
  | { kind: 'servant'; officer: 1 | 2 }
  /** a German in front of him, before a battle phase or in a raid (FRAME-PLAYTEST2 A) */
  | { kind: 'close'; where: 'battle' | 'sortie'; battle?: string; phase?: number; key?: string }
  /** nco: he is an NCO with his section, so he picks who goes (FRAME-PLAYTEST2 B) */
  | { kind: 'duty'; duty: string; friendAtRisk: boolean; nco?: boolean }
  | { kind: 'mission'; role: string }
  | { kind: 'sick' }
  | { kind: 'course'; skill: string }
  /** the offer of the tanks or the Flying Corps (CORPS): 'transfer' or 'stay' */
  | { kind: 'corps'; corps: 'tank' | 'air' }
  /** a special assignment: a job he is detailed for that is not fighting (ASSIGNMENTS) */
  | { kind: 'assign'; key: string }
  | { kind: 'battle'; battle: string; phase: number; type: string; stalled: boolean }
  | { kind: 'leave'; offers: string[]; commission: boolean }
  /** a step of a duty or role mission being played out (SORTIES) */
  | { kind: 'step'; key: string; role: boolean; step: number; of: number; vol: boolean; canBack: boolean; card?: string };

export type Decision =
  | 'transfer' | 'stay'                 // tunnel, corps
  | 'volunteer' | 'stay_back'           // duty
  | 'send_friend' | 'send_draft'        // duty, as an NCO: a man from home or a new man goes
  | CloseChoice                         // a man in front of him
  | 'go' | 'decline'                    // mission, course
  | 'report' | 'carry_on'               // sick
  | 'take'                              // course, assignment ('decline' gets out of it)
  | BattleChoice                        // battle
  | 'back' | 'commission' | `posting:${number}` // leave
  | SortieChoice // a sortie step ('back' turns back)
  | 'on'; // past a story stop

/** Where the machine is. Saved, so a war resumes mid-rotation. */
type Cursor =
  | { at: 'train' }
  | { at: 'stage' }
  | { at: 'path' }
  | { at: 'rotation' }
  | { at: 'tour' }
  | { at: 'duty'; sectionP: number; offered: string[]; i: number; cover: number }
  | { at: 'mission'; sectionP: number; cover: number }
  | { at: 'support'; sectionP: number; cover: number }
  | { at: 'course' }
  | { at: 'battle'; i: number; pts: number }
  | { at: 'tally' }
  | { at: 'leave' }
  | { at: 'sortie'; key: string; role: boolean; i: number; pts: number; vol: boolean; friendAtRisk: boolean; ret: Cursor }
  | { at: 'done' };

export interface WarStats {
  minNerve: number; lowNerve: number; rotations: number; volunteered: number; detailed: number; courses: number;
  battles: number; missedBattles: number; offersAtLeave: Record<number, number>; friendsLostWithYou: number;
  missions: number; missionsWon: number;
  /** duties and missions played out, and how many went well (absent in saves before sorties) */
  sorties?: number; sortiesOk?: number;
  /** men he knows he killed, and prisoners he took (the close moments; a sniper's mission that went well) */
  killed?: number; prisoners?: number;
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
  /** what happened that the player has not yet been shown as a scene: a wound, friends killed.
   *  Recorded only; nothing in the war reads it, so the war's numbers do not depend on it. */
  news: { wound: { kind: 'light' | 'severe'; cause: string } | null; fallen: { i: number; why: string; present: boolean }[]; sortie?: { key: string; ok: boolean; vol: boolean; turned: boolean; margin?: number } | null;
    /** nerve won back at rest and on leave since the last question: the screen shows it apart from what
     *  the choice cost (playtest 2: "Nerve +7" after a raid read as if the raid had steadied him) */
    restored?: { rest: number; leave: number };
    /** the man he sent on a duty as an NCO, and whether he came back */
    sent?: { key: string; who: number; killed: boolean } | null;
    /** the last battle, fought or missed, for the overview screen after it (playtest 2: "some of the
     *  battles ended without me realizing"; a course had taken him away on 1 July without a word) */
    battle?: BattleNews | null;
    /** the roll just made came near: a close call to show under the choice (FRAME-PLAYTEST2 D) */
    close?: { kind: 'step' | 'battle'; key: string; n: number } | null;
    /** his name read out in battalion orders after the sortie just ended */
    named?: boolean;
    /** the officer he served was killed: which (1, 2) */
    officer?: number | null };
  stats: WarStats;
  /** which corps he transferred to, if any (absent in saves before the tanks: a transferred man
   *  there is a tunneller; read with corpsOf); training tours left; air missions that went well */
  corps?: Corps; corpsTraining?: number; corpsOk?: number;
  /** the officer he is servant to (1 the first, 2 the next; 0 or absent: none), the offer waiting, and
   *  whether the first offer has been made (docs/FRAME-SERVANT.md) */
  servant?: number; servantOffer?: number; servantAsked?: boolean;
  /** cards of each sortie step's deck already shown since the deck was last reshuffled, by `key:step`
   *  (absent in saves before decks) */
  decks?: Record<string, string[]>;
  /** the chance of the last hit he took from a choice, and of the safest choice then (the death page) */
  lastHit?: { p: number; safest: number };
  /** why he is out of the line, for the missed-battle overview */
  outWhy?: 'course' | 'wound';
  /** pence sent home so far (absent in saves before pay was sent home: read with sentHomeOf) */
  sentHome?: number;
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
    ending: null, endedStage: 0, stagesDone: 0, posting: null, endWhy: '', news: { wound: null, fallen: [] },
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
/** The same draw as ch, also saying when it came near: within `band` above the chance (playtest 2:
 *  "the risk warnings never feel real"). The odds are untouched; only what is shown changes. */
const CLOSE_BAND = { step: 0.08, battle: 0.12 } as const;
let rolled: { p: number; safest: number } | null = null; // the odds of the hit riskRoll just made, for hit()
function riskRoll(w: War, l: StreamName, p: number, kind: 'step' | 'battle', key: string, safest = p): boolean {
  const r = raw(w.rng, l);
  // the odds of the hit, kept for the death page (2026-11-21, the author: every choice at a pillbox
  // killed him on reload, because the save holds the dice; the page now says so)
  if (r < p) { rolled = { p, safest: Math.min(p, safest) }; return true; }
  if (r < p + CLOSE_BAND[kind]) newsOf(w).close = { kind, key, n: Math.floor((r - p) * 1000) };
  return false;
}
const stageOf = (w: War): Stage => STAGES[w.stage - 1]!;
export interface BattleNews { name: string; fought: boolean; why: 'course' | 'wound' | null; lost: number[]; hit: 'light' | 'severe' | null; award: string | null; promoted: boolean; near: boolean; done: boolean; rank: number }
export const isRole = (w: War) => w.path in ROLES;
/** An NCO with his section picks who goes on a duty; a private waits to be picked (FRAME-PLAYTEST2 B). */
export const ncoDuty = (w: War) => w.rank >= 1 && !w.commissioned && !w.transferred;
/** A sergeant or an officer with his men may take them across himself: the fourth order in battle. */
// not a signaller, a sniper or a stretcher-bearer: their sergeants do their own work, not a rifle
// section's (playtest 3: a signalling sergeant was offered "get the section moving")
export const canLead = (w: War) => (w.rank >= SERGEANT || w.commissioned) && !w.transferred && !['air', 'signals', 'snipe', 'bearer'].includes(w.path);
/** His corps, if he has left the battalion: a save from before the tanks had only tunnellers. */
export const corpsOf = (w: War): Corps | null => w.corps ?? (w.transferred ? 'tunnel' : null);
/** Who is offered the tanks (FRAME-TANK.md): any town, machinery from home or the Lewis gun at 2;
 *  still in the battalion, not an officer, sergeant or below. One function: the offer and the bot. */
export const tankEligible = (w: War) => !w.transferred && !w.commissioned && w.rank <= SERGEANT && (!!home(w, 'mech') || skill(w, 'lewis') >= 2);
/** Who is offered the Flying Corps (FRAME-AIR.md): a Lewis gunner at 2, in the line that tour. */
export const airEligible = (w: War) => !w.transferred && !w.commissioned && w.rank <= SERGEANT && w.out === 0 && skill(w, 'lewis') >= 2;
/** His rank in his own corps' words: an air gunner's is the Flying Corps'. */
export const rankName = (w: War) => (corpsOf(w) === 'air' && AIR_RANKS[w.rank] ? AIR_RANKS[w.rank]! : RANKS[w.rank]!);
/** The same, with the army's rank beside it where the words differ (FRAME-AIR.md). */
export const rankFull = (w: War) => (rankName(w) === RANKS[w.rank] ? RANKS[w.rank]! : `${rankName(w)} (army: ${RANKS[w.rank]!.toLowerCase()})`);
/** The battle this rotation, if any: the battalion's, or one his corps alone fights (Cambrai). */
export function battleAt(w: War, st: Stage, r: number): Battle | undefined {
  const c = corpsOf(w);
  return st.battles[r] ?? (c ? CORPS_BATTLES[c]?.[st.n]?.[r] : undefined);
}

/** The news record, created for a save made before it existed (2026-11-09). */
/** Pence he sends home this tour: a share of a month's pay by rank and role. Draws nothing. */
export function payHome(w: War): number {
  const c = corpsOf(w);
  const daily = (c === 'tunnel' ? PAY.tunnelPence : PAY.rankPence[w.rank]! + (c ? CORPS[c].payPence : ROLES[w.path] ? PAY.rolePence : 0)) + (w.servant ? SERVANT.payPence : 0);
  return Math.round(daily * PAY.daysPerTour * (w.commissioned ? PAY.officerAllot : PAY.allot));
}
export const sentHomeOf = (w: War) => w.sentHome ?? 0;

/** Company sergeant major: one to a company, so only by a vacancy, for a sergeant rated highly. */
function csmVacancy(w: War, chance: number, why: string): void {
  if (w.commissioned || w.rank !== SERGEANT || w.standing < PROMO.csmStanding || !ch(w, 'career', chance)) return;
  w.rank = CSM; w.promotedThisStage = true;
  say(w, `promoted to ${RANKS[w.rank]} (${why})`);
}

/** An officer rises by vacancies after battles: lieutenant, then acting captain. */
function officerVacancy(w: War, battle: string): void {
  if (w.rank === SUBALTERN && w.standing >= PROMO.ltStanding && ch(w, 'career', PROMO.ltChance)) w.rank = LIEUTENANT;
  else if (w.rank === LIEUTENANT && w.standing >= PROMO.captStanding && ch(w, 'career', PROMO.captChance)) w.rank = CAPTAIN;
  else return;
  w.promotedThisStage = true;
  say(w, `promoted to ${RANKS[w.rank]} (vacancy after ${battle})`);
}
/** The family's circumstances at leave, 0 to 3, by what he has sent home. */
export const homeTier = (w: War) => PAY.tiers.filter((t) => sentHomeOf(w) >= t).length;
/** Pence as a period sum: £4 7s 6d. */
export function lsd(pence: number): string {
  const l = Math.floor(pence / 240), sh = Math.floor((pence % 240) / 12), d = pence % 12;
  return [l ? `£${l}` : '', sh ? `${sh}s` : '', d ? `${d}d` : ''].filter(Boolean).join(' ') || 'nothing';
}

export function newsOf(w: War): War['news'] {
  return (w.news ??= { wound: null, fallen: [] });
}

function end(w: War, kind: Ending, why: string): void {
  if (w.ending) return;
  w.ending = kind; w.endedStage = w.stage; w.endWhy = why;
  say(w, `ENDING ${kind}: ${why}`);
}

// The section fights on after he leaves it, by whatever road: "friends home" means who came
// home in 1918, not who was alive the day he left (KILLGATE round 1, fault 4).
// It used to set w.transferred, so every man whose war ended early read afterwards as a tunneller
// ("Alive. You are with the tunnellers now." on the Soldier tab; the death scene's corps): not now.
function finishWar(w: War): void {
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
/** What a battle phase's order costs in nerve, as resolved and as shown under the order (playtest 3:
 *  a man went into Passchendaele with 40 nerve, its phases took 13 a time, and nothing on the screen
 *  said so until "Your nerve went at Passchendaele"). Friends killed beside him cost more on top. */
export function phaseNerve(w: War, b: Battle, i: number, choice: BattleChoice): number {
  return b.phases[i]![1] * (PATHS[w.path]?.battleNerve ?? 1) * nerveMod(w) - CHOICES[choice].nerve;
}

function hit(w: War, cause: string): void {
  // a hit from a choice keeps its odds; any other (shellfire, a close moment) clears them
  if (rolled) w.lastHit = rolled; else delete w.lastHit;
  rolled = null;
  const r = raw(w.rng, 'fire');
  const path = PATHS[w.path];
  const killed = path?.killed ?? WOUND.killed, captured = path?.captured ?? 0;
  if (r < killed) { w.inBattle = w.battleNow; return end(w, 'killed', cause); }
  // shot down only when he is flying: a shell on the aerodrome is a shell
  if (cause !== 'shelled in support' && r < killed + captured) return end(w, 'captured', `${cause}: shot down`);
  if (r < killed + captured + WOUND.severe) {
    w.severe += 1;
    if (ch(w, 'fire', WOUND.downgrade) || w.severe >= 3) return end(w, 'invalided', `${cause}, severe wound, downgraded`);
    w.out = SEVERE_OUT; w.outWhy = 'wound'; w.blightyThisStage = true;
    w.nerve = clamp(w.nerve + 10, 0, 100);
    newsOf(w).wound = { kind: 'severe', cause };
    return say(w, `severe wound (${cause}): hospital in England, out ${SEVERE_OUT} rotations`);
  }
  w.out = home(w, 'stamina') ? 1 : 2; w.outWhy = 'wound';
  spendNerve(w, 4);
  newsOf(w).wound = { kind: 'light', cause };
  say(w, `light wound (${cause}): out ${w.out} rotation(s)`);
}

function friendLosses(w: War, p: number, why: string): void {
  const present = withSection(w);
  for (let i = 0; i < w.friends.length; i++) {
    if (!w.friends[i]) continue;
    if (ch(w, 'section', p)) {
      w.friends[i] = false;
      newsOf(w).fallen.push({ i, why, present });
      const bn = newsOf(w).battle; if (bn && !bn.done && bn.name === why) bn.lost.push(i);
      spendNerve(w, present ? 7 : 3);
      if (present) w.stats.friendsLostWithYou++;
      say(w, `friend ${i + 1} killed (${why})`);
    }
  }
}

function sectionMod(w: War): number {
  if (!withSection(w)) return 1;
  let m = (home(w, 'firstaid') ? 0.85 : 1) * (w.servant ? SERVANT.section : 1);
  if (w.path === 'nco' || w.path === 'subaltern') m *= 1 - 0.05 * skill(w, 'lead');
  return m;
}

/** A stripe: earned or at leave, it stops at sergeant (PROMO). Officers rise by officerVacancy. */
function promote(w: War, why: string): void {
  if (w.commissioned || w.rank >= SERGEANT) return;
  w.rank += 1; w.promotedThisStage = true;
  say(w, `promoted to ${RANKS[w.rank]} (${why})`);
  if (w.servant) { w.servant = 0; w.servantOffer = 0; say(w, 'a stripe: no longer a servant'); }
}

function award(w: War, pts: number): void {
  if (pts <= 0 || !ch(w, 'career', Math.min(0.6, pts / 22))) return;
  let a = 'MiD';
  if (pts >= 14 && ch(w, 'career', 0.06)) a = 'VC';
  else if (pts >= 9 && ch(w, 'career', 0.3)) a = 'DCM';
  else if (w.stage >= 2) a = w.commissioned ? 'MC' : corpsOf(w) === 'air' && w.stage === 4 && w.r >= 5 ? 'DFM' : 'MM'; // the DFM from June 1918
  w.awards.push(a);
  w.standing = clamp(w.standing + 8, 0, 100);
  w.nerve = clamp(w.nerve + 4, 0, 100);
  say(w, `awarded ${a}`);
}

function rest(w: War): void {
  const present = withSection(w) ? aliveFriends(w) : w.transferred && w.out === 0 ? CORPS[corpsOf(w)!].crew : 0;
  const pay = (isRole(w) ? ROLE.restBonus : 0) + (corpsOf(w) === 'air' ? CORPS.air.restBonus : 0) + (w.servant ? SERVANT.rest : 0);
  const before = w.nerve;
  w.nerve = clamp(w.nerve + REST.base + REST.voice * home(w, 'voice') + REST.perFriend * present + pay, -10, 100);
  const r = (newsOf(w).restored ??= { rest: 0, leave: 0 }); r.rest += w.nerve - before;
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
  if (corpsOf(w) === 'air' && w.stage === 3 && ch(w, 'leave', CORPS.air.homeOffer)) out.push('home establishment (air)');
  return out;
}

/** The leadership a commission board accepts without reading or a medal: 3, so the NCO course (2)
 *  and some leading in battle reach it (FRAME-PLAYTEST2 B; it was 3.5, out of reach for most). */
export const COMMISSION_LEAD = 3;
export function commissionOffer(w: War): boolean {
  // not for a tank or air man: a commission would put him back in the infantry as a subaltern
  // (an air run ended as a lieutenant flying with the squadron, 2026-11-14)
  return w.stage === 3 && !w.commissioned && (corpsOf(w) ?? 'tunnel') === 'tunnel' && w.rank >= 3 && w.standing >= 70
    && (!!home(w, 'lit') || w.awards.some((a) => a !== 'MiD') || skill(w, 'lead') >= COMMISSION_LEAD)
    && ch(w, 'leave', COMMISSION_BOARD);
}

function pathFor(w: War): string {
  if (w.commissioned) return 'subaltern';
  if (w.transferred) return corpsOf(w)!;
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
      if (st.n === CORPS.tank.stage && (tankEligible(w) || (!w.transferred && !w.commissioned && w.rank <= SERGEANT && closeRoll(w) < CORPS.tank.call))) w.pending = { kind: 'corps', corps: 'tank' };
      return;
    }
    case 'path': {
      w.path = pathFor(w);
      w.cursor = { at: 'rotation' };
      return;
    }
    case 'rotation': {
      w.clock += 1; w.clockInStage = w.r + 1;
      w.sentHome = sentHomeOf(w) + payHome(w);
      const b = battleAt(w, st, w.r);
      if (b && w.out === 0) {
        w.stats.battles++; w.battleNow = true;
        newsOf(w).battle = { name: b.name, fought: true, why: null, lost: [], hit: null, award: null, promoted: false, near: false, done: false, rank: w.rank };
        say(w, `battle: ${b.name} as ${w.path}`);
        w.cursor = { at: 'battle', i: 0, pts: 0 };
        askPhase(w, b, 0);
        return;
      }
      if (b) {
        // the battalion goes over without him: his section fights it all the same (a missed battle
        // used to cost the section only a quiet tour's losses), and he hears of it after
        w.stats.missedBattles++;
        const nb: BattleNews = { name: b.name, fought: false, why: w.outWhy ?? 'wound', lost: [], hit: null, award: null, promoted: false, near: false, done: false, rank: w.rank };
        newsOf(w).battle = nb;
        if (!w.transferred) friendLosses(w, 1 - b.phases.reduce((a, [base]) => a * (1 - base * FRIEND_BATTLE), 1), b.name);
        nb.done = true;
        say(w, `missed: ${b.name} (${nb.why})`);
        if (stageOf(w).battles[w.r]) officerFate(w);
      }
      // a story stop at the start of every tour he is in the line for (the author, 2026-11-09:
      // "follow a story more"); it draws nothing, so it changes no numbers
      // the servant's offers: his platoon officer's on the second tour of 1915; the next officer's after
      // the first is killed (docs/FRAME-SERVANT.md)
      if (w.out === 0 && !w.transferred && !w.commissioned && w.rank === 0) {
        if (st.n === 1 && w.r === 1 && !w.servantAsked && !isRole(w)) { w.servantAsked = true; w.cursor = { at: 'tour' }; w.pending = { kind: 'servant', officer: 1 }; return; }
        if (w.servantOffer === 2) { w.cursor = { at: 'tour' }; w.pending = { kind: 'servant', officer: 2 }; return; }
      }
      if (w.out === 0 && st.n === CORPS.air.stage && w.r === CORPS.air.atRotation && airEligible(w)) { w.cursor = { at: 'tour' }; w.pending = { kind: 'corps', corps: 'air' }; return; }
      if (w.out === 0) { w.cursor = { at: 'tour' }; w.pending = { kind: 'tour' }; return; }
      rotationStart(w, st);
      return;
    }
    case 'tour': rotationStart(w, st); return;
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
      if (w.out === 0 && ch(w, 'fire', st.fire * 0.25 * trenchMod(w) * (PATHS[w.path]!.fire || 1))) hit(w, 'shelled in support');
      if (w.ending) { w.cursor = { at: 'tally' }; return; }
      friendLosses(w, c.sectionP * c.cover, 'in the line');
      if (w.out >= SEVERE_OUT) { w.cursor = { at: 'tally' }; return; }
      rest(w);
      w.cursor = { at: 'course' };
      if (w.nerve < 35) w.pending = { kind: 'sick' };
      return;
    }
    case 'course': {
      // never on the tour before a battle: the course takes him away for a tour, and in playtest 2 it
      // took him away on the first of July without a word
      if (!w.courseThisStage && !w.transferred && w.standing >= 45 && !battleAt(w, st, w.r + 1) && ch(w, 'career', 0.22 + 0.1 * home(w, 'lit'))) {
        // a man with first aid from home is twice as likely to be sent on the stretcher-bearers' course
        const k = w.rank >= 1 && skill(w, 'lead') < 2 ? 'lead' : ch(w, 'career', 0.5) ? TOWN_COURSE[w.town] : pick(w.rng, 'career', home(w, 'firstaid') ? [...SPECIALIST, 'bearer'] : SPECIALIST);
        w.cursor = { at: 'tally' }; // afterCourse() runs when the decision is made
        w.pending = { kind: 'course', skill: k };
        return;
      }
      const a = assignmentFor(w);
      if (a) { w.cursor = { at: 'tally' }; w.pending = { kind: 'assign', key: a }; return; }
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
      const beforeLeave = w.nerve;
      w.nerve = clamp(w.nerve + REST.leave, -10, 100);
      (newsOf(w).restored ??= { rest: 0, leave: 0 }).leave += w.nerve - beforeLeave;
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
  if ((w.corpsTraining ?? 0) > 0) { // the tank man's first tours, training at Wool and Bermicourt; the air gunner's joining tour
    w.corpsTraining! -= 1; rest(w);
    friendLosses(w, sectionP, 'in the line');
    w.cursor = { at: 'tally' };
    return;
  }
  const path = PATHS[w.path]!;
  if (ch(w, 'fire', st.fire * trenchMod(w) * (path.fire || 1))) hit(w, w.path === 'air' ? 'anti-aircraft fire' : w.path === 'tank' ? 'shelled in the tank park' : 'shellfire');
  if (w.ending) { w.cursor = { at: 'tally' }; return; }
  if (path.collapse && ch(w, 'fire', path.collapse * (1 - 0.12 * skill(w, 'tunnel')))) { end(w, 'killed', 'mine collapse or camouflet'); w.cursor = { at: 'tally' }; return; }
  spendNerve(w, st.nerve * (path.lineNerve ?? 1));
  learn(w, 'trench', 0.25);
  const keys = Object.keys(DUTIES);
  // one duty, on some tours: two every tour made the war a list of missions (the author,
  // 2026-11-09: story and generic missions 50/50 for a man who volunteers half the time)
  // a servant is excused most fatigues (docs/FRAME-SERVANT.md)
  const offered = w.transferred || !ch(w, 'duty', ROLE.dutyChance * (w.servant ? SERVANT.dutyChance : 1)) ? [] : [pick(w.rng, 'duty', keys)];
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
  w.pending = { kind: 'duty', duty: key, friendAtRisk, nco: ncoDuty(w) };
}

/** A special assignment this tour, if one comes (ASSIGNMENTS): which jobs he can be given, by weight. */
function assignmentFor(w: War): string | null {
  if (w.transferred || w.out > 0 || w.ending || !ch(w, 'career', ASSIGN.chance)) return null;
  const best = Math.max(...SPECIALIST.map((k) => skill(w, k)), skill(w, 'lead'));
  const open = Object.entries(ASSIGNMENTS).filter(([k, a]) => w.stage >= a.from
    && (k !== 'burial' && k !== 'escort' || w.stats.battles > 0)
    && (k !== 'instructor' || (w.rank >= 2 && best >= 2.5))
    && (k !== 'concert' || !!home(w, 'voice')));
  if (!open.length) return null;
  let r = float(w.rng, 'career', 0, 1) * open.reduce((t, [, a]) => t + a.weight, 0);
  for (const [k, a] of open) { r -= a.weight; if (r <= 0) return k; }
  return open[open.length - 1]![0];
}

const ASSIGN_WHERE: Record<string, string> = { escort: 'escorting prisoners', guide: 'guiding the relief' };

function afterCourse(w: War): void {
  if (w.rank < 3 && w.standing >= 55 + 10 * w.rank && ch(w, 'career', 0.1)) promote(w, 'standing');
  if (w.nerve <= 0) end(w, 'broken', 'nerve gone in the line');
  w.cursor = { at: 'tally' };
}

/** A draw on the close-moment stream, seeded for a save made before it existed. */
function closeRoll(w: War): number {
  if (w.rng.close === undefined) w.rng.close = (hashString(`${w.seed}|close`) >>> 0) || 1;
  return raw(w.rng, 'close');
}
/** A man in front of him, in the advance or the enemy trench he has just been ordered into: after
 *  the phase's order, not before it (playtest 3: at Loos he met the German in the gas before the
 *  scene where the gas goes over). */
function closeAfter(w: War, b: Battle, i: number): boolean {
  const ptype = b.phases[i]![2];
  if (!((ptype === 'advance' || ptype === 'trench') && w.path !== 'tank' && w.path !== 'air' && w.path !== 'bearer')) return false;
  if (closeRoll(w) >= CLOSE.battleChance) return false;
  w.pending = { kind: 'close', where: 'battle', battle: b.name, phase: i };
  return true;
}
function askPhase(w: War, b: Battle, i: number): void {
  const [, , ptype] = b.phases[i]!;
  if (w.path === 'air') { w.pending = { kind: 'battle', battle: b.name, phase: i, type: 'air', stalled: false }; return; }
  const stalled = (ptype === 'advance' || ptype === 'trench') && ch(w, 'battle', STALL);
  w.pending = { kind: 'battle', battle: b.name, phase: i, type: stalled ? 'stalled' : ptype, stalled };
}

function battleOf(w: War): Battle { return battleAt(w, stageOf(w), w.r)!; }

/** The officer he serves after a battle: the first is killed at Loos (the farm's story: Mr Venn read
 *  out with the dead), a later one one time in four; then he is back with the section, and after the
 *  first he is offered the next officer. Drawn on the close stream: no other draw moves. */
function officerFate(w: War): void {
  if (!w.servant) return;
  if (w.servant === 1 || closeRoll(w) < SERVANT.officerKilled) {
    newsOf(w).officer = w.servant;
    say(w, `officer ${w.servant} killed`);
    w.servantOffer = w.servant === 1 ? 2 : 0;
    w.servant = 0;
  }
}
function finishBattle(w: War, pts: number): void {
  const n = w.awards.length;
  award(w, pts);
  const bn = newsOf(w).battle;
  if (bn && !bn.done) { bn.award = w.awards.length > n ? w.awards[w.awards.length - 1]! : null; bn.near = !bn.award && pts >= 5; }
  if (w.rank < 3 && w.standing >= 45 + 10 * w.rank && ch(w, 'career', 0.35)) promote(w, `vacancy after ${battleOf(w).name}`);
  else if (w.rank === SERGEANT) csmVacancy(w, PROMO.csmAfterBattle, `vacancy after ${battleOf(w).name}`);
  else if (w.commissioned) officerVacancy(w, battleOf(w).name);
  w.battleNow = false;
  if (w.out === 0) rest(w);
  w.cursor = { at: 'tally' };
  if (bn && !bn.done) { bn.promoted = w.rank > bn.rank; bn.done = true; }
  officerFate(w);
}

/** The chance the medical officer excuses him a tour when he reports sick: by his standing. */
export const sickChance = (w: War) => clamp(0.2 + w.standing / 200, 0.2, 0.7);

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
  // the role's own skill: the tank and air gunner's is the Lewis gun (SORTIES); there is no 'air' skill,
  // and reading one gave NaN, so no flying mission could ever hit him (found by the trade table, 2026-11-14)
  return ROLES[role]!.hit * trenchMod(w) * (1 - ROLE.hitPerSkill * skill(w, SORTIES[role]?.skill ?? role));
}

/** Chance of being hit in a battle phase for a choice, as resolved (freezing aside). */
export function phaseHit(w: War, b: Battle, base: number, type: string, choice: BattleChoice): number {
  const path = PATHS[w.path]!;
  // a servant goes where his officer goes: going to ground is no shelter when the officer goes on
  // (without this, careful play matched best play on the gate: docs/FRAME-SERVANT.md)
  const row = PHASE_HIT[type as keyof typeof PHASE_HIT];
  const mult = w.servant && choice === 'ground' ? Math.max(row.ground, row.help) : row[choice];
  let hp = base * mult * path.hit * trenchMod(w) * (w.servant ? SERVANT.hit : 1);
  if (b.defence && path.defence) hp *= path.defence;
  return hp;
}

// ---- sorties: a duty or a role mission played out in three steps ---------------------------------

/** Chance of being hit on one step of a sortie for a choice, as resolved: the duty's (or mission's)
 *  whole-sortie chance times the step's share times the choice. The risk words read this. */
export function sortieHit(w: War, key: string, role: boolean, step: number, choice: SortieChoice): number {
  const base = role ? missionHit(w, key) : dutyHit(w, key);
  // x1.08: three smaller rolls add up to slightly less than one big one; this keeps a steady sortie
  // as dangerous as the single roll it replaced
  return base * SORTIES[key]!.shares[step]! * SORTIE_CHOICE[choice].hit * 1.08;
}

function startSortie(w: War, key: string, role: boolean, vol: boolean, friendAtRisk: boolean, ret: Cursor): void {
  w.cursor = { at: 'sortie', key, role, i: 0, pts: 0, vol, friendAtRisk, ret };
  askStep(w);
}

function askStep(w: War, noClose = false): void {
  const c = w.cursor as Extract<Cursor, { at: 'sortie' }>;
  const so = SORTIES[c.key]!;
  // the middle of a raid he chose to go on: a man in front of him (not when it is played unseen)
  if (!noClose && c.vol && c.i === 1 && (c.key === 'raid' || c.key === 'bomb') && closeRoll(w) < CLOSE.raidChance) {
    w.pending = { kind: 'close', where: 'sortie', key: c.key };
    return;
  }
  w.pending = { kind: 'step', key: c.key, role: c.role, step: c.i, of: so.shares.length, vol: c.vol, canBack: so.back[c.i]!, card: drawCard(w, c.key, c.i) };
}

/** The middle way on reloading (the author, 2026-11-23: "Let's go with the middle way"). A save made
 *  at the opening of a battle, before his first order, gets new luck when it is loaded: the battle,
 *  the wound and the close-moment dice are drawn afresh. Any later save keeps its dice, so one choice
 *  cannot be retried; the whole battle can. Two reloads before Passchendaele and Arras had found
 *  every choice lost (the save held the rolls). Returns whether it re-rolled. */
export function rerollOpeningBattle(w: War, salt: number): boolean {
  const p = w.pending; const c = w.cursor;
  if (w.ending || p?.kind !== 'battle' || p.phase !== 0 || c.at !== 'battle' || c.i !== 0) return false;
  for (const l of ['battle', 'fire', 'close'] as const) w.rng[l] = (hashString(`${w.seed}|reroll|${salt}|${l}`) >>> 0) || 1;
  say(w, `${p.battle}: new luck on loading a save made at its opening`);
  return true;
}

/** The written situation for a step (docs/FRAME-DECKS.md): one of the deck's cards for this year that
 *  has not been shown since the deck was reshuffled, never the one just shown. A hash of the seed and
 *  the count shown picks it, so no random stream is drawn and no number in the war moves. */
export function drawCard(w: War, key: string, step: number): string {
  const deck = DECKS[key]?.[step] ?? [];
  const live = deck.filter((cd) => (cd.from ?? 1) <= w.stage && w.stage <= (cd.to ?? 4)).map((cd) => cd.id);
  if (live.length <= 1) return live[0] ?? 'a';
  const slot = `${key}:${step}`; const used = w.decks?.[slot] ?? [];
  let open = live.filter((id) => !used.includes(id));
  if (!open.length) open = live.filter((id) => id !== used[used.length - 1]);
  return open[(hashString(`${w.seed}|${slot}|${used.length}|${w.stats.sorties ?? 0}`) >>> 0) % open.length]!;
}

/** The card was shown: mark it, and reshuffle the deck once every card for this year has been seen. */
export function markCard(w: War, key: string, step: number, card: string): void {
  const slot = `${key}:${step}`; const decks = (w.decks ??= {});
  const live = (DECKS[key]?.[step] ?? []).filter((cd) => (cd.from ?? 1) <= w.stage && w.stage <= (cd.to ?? 4));
  const used = (decks[slot] ?? []).concat(card);
  decks[slot] = live.every((cd) => used.includes(cd.id)) ? [card] : used;
}

/** A sortie he was ordered on, played steady without the player, and logged for the next tour's
 *  passage ("Last tour the sergeant put you on a wiring party; it went well"). */
function autoSortie(w: War, key: string): void {
  for (let guard = 0; guard < 5 && w.cursor.at === 'sortie' && w.pending?.kind === 'step'; guard++) { w.pending = null; stepSortie(w, 'steady'); }
  newsOf(w).close = null; // detailed and played out unseen: nothing to show
  const r = newsOf(w).sortie;
  if (r) say(w, `detailed: ${key} ${r.ok ? 'ok' : 'failed'}`);
  newsOf(w).sortie = null;
}

function stepSortie(w: War, choice: SortieChoice): void {
  const c = w.cursor as Extract<Cursor, { at: 'sortie' }>;
  const so = SORTIES[c.key]!;
  // a step that cannot be turned back from treats 'back' as keeping your head down
  const eff: SortieChoice = choice === 'back' && !so.back[c.i] ? 'careful' : choice;
  const cm = SORTIE_CHOICE[eff];
  const cause = c.role ? ROLES[c.key]!.mission : c.key;
  const fullNerve = c.role ? ROLES[c.key]!.nerve : DUTIES[c.key]!.nerve;
  if (riskRoll(w, 'duty', sortieHit(w, c.key, c.role, c.i, eff), 'step', c.key, sortieHit(w, c.key, c.role, c.i, 'careful'))) hit(w, cause);
  if (w.ending) { w.cursor = { at: 'tally' }; return; }
  spendNerve(w, fullNerve * so.shares[c.i]! * cm.nerve);
  c.pts += cm.gain;
  const turned = !!cm.ends;
  if (w.out > 0 || turned || c.i + 1 >= so.shares.length) { endSortie(w, c, turned); return; }
  c.i += 1;
  askStep(w);
}

function endSortie(w: War, c: Extract<Cursor, { at: 'sortie' }>, turned: boolean): void {
  const so = SORTIES[c.key]!;
  const score = c.pts + 0.5 * skill(w, so.skill) + float(w.rng, 'duty', -1, 1);
  const ok = !turned && w.out === 0 && score >= so.need;
  if (turned) { w.standing = clamp(w.standing - ROLE.turnBackStanding, 0, 100); spendNerve(w, ROLE.turnBackNerve); }
  newsOf(w).sortie = { key: c.key, ok, vol: c.vol, turned, margin: score - so.need };
  // smaller recognition than a medal, and seen (FRAME-PLAYTEST2 C): a job he chose that went well
  // gets his name read out in battalion orders one time in four (drawn on the close stream, so it
  // shifts no other draw)
  if (ok && c.vol && closeRoll(w) < 0.25) {
    w.standing = clamp(w.standing + 2, 0, 100);
    newsOf(w).named = true;
    say(w, `named in orders (${c.key})`);
  }
  w.stats.sorties = (w.stats.sorties ?? 0) + 1; if (ok) w.stats.sortiesOk = (w.stats.sortiesOk ?? 0) + 1;
  if (c.role) {
    learn(w, SORTIES[c.key]!.skill, 0.3);
    if (ok && c.key === 'snipe') w.stats.killed = (w.stats.killed ?? 0) + 1; // a sniper's morning that went well
    if (ok) {
      const m = ROLES[c.key]!;
      if (c.key === 'air') {
        w.corpsOk = (w.corpsOk ?? 0) + 1;
        if (w.corpsOk >= CORPS.air.qualifyAfter && w.rank < SERGEANT) { w.rank = SERGEANT; w.promotedThisStage = true; say(w, `promoted to ${RANKS[w.rank]} (qualified as an aerial gunner)`); }
      }
      w.stats.missionsWon++; w.merit += 1;
      w.standing = clamp(w.standing + 4, 0, 100);
      award(w, m.award * float(w.rng, 'career', 0.4, 1.4));
      if (w.merit >= ROLE.meritToPromote && ch(w, 'career', ROLE.promoteChance)) { w.merit = 0; promote(w, `${m.mission} went well`); }
    } else if (!turned) spendNerve(w, 3);
    w.cursor = c.ret;
    return;
  }
  const dd = DUTIES[c.key]!;
  learn(w, dd.skill, ok ? 0.6 : 0.4);
  if (c.vol) {
    w.standing = clamp(w.standing + (turned ? 0 : dd.standing) + (ok ? 2 : 0), 0, 100);
    if (ok && dd.award) award(w, dd.award * (1 + 0.5 * home(w, 'sport')) * float(w.rng, 'career', 0.6, 1.4));
  } else w.standing = clamp(w.standing + (turned ? 0 : 0.5) + (ok ? 1 : 0), 0, 100);
  w.cursor = c.ret;
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
      if (d === 'transfer') { w.servant = 0; w.servantOffer = 0; w.transferred = true; w.corps = 'tunnel'; w.war.tunnel = 2; say(w, 'transferred to a tunnelling company'); }
      break;
    }
    case 'corps': {
      if (d === 'transfer') {
        w.servant = 0; w.servantOffer = 0; w.transferred = true; w.corps = p.corps; w.corpsOk = 0;
        if (p.corps === 'tank') { w.corpsTraining = CORPS.tank.training; say(w, 'transferred to the Tank Corps'); }
        else { w.path = 'air'; w.corpsTraining = CORPS.air.training; say(w, 'transferred to the Royal Flying Corps as an aerial gunner'); }
      } else say(w, `refused the ${p.corps === 'tank' ? 'Tank Corps' : 'Flying Corps'}`);
      break;
    }
    case 'duty': {
      const c = w.cursor as Extract<Cursor, { at: 'duty' }>;
      const key = p.duty; const dd = DUTIES[key]!;
      if (d === 'send_friend' || d === 'send_draft') {
        // he stays; someone he chose goes. A man from home knows the work; a new man from the draft
        // is more likely to be hit, and the section knows who sent him
        c.i += 1;
        const hp = dutyHit(w, key) * (d === 'send_draft' ? 1.4 : 1);
        const alive = w.friends.flatMap((a, i) => (a ? [i] : []));
        if (d === 'send_friend' && alive.length) {
          const who = pick(w.rng, 'duty', alive);
          const killed = ch(w, 'duty', hp);
          if (killed) {
            w.friends[who] = false; newsOf(w).fallen.push({ i: who, why: key, present: false });
            spendNerve(w, 6); say(w, `friend ${who + 1} killed (${key})`);
          } else w.standing = clamp(w.standing + 1, 0, 100);
          newsOf(w).sent = { key, who, killed };
          say(w, `sent friend ${who + 1} on ${key}`);
        } else {
          const killed = ch(w, 'duty', hp);
          w.standing = clamp(w.standing - (killed ? 3 : 1), 0, 100);
          if (killed) spendNerve(w, 4);
          newsOf(w).sent = { key, who: -1, killed };
          say(w, `sent a draft man on ${key}${killed ? ': killed' : ''}`);
        }
        // the officer wants an NCO on it, as often as a private who hangs back is detailed: sending a
        // man is not a way out of the work (the gate: careful play beat best play without this)
        if (ch(w, 'duty', 0.2 + (w.standing < 30 ? 0.25 : 0))) {
          w.stats.detailed++;
          startSortie(w, key, false, false, false, c);
          autoSortie(w, key);
        }
        break;
      }
      const vol = d === 'volunteer';
      const detailed = !vol && ch(w, 'duty', 0.2 + (w.standing < 30 ? 0.25 : 0));
      c.i += 1;
      if (!vol && !detailed) { w.standing = clamp(w.standing - (p.friendAtRisk ? 2 : 1), 0, 100); break; }
      if (vol) w.stats.volunteered++; else w.stats.detailed++;
      if (vol && p.friendAtRisk) { c.cover *= 0.75; w.nerve = clamp(w.nerve + 2, 0, 100); }
      void dd;
      startSortie(w, key, false, vol, p.friendAtRisk, c);
      if (!vol) { autoSortie(w, key); break; } // ordered, not volunteered: played off-screen, told next tour
      return w;
    }
    case 'mission': {
      const c = w.cursor as Extract<Cursor, { at: 'mission' }>;
      const m = ROLES[p.role]!; const k = p.role;
      w.cursor = { at: 'support', sectionP: c.sectionP, cover: c.cover };
      if (d !== 'go' && !ch(w, 'duty', ROLE.detail)) { w.standing = clamp(w.standing - 2, 0, 100); break; }
      w.stats.missions++;
      void m;
      startSortie(w, k, true, d === 'go', false, w.cursor);
      if (d !== 'go') { autoSortie(w, k); break; } // sent anyway: played off-screen
      return w;
    }
    case 'sick': {
      if (d === 'report' && corpsOf(w) === 'air' && w.nerve < CORPS.air.moNerve && ch(w, 'career', CORPS.air.moHome)) {
        w.posting = 'home establishment (air)';
        end(w, 'posting', 'sent home by the medical officer, worn out: Home Establishment');
        break;
      }
      // the medical officer believes a man the company thinks well of, and suspects one known for hanging
      // back of swinging the lead (2026-11-20: with 1917-18 eased, always going to ground and reporting
      // sick had become the best way to the Armistice)
      if (d === 'report' && ch(w, 'career', sickChance(w))) {
        w.out = Math.max(w.out, 1); w.standing = clamp(w.standing - 4, 0, 100);
        say(w, 'reported sick: excused one tour');
      }
      break; // cursor already at 'course'
    }
    case 'assign': {
      const a = ASSIGNMENTS[p.key]!;
      const e = d === 'take' ? a.take : a.decline;
      w.standing = clamp(w.standing + e.standing, 0, 100);
      if (e.nerve < 0) spendNerve(w, -e.nerve); else w.nerve = clamp(w.nerve + e.nerve, -10, 100);
      say(w, `assignment: ${p.key} ${d === 'take' ? 'taken' : 'got out of'}`);
      if (d === 'take') {
        const t = a.take;
        if (t.out) w.out = Math.max(w.out, t.out);
        if (t.hit && ch(w, 'fire', t.hit)) hit(w, ASSIGN_WHERE[p.key]!);
      }
      if (!w.ending) afterCourse(w);
      break;
    }
    case 'course': {
      if (d === 'take') {
        w.courseThisStage = true; w.stats.courses++;
        w.out = Math.max(w.out, 1); w.outWhy = 'course'; learn(w, p.skill, 2); w.standing = clamp(w.standing + 2, 0, 100);
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
      if (choice === 'lead' && !canLead(w)) choice = 'push'; // the order is a sergeant's or an officer's
      const freeze = w.nerve < 12 && ch(w, 'battle', 0.35);
      if (freeze) choice = 'ground';
      if (choice === 'ground' && !p.stalled && w.nerve < 25 && (freeze || ch(w, 'battle', 0.12))) {
        if (ch(w, 'battle', w.standing < 40 ? 0.5 : 0.2)) { end(w, 'courtMartial', `${b.name}: froze under fire, charged with cowardice`); w.cursor = { at: 'tally' }; break; }
        w.standing = clamp(w.standing - 15, 0, 100);
        say(w, 'froze; the sergeant covered for him');
      }
      // a man who goes to ground every time is noticed: with his standing gone (under 25), each time
      // more risks a charge (2026-11-21: always hanging back had drawn level with playing well)
      if (choice === 'ground' && !p.stalled && !freeze && w.standing < 25 && ch(w, 'battle', 0.03)) { end(w, 'courtMartial', `${b.name}: hung back once too often, charged with cowardice`); w.cursor = { at: 'tally' }; break; }
      const cm = CHOICES[choice];
      const path = PATHS[w.path]!;
      if (riskRoll(w, 'battle', phaseHit(w, b, base, p.type, choice), 'battle', p.type, Math.min(...(['push', 'help', 'ground'] as const).map((c) => phaseHit(w, b, base, p.type, c))))) { hit(w, b.name); const bn = newsOf(w).battle; if (bn && newsOf(w).wound) bn.hit = newsOf(w).wound!.kind; }
      if (w.ending) { w.cursor = { at: 'tally' }; break; }
      if (b.capture && w.path !== 'air' && ch(w, 'battle', b.capture * (choice === 'ground' ? 2 : 1))) { end(w, 'captured', `${b.name}: overrun`); w.cursor = { at: 'tally' }; break; }
      if (path.advanceCapture && (p.type === 'advance' || p.type === 'stalled') && ch(w, 'battle', path.advanceCapture)) { end(w, 'captured', `${b.name}: ditched beyond the line`); w.cursor = { at: 'tally' }; break; }
      w.nerve = clamp(w.nerve - phaseNerve(w, b, c.i, choice), -10, 100); void ncost;
      w.standing = clamp(w.standing + (p.stalled && choice === 'ground' ? 0 : cm.standing), 0, 100);
      c.pts += cm.award * path.award * float(w.rng, 'battle', 0.5, 1.5);
      if (ch(w, 'battle', cm.lead * 0.5)) {
        learn(w, 'lead', 0.6); w.standing = clamp(w.standing + 3, 0, 100); c.pts += 1;
        if (w.rank < 2 && ch(w, 'career', 0.3)) promote(w, `took charge at ${b.name}`);
      }
      if (w.path === 'nco' || w.path === 'subaltern') learn(w, 'lead', 0.3);
      if (w.path in { bomb: 1, lewis: 1, snipe: 1, signals: 1, bearer: 1 }) learn(w, w.path, 0.2);
      if (w.path === 'tank' || w.path === 'air') learn(w, 'lewis', 0.2);
      let fp = base * FRIEND_BATTLE * cm.friends * (withSection(w) ? path.section : 1) * sectionMod(w);
      if (choice === 'help' && home(w, 'firstaid')) fp *= 0.8;
      // from inside a tank allotted to the battalion, or over it on contact patrol, he can still save them
      if (corpsOf(w) === 'tank' && (CORPS.tank.supportBattles as readonly string[]).includes(b.name) && choice === CORPS.tank.supportChoice) fp *= CORPS.tank.supportMult;
      if (corpsOf(w) === 'air' && choice === CORPS.air.supportChoice) fp *= CORPS.air.supportMult;
      // the battalion is not at a corps-only battle (Cambrai): his friends are not killed in it
      if (stageOf(w).battles[w.r]) friendLosses(w, fp, b.name);
      if (w.out > 0) { finishBattle(w, c.pts); break; }
      if (w.nerve <= 0) { end(w, 'broken', `${b.name}: shell shock`); w.cursor = { at: 'tally' }; break; }
      if (closeAfter(w, b, c.i)) return w;
      c.i += 1;
      if (c.i < b.phases.length) { askPhase(w, b, c.i); return w; }
      finishBattle(w, c.pts);
      break;
    }
    case 'step': {
      if (p.card) markCard(w, p.key, p.step, p.card); // shown to the player (an unseen sortie burns no card)
      stepSortie(w, d as SortieChoice);
      break;
    }
    case 'servant': {
      w.servantOffer = 0;
      if (d === 'take') { w.servant = p.officer; w.standing = clamp(w.standing + 2, 0, 100); say(w, `servant to officer ${p.officer}`); }
      else say(w, p.officer === 1 ? 'declined to be a servant' : 'back to the section');
      break;
    }
    case 'close': {
      const k = d as CloseChoice; const e = CLOSE.choices[k];
      if (e.kill) w.stats.killed = (w.stats.killed ?? 0) + 1;
      if (k === 'prisoner') w.stats.prisoners = (w.stats.prisoners ?? 0) + 1;
      w.standing = clamp(w.standing + e.standing, 0, 100);
      if (e.nerve > 0) spendNerve(w, e.nerve); else w.nerve = clamp(w.nerve - e.nerve, -10, 100);
      say(w, `close: ${k}`);
      const cause = p.where === 'battle' ? p.battle! : p.key!;
      if (closeRoll(w) < e.hit) hit(w, cause);
      if (w.ending) { w.cursor = { at: 'tally' }; break; }
      if (p.where === 'battle') {
        const c = w.cursor as Extract<Cursor, { at: 'battle' }>;
        c.pts += e.pts;
        if (w.out > 0) { const bn = newsOf(w).battle; if (bn && newsOf(w).wound) bn.hit = newsOf(w).wound!.kind; finishBattle(w, c.pts); break; }
        const b = battleOf(w);
        if (w.nerve <= 0) { end(w, 'broken', `${b.name}: shell shock`); w.cursor = { at: 'tally' }; break; }
        c.i += 1;
        if (c.i < b.phases.length) { askPhase(w, b, c.i); return w; }
        finishBattle(w, c.pts);
        break;
      }
      const c = w.cursor as Extract<Cursor, { at: 'sortie' }>;
      c.pts += e.pts * 0.4;
      if (w.out > 0) { endSortie(w, c, false); break; }
      askStep(w, true);
      return w;
    }
    case 'tour': break; // run() goes on from the tour cursor
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
      else if (!w.commissioned && w.rank < SERGEANT && !w.servant) promote(w, 'returned to the front'); // a servant stays a private
      else if (!w.commissioned && w.rank === SERGEANT) csmVacancy(w, PROMO.csmAtLeave, 'a vacancy at leave');
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
