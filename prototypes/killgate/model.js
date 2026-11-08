// Kill-gate model: one soldier's war as numbers. No UI, no prose.
// Deterministic: named RNG streams per run, no Math.random, no Date.
// Every skill is read through skill() or home(), so an ablation can switch one off
// and the inert check can prove the engine reads it.

import { makeRng, hashString } from './rng.js';
import {
  TOWNS, DEFAULT_GENERAL, WAR_SKILLS, SPECIALIST, APTITUDE, TOWN_COURSE, WAR_WORK, STAGES,
  DUTIES, WOUND, PATHS, CHOICES, GRADE, SECTION_SIZE, SUBALTERN, TOP_OR, RANKS, REST, FRIEND_BATTLE, PHASE_HIT, STALL,
} from './data.js';
import { POLICIES } from './policies.js';

// ---- state ----------------------------------------------------------------

export function newGame(seed, opts = {}) {
  const town = opts.town || 'pit';
  const picks = opts.picks || TOWNS[town].pick;
  const general = opts.general || DEFAULT_GENERAL;
  const homeSet = {};
  for (const k of [...picks, general]) homeSet[k] = 1;
  const streams = {};
  for (const l of ['fire', 'duty', 'section', 'battle', 'career', 'leave']) streams[l] = makeRng(hashString(`${seed}|${l}`));
  return {
    seed, town, policy: opts.policy || 'adaptive',
    off: new Set(opts.off || []), // ablation: skills whose effect is switched off
    homeSet, war: Object.fromEntries(WAR_SKILLS.map((k) => [k, 0])),
    nerve: 75, standing: 40, rank: 0, commissioned: false, transferred: false,
    awards: [], friends: Array.from({ length: SECTION_SIZE }, () => true),
    severe: 0, out: 0, battleNow: false, inBattle: false, blightyThisStage: false, courseThisStage: false,
    stage: 1, clock: 0, path: 'rifleman', promotedThisStage: false,
    ending: null, endedStage: 0, stagesDone: 0, posting: null,
    stats: { minNerve: 75, lowNerve: 0, rotations: 0, volunteered: 0, detailed: 0, courses: 0, battles: 0, missedBattles: 0, offersAtLeave: {}, friendsLostWithYou: 0 },
    log: [], rng: streams,
  };
}

const home = (s, k) => (s.homeSet[k] && !s.off.has(k) ? 1 : 0);
const skill = (s, k) => (s.off.has(k) ? 0 : s.war[k]);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const say = (s, msg) => s.log.push(`S${s.stage} r${s.clock} | ${msg}`);
const aliveFriends = (s) => s.friends.filter(Boolean).length;
const withSection = (s) => !s.transferred && s.out === 0;
const SEVERE_OUT = 4;

function end(s, kind, why) {
  if (s.ending) return;
  s.ending = kind; s.endedStage = s.stage;
  say(s, `ENDING ${kind}: ${why}`);
}

// The section fights on after he leaves it, by whatever road. "Friends alive" in the grade
// means who came home in 1918, not who was alive the day he left (an early posting otherwise
// gets credit for men with years of war still ahead of them).
function finishWar(s) {
  s.transferred = true; // no longer with them: no protection, no nerve cost
  const r = s.rng.section;
  for (const st of STAGES) {
    if (st.n < s.endedStage) continue;
    const from = st.n === s.endedStage ? s.clockInStage : 0;
    for (let k = from; k < st.rotations; k++) {
      const b = st.battles[k];
      const p = b ? 1 - b.phases.reduce((a, [base]) => a * (1 - base * FRIEND_BATTLE), 1) : st.sectionLoss;
      for (let i = 0; i < s.friends.length; i++) if (s.friends[i] && r.chance(p)) s.friends[i] = false;
    }
  }
}

function learn(s, k, amt) {
  const apt = APTITUDE[k];
  const mult = apt && home(s, apt) ? 1.6 : 1;
  s.war[k] = clamp(s.war[k] + amt * mult, 0, 5);
}

