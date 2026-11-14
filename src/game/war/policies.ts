// The kill gate's eight fixed policies (prototypes/killgate/policies.js), as the game's bot.
// Each answers the war's pending question exactly as the prototype's policy answered the same
// question, so a bot war through the real engine equals the prototype's war on the same seed.
// Also the ablation hooks the measurement configs use (one decision forced, the rest as written).

import { DUTIES, ROLES, SORTIES, type Battle, type BattleChoice, type PhaseType, type SortieChoice } from './data';
import type { Decision, Pending, War } from './war';

interface Policy {
  volunteer(w: War, key: string, d: { hit: number; standing: number }, friendAtRisk: boolean): boolean;
  mission(w: War): boolean;
  sick(w: War): boolean;
  course(w: War, k: string): boolean;
  tunnel(w: War): boolean;
  /** take a special assignment, or try to get out of it (default: take all but the firing party when shaky) */
  assign?(w: War, key: string): boolean;
  battle(w: War, i: number, type: PhaseType, stalled: boolean): BattleChoice;
  leave(w: War, offers: string[], commission: boolean): 'back' | 'posting' | 'commission';
  /** how to play a step of a duty or mission */
  step(w: War, key: string, i: number): SortieChoice;
}

const anyFriend = (w: War) => w.friends.some(Boolean);
const always = { sick: () => false, course: () => true, tunnel: () => false, mission: () => true };
const steady = (): SortieChoice => 'steady';

const reckless: Policy = { ...always, step: () => 'bold', volunteer: () => true, battle: () => 'push', leave: (_w, _o, c) => (c ? 'commission' : 'back') };
const careful: Policy = { step: () => 'careful', volunteer: () => false, mission: () => false, battle: () => 'ground', sick: (w) => w.nerve < 40, course: () => true, tunnel: () => true, leave: () => 'back' };
const mates: Policy = {
  step: steady,
  volunteer: (_w, _k, _d, f) => f, mission: (w) => w.nerve > 60,
  battle: (w) => (anyFriend(w) ? 'help' : 'push'), sick: (w) => w.nerve < 20, course: () => false, tunnel: () => false, leave: () => 'back',
};
const climber: Policy = {
  ...always, step: () => 'bold', volunteer: (_w, _k, d) => d.standing >= 3, battle: (w) => (w.nerve > 25 ? 'push' : 'ground'),
  leave: (w, o, c) => (c ? 'commission' : !w.promotedThisStage && o.length ? 'posting' : 'back'),
};
const PHASE_RULE: Record<PhaseType, (w: War) => BattleChoice> = {
  advance: () => 'push',
  trench: (w) => (w.nerve > 60 ? 'push' : anyFriend(w) ? 'help' : 'ground'),
  hold: (w) => (anyFriend(w) ? 'help' : 'ground'),
  defence: (w) => (w.nerve > 50 ? 'push' : 'help'),
};
const adaptive: Policy = {
  step: (w) => (w.nerve > 55 ? 'steady' : 'careful'),
  volunteer: (w, _k, d) => (d.hit <= 0.04 ? w.nerve > 55 : w.nerve > 75), mission: (w) => w.nerve > 50,
  battle: (w, _i, type, stalled) => (stalled ? 'ground' : PHASE_RULE[type](w)),
  sick: (w) => w.nerve < 25, course: () => true, tunnel: () => true, leave: (_w, _o, c) => (c ? 'commission' : 'back'),
};
// A general player (the author, 2026-11-09: "only volunteering half the time"): volunteers for
// about half the duties and missions, plays steps steady, fights as adaptive does. Deterministic:
// it alternates on the count of duties already decided, so the same seed plays the same game.
const half: Policy = {
  ...adaptive,
  volunteer: (w) => (w.stats.volunteered + w.stats.detailed + w.clock) % 2 === 0,
  mission: (w) => (w.stats.missions + w.clock) % 2 === 0,
  step: () => 'steady',
};
const quitter = (n: number): Policy => ({ ...adaptive, leave: (w, o, c) => (w.stage >= n && o.length ? 'posting' : c ? 'commission' : 'back') });

export const POLICIES: Record<string, Policy> = {
  reckless, careful, mates, climber, adaptive, quit1: quitter(1), quit2: quitter(2), quit3: quitter(3), half,
};

/** Measurement hooks: force one decision while the policy plays the rest as written. */
export interface Force { battle?: 'blind' | 'groundInTrench' | 'ignoreStall' | BattleChoice; volunteer?: boolean; noRoles?: boolean; tunnel?: boolean; step?: SortieChoice }

export function withForce(base: Policy, f: Force = {}): Policy {
  const p = { ...base };
  if (f.battle === 'blind') p.battle = (w) => (w.nerve > 45 ? 'push' : anyFriend(w) && w.nerve > 25 ? 'help' : 'ground');
  else if (f.battle === 'groundInTrench') p.battle = (w, i, t, st) => (t === 'trench' ? 'ground' : base.battle(w, i, t, st));
  else if (f.battle === 'ignoreStall') p.battle = (w, i, t) => base.battle(w, i, t, false);
  else if (f.battle) { const b = f.battle; p.battle = () => b; }
  if (f.volunteer !== undefined) { const v = f.volunteer; p.volunteer = () => v; }
  if (f.noRoles) p.course = (w, k) => k === 'lead' && base.course(w, k);
  if (f.tunnel !== undefined) { const t = f.tunnel; p.tunnel = () => t; }
  // a step that cannot be turned back from is played careful when 'back' is forced
  if (f.step) { const st = f.step; p.step = (_w, key, i) => (st === 'back' && !SORTIES[key]!.back[i] ? 'careful' : st); }
  return p;
}

/** The decision a policy makes on the war's pending question. */
const defaultAssign = (w: War, key: string) => !(key === 'firing' && w.nerve < 40);

export function decideFor(p: Policy, w: War, q: Pending, battleOf: (w: War) => Battle): Decision {
  switch (q.kind) {
    case 'tour': return 'on';
    case 'tunnel': return p.tunnel(w) ? 'transfer' : 'stay';
    case 'duty': return p.volunteer(w, q.duty, DUTIES[q.duty]!, q.friendAtRisk) ? 'volunteer' : 'stay_back';
    case 'mission': return p.mission(w) ? 'go' : 'decline';
    case 'sick': return p.sick(w) ? 'report' : 'carry_on';
    case 'course': return p.course(w, q.skill) ? 'take' : 'decline';
    case 'assign': return (p.assign ?? defaultAssign)(w, q.key) ? 'take' : 'decline';
    case 'battle': {
      const ptype = battleOf(w).phases[q.phase]![2];
      return p.battle(w, q.phase, ptype, q.stalled);
    }
    case 'step': return p.step(w, q.key, q.step);
    case 'leave': {
      const c = p.leave(w, q.offers, q.commission);
      return c === 'posting' ? 'posting:0' : c;
    }
  }
}

export { ROLES };