// Shared multipliers: one derivation for every hit chance (rule 1).
const trenchMod = (s) => 1 - 0.06 * skill(s, 'trench');
const nerveMod = (s) => (home(s, 'stamina') ? 0.88 : 1);

function spendNerve(s, amt) {
  s.nerve = clamp(s.nerve - amt * nerveMod(s), -10, 100);
}

// ---- hits and wounds --------------------------------------------------------

function hit(s, cause) {
  const r = s.rng.fire.next();
  if (r < WOUND.killed) { s.inBattle = s.battleNow; return end(s, 'killed', cause); }
  if (r < WOUND.killed + WOUND.severe) {
    s.severe += 1;
    if (s.rng.fire.chance(WOUND.downgrade) || s.severe >= 3) return end(s, 'invalided', `${cause}, severe wound, downgraded`);
    s.out = SEVERE_OUT; s.blightyThisStage = true;
    s.nerve = clamp(s.nerve + 10, 0, 100);
    return say(s, `severe wound (${cause}): hospital in England, out ${SEVERE_OUT} rotations`);
  }
  s.out = home(s, 'stamina') ? 1 : 2;
  spendNerve(s, 4);
  say(s, `light wound (${cause}): out ${s.out} rotation(s)`);
}

function friendLosses(s, p, why) {
  const present = withSection(s);
  for (let i = 0; i < s.friends.length; i++) {
    if (!s.friends[i]) continue;
    if (s.rng.section.chance(p)) {
      s.friends[i] = false;
      spendNerve(s, present ? 7 : 3);
      if (present) s.stats.friendsLostWithYou++;
      say(s, `friend ${i + 1} killed (${why})`);
    }
  }
}

// The section is protected by your first aid and, when you lead it, your leadership.
function sectionMod(s) {
  if (!withSection(s)) return 1;
  let m = home(s, 'firstaid') ? 0.85 : 1;
  if (s.path === 'nco' || s.path === 'subaltern') m *= 1 - 0.05 * skill(s, 'lead');
  return m;
}

// ---- promotion and awards ---------------------------------------------------

function promote(s, why) {
  if (s.commissioned || s.rank >= TOP_OR) return;
  s.rank += 1; s.promotedThisStage = true;
  say(s, `promoted to ${RANKS[s.rank]} (${why})`);
}

function award(s, pts) {
  const r = s.rng.career;
  if (pts <= 0 || !r.chance(Math.min(0.6, pts / 22))) return;
  let a = 'MiD';
  if (pts >= 14 && r.chance(0.06)) a = 'VC';
  else if (pts >= 9 && r.chance(0.3)) a = 'DCM';
  else if (s.stage >= 2) a = s.commissioned ? 'MC' : 'MM';
  s.awards.push(a);
  s.standing = clamp(s.standing + 8, 0, 100);
  s.nerve = clamp(s.nerve + 4, 0, 100);
  say(s, `awarded ${a}`);
}

// ---- the rotation -----------------------------------------------------------

function rest(s) {
  const present = withSection(s) ? aliveFriends(s) : 0;
  s.nerve = clamp(s.nerve + REST.base + REST.voice * home(s, 'voice') + REST.perFriend * present, -10, 100);
  if (home(s, 'voice') && withSection(s)) s.standing = clamp(s.standing + 1, 0, 100);
}

function rotation(s, pol, st) {
  const sectionP = st.sectionLoss * sectionMod(s);
  if (s.out > 0) {
    s.out -= 1; rest(s);
    friendLosses(s, sectionP, 'in the line');
    return;
  }
  const path = PATHS[s.path];
  // Front line: shellfire, then the duties offered this tour.
  if (s.rng.fire.chance(st.fire * trenchMod(s) * (path.fire || 1))) hit(s, 'shellfire');
  if (s.ending) return;
  if (path.collapse && s.rng.fire.chance(path.collapse * (1 - 0.12 * skill(s, 'tunnel')))) { end(s, 'killed', 'mine collapse or camouflet'); return; }
  spendNerve(s, st.nerve);
  learn(s, 'trench', 0.25);
  if (s.transferred) learn(s, 'tunnel', 0.3);

  const keys = Object.keys(DUTIES);
  const offered = s.transferred ? [] : [s.rng.duty.pick(keys), s.rng.duty.pick(keys)];
  let mateCover = 1;
  for (const key of offered) {
    if (s.out > 0 || s.ending) break;
    const d = DUTIES[key];
    const friendAtRisk = s.rng.duty.chance(0.4) && aliveFriends(s) > 0;
    const vol = pol.volunteer(s, key, d, friendAtRisk);
    const detailed = !vol && s.rng.duty.chance(0.2 + (s.standing < 30 ? 0.25 : 0));
    if (!vol && !detailed) {
      s.standing = clamp(s.standing - (friendAtRisk ? 2 : 1), 0, 100);
      continue;
    }
    if (vol) s.stats.volunteered++; else s.stats.detailed++;
    let p = d.hit * trenchMod(s);
    if (d.field && home(s, 'field')) p *= 0.7;
    if (d.dig && home(s, 'dig')) p *= 0.7;
    if (key === 'raid') p *= 1 - 0.05 * skill(s, 'bomb');
    if (key === 'patrol') p *= 1 - 0.05 * skill(s, 'snipe');
    if (s.rng.duty.chance(p)) hit(s, key);
    if (s.ending) return;
    spendNerve(s, d.nerve);
    learn(s, d.skill, 0.4);
    if (vol) {
      s.standing = clamp(s.standing + d.standing, 0, 100);
      if (friendAtRisk) { mateCover *= 0.75; s.nerve = clamp(s.nerve + 2, 0, 100); }
      if (d.award) award(s, d.award * (1 + 0.5 * home(s, 'sport')) * s.rng.career.float(0.3, 1.2));
    } else s.standing = clamp(s.standing + 0.5, 0, 100);
  }
  // Support and reserve: lighter shelling.
  if (s.out === 0 && s.rng.fire.chance(st.fire * 0.25 * trenchMod(s))) hit(s, 'shelled in support');
  if (s.ending) return;
  friendLosses(s, sectionP * mateCover, 'in the line');
  if (s.out >= SEVERE_OUT) return;
  rest(s);

  // Rest: report sick, a course, a promotion.
  if (s.nerve < 35 && pol.sick(s) && s.rng.career.chance(0.5)) {
    s.out = Math.max(s.out, 1); s.standing = clamp(s.standing - 4, 0, 100);
    say(s, 'reported sick: excused one tour');
  }
  if (!s.courseThisStage && !s.transferred && s.standing >= 45 && s.rng.career.chance(0.22 + 0.1 * home(s, 'lit'))) {
    const k = s.rank >= 1 && skill(s, 'lead') < 2 ? 'lead' : TOWN_COURSE[s.town];
    if (pol.course(s, k)) {
      s.courseThisStage = true; s.stats.courses++;
      s.out = Math.max(s.out, 1); learn(s, k, 2); s.standing = clamp(s.standing + 2, 0, 100);
      say(s, `course: ${k}`);
    }
  }
  if (s.rank < 3 && s.standing >= 55 + 10 * s.rank && s.rng.career.chance(0.1)) promote(s, 'standing');
  if (s.nerve <= 0) end(s, 'broken', 'nerve gone in the line');
}

// ---- battle -----------------------------------------------------------------

function battle(s, pol, b) {
  s.stats.battles++; s.battleNow = true;
  say(s, `battle: ${b.name} as ${s.path}`);
  const path = PATHS[s.path];
  let pts = 0;
  for (let i = 0; i < b.phases.length; i++) {
    const [base, ncost, ptype] = b.phases[i];
    const stalled = (ptype === 'advance' || ptype === 'trench') && s.rng.battle.chance(STALL);
    const type = stalled ? 'stalled' : ptype;
    let c = pol.battle(s, i, b, stalled);
    // Nerve failing: a man may freeze whatever he meant to do.
    const freeze = s.nerve < 12 && s.rng.battle.chance(0.35);
    if (freeze) c = 'ground';
    if (c === 'ground' && !stalled && s.nerve < 25 && (freeze || s.rng.battle.chance(0.12))) {
      if (s.rng.battle.chance(s.standing < 40 ? 0.5 : 0.2)) { end(s, 'courtMartial', `${b.name}: froze under fire, charged with cowardice`); return; }
      s.standing = clamp(s.standing - 15, 0, 100);
      say(s, 'froze; the sergeant covered for him');
    }
    const ch = CHOICES[c];
    let p = base * PHASE_HIT[type][c] * path.hit * trenchMod(s);
    if (b.defence && path.defence) p *= path.defence;
    if (s.rng.battle.chance(p)) hit(s, b.name);
    if (s.ending) return;
    if (b.capture && s.rng.battle.chance(b.capture * (c === 'ground' ? 2 : 1))) { end(s, 'captured', `${b.name}: overrun`); return; }
    spendNerve(s, ncost);
    s.nerve = clamp(s.nerve + ch.nerve, -10, 100);
    s.standing = clamp(s.standing + (stalled && c === 'ground' ? 0 : ch.standing), 0, 100);
    pts += ch.award * path.award * s.rng.battle.float(0.5, 1.5);
    if (s.rng.battle.chance(ch.lead * 0.5)) {
      learn(s, 'lead', 0.6); s.standing = clamp(s.standing + 3, 0, 100); pts += 1;
      if (s.rank < 2 && s.rng.career.chance(0.3)) promote(s, `took charge at ${b.name}`);
    }
    if (s.path === 'nco' || s.path === 'subaltern') learn(s, 'lead', 0.3);
    if (s.path in { bomb: 1, lewis: 1, snipe: 1, signals: 1 }) learn(s, s.path, 0.2);
    let fp = base * FRIEND_BATTLE * ch.friends * (withSection(s) ? path.section : 1) * sectionMod(s);
    if (c === 'help' && home(s, 'firstaid')) fp *= 0.8;
    friendLosses(s, fp, b.name);
    if (s.out > 0) break;
    if (s.nerve <= 0) { end(s, 'broken', `${b.name}: shell shock`); return; }
  }
  award(s, pts);
  // Survivors fill the gaps the battle left.
  if (s.rank < 3 && s.standing >= 45 + 10 * s.rank && s.rng.career.chance(0.35)) promote(s, `vacancy after ${b.name}`);
  s.battleNow = false;
  if (s.out === 0) rest(s);
}

// ---- leave: the stay-or-go-back decision ------------------------------------

// One function decides which home postings exist; the policy and the stats read it.
export function postingOffers(s) {
  const r = s.rng.leave, out = [];
  if (s.blightyThisStage) out.push('home service (wounded)');
  const w = WAR_WORK[s.town];
  if (home(s, w.skill) && s.stage >= w.from && r.chance(0.15 * s.stage + s.standing / 300)) out.push(`war work (${s.town})`);
  const best = Math.max(...SPECIALIST.map((k) => skill(s, k)), skill(s, 'lead'), skill(s, 'tunnel'));
  if (s.stage >= 2 && s.rank >= 2 && best >= 3 && r.chance(0.55)) out.push('instructor');
  return out;
}

export function commissionOffer(s) {
  return s.stage === 3 && !s.commissioned && s.rank >= 3 && s.standing >= 65
    && (home(s, 'lit') || s.awards.some((a) => a !== 'MiD') || skill(s, 'lead') >= 3.5);
}

function leave(s, pol) {
  s.nerve = clamp(s.nerve + REST.leave, -10, 100);
  const offers = postingOffers(s);
  const commission = commissionOffer(s);
  s.stats.offersAtLeave[s.stage] = offers.length;
  const choice = pol.leave(s, offers, commission);
  say(s, `leave after stage ${s.stage}: offers [${offers.join(', ')}]${commission ? ' + commission' : ''} -> ${choice}`);
  if (choice === 'posting' && offers.length) { s.posting = offers[0]; end(s, 'posting', offers[0]); return; }
  if (choice === 'commission' && commission) { s.commissioned = true; s.rank = SUBALTERN; return; }
  if (s.rank < TOP_OR && !s.commissioned) promote(s, 'returned to the front');
  else s.standing = clamp(s.standing + 10, 0, 100);
}

function pathFor(s) {
  if (s.commissioned) return 'subaltern';
  if (s.transferred) return 'tunnel';
  let best = null;
  for (const k of SPECIALIST) if (skill(s, k) >= 2 && (!best || skill(s, k) > skill(s, best))) best = k;
  if (s.rank >= 2 && !(best && skill(s, best) >= 3.5)) return 'nco';
  return best || 'rifleman';
}

// ---- the whole war ------------------------------------------------------------

export function play(seed, opts = {}) {
  const s = newGame(seed, opts);
  const base = POLICIES[s.policy];
  if (!base) throw new Error(`unknown policy ${s.policy}`);
  // Ablation hooks: force one decision while the rest of the policy plays as written.
  const pol = { ...base };
  if (opts.battle === 'blind') pol.battle = (s) => (s.nerve > 45 ? 'push' : s.friends.some(Boolean) && s.nerve > 25 ? 'help' : 'ground');
  else if (opts.battle === 'groundInTrench') pol.battle = (s, i, b, st) => (b.phases[i][2] === 'trench' ? 'ground' : base.battle(s, i, b, st));
  else if (opts.battle === 'ignoreStall') pol.battle = (s, i, b) => base.battle(s, i, b, false);
  else if (opts.battle) pol.battle = () => opts.battle;
  if (opts.volunteer !== undefined) pol.volunteer = () => opts.volunteer;
  learn(s, 'trench', 0.5); // training
  for (const st of STAGES) {
    s.stage = st.n; s.promotedThisStage = false; s.blightyThisStage = false;
    s.courseThisStage = false; s.out = 0;
    if (st.n === 2 && s.town === 'pit' && home(s, 'dig') && !s.transferred && pol.tunnel(s)) {
      s.transferred = true; s.war.tunnel = 2; say(s, 'transferred to a tunnelling company');
    }
    s.path = pathFor(s);
    for (let r = 0; r < st.rotations; r++) {
      s.clock += 1; s.clockInStage = r + 1;
      const b = st.battles[r];
      if (b && s.out === 0) battle(s, pol, b);
      else { if (b) s.stats.missedBattles++; rotation(s, pol, st); }
      s.stats.rotations++;
      s.stats.minNerve = Math.min(s.stats.minNerve, s.nerve);
      if (s.nerve < 40) s.stats.lowNerve++;
      if (s.ending) { finishWar(s); return s; }
    }
    s.stagesDone = st.n;
    if (st.n === 4) { end(s, 'armistice', 'alive on 11 November 1918'); return s; }
    s.clockInStage = st.rotations;
    leave(s, pol);
    if (s.ending) { s.endedStage = st.n + 1; s.clockInStage = 0; finishWar(s); s.endedStage = st.n; return s; }
  }
  return s;
}

// ---- the grade -----------------------------------------------------------------

export function grade(s) {
  let rec = GRADE.stages[s.stagesDone] + GRADE.perRank * Math.min(s.rank, TOP_OR);
  if (s.commissioned) rec += GRADE.subalternBonus;
  for (const a of s.awards) rec += GRADE.award[a] || 0;
  rec += GRADE.perFriend * aliveFriends(s) + GRADE.nervePer10 * Math.max(0, s.nerve) / 10;
  return rec * GRADE.mult[s.ending];
}

export { aliveFriends };
