// The kill gate's eight fixed policies (prototypes/killgate/policies.js), as the game's bot.
// Each answers the war's pending question exactly as the prototype's policy answered the same
// question, so a bot war through the real engine equals the prototype's war on the same seed.
// Also the ablation hooks the measurement configs use (one decision forced, the rest as written).

import { DUTIES, ROLES, type Battle, type BattleChoice, type PhaseType } from './data';
import type { Decision, Pending, War } from './war';

interface Policy {
  volunteer(w: War, key: string, d: { hit: number; standing: number }, friendAtRisk: boolean): boolean;
  mission(w: War): boolean;
  sick(w: War): boolean;
  course(w: War, k: string): boolean;
  tunnel(w: War): boolean;
  battle(w: War, i: number, type: PhaseType, stalled: boolean): BattleChoice;
  leave(w: War, offers: string[], commission: boolean): 'back' | 'posting' | 'commission';
}

const anyFriend = (w: War) => w.friends.some(Boolean);
const always = { sick: () => false, course: () => true, tunnel: () => false, mission: () => true };

const reckless: Policy = { ...always, volunteer: () => true, battle: () => 'push', leave: (_w, _o, c) => (c ? 'commission' : 'back') };
const careful: Policy = { volunteer: () => false, mission: () => false, battle: () => 'ground', sick: (w) => w.nerve < 40, course: () => true, tunnel: () => true, leave: () => 'back' };
const mates: Policy = {
  volunteer: (_w, _k, _d, f) => f, mission: (w) => w.nerve > 60,
  battle: (w) => (anyFriend(w) ? 'help' : 'push'), sick: (w) => w.nerve < 20, course: () => false, tunnel: () => false, leave: () => 'back',
};
const climber: Policy = {
  ...always, volunteer: (_w, _k, d) => d.standing >= 3, battle: (w) => (w.nerve > 25 ? 'push' : 'ground'),
  leave: (w, o, c) => (c ? 'commission' : !w.promotedThisStage && o.length ? 'posting' : 'back'),
};
const PHASE_RULE: Record<PhaseType, (w: War) => BattleChoice> = {
  advance: () => 'push',
  trench: (w) => (w.nerve > 60 ? 'push' : anyFriend(w) ? 'help' : 'ground'),
  hold: (w) => (anyFriend(w) ? 'help' : 'ground'),
  defence: (w) => (w.nerve > 50 ? 'push' : 'help'),
};
const adaptive: Policy = {
  volunteer: (w, _k, d) => (d.hit <= 0.04 ? w.nerve > 55 : w.nerve > 75), mission: (w) => w.nerve > 50,
  battle: (w, _i, type, stalled) => (stalled ? 'ground' : PHASE_RULE[type](w)),
  sick: (w) => w.nerve < 25, course: () => true, tunnel: () => true, leave: (_w, _o, c) => (c ? 'commission' : 'back'),
};
const quitter = (n: number): Policy => ({ ...adaptive, leave: (w, o, c) => (w.stage >= n && o.length ? 'posting' : c ? 'commission' : 'back') });

export const POLICIES: Record<string, Policy> = {
  reckless, careful, mates, climber, adaptive, quit1: quitter(1), quit2: quitter(2), quit3: quitter(3),
};

/** Measurement hooks: force one decision while the policy plays the rest as written. */
export interface Force { battle?: 'blind' | 'groundInTrench' | 'ignoreStall' | BattleChoice; volunteer?: boolean; noRoles?: boolean; tunnel?: boolean }

export function withForce(base: Policy, f: Force = {}): Policy {
  const p = { ...base };
  if (f.battle === 'blind') p.battle = (w) => (w.nerve > 45 ? 'push' : anyFriend(w) && w.nerve > 25 ? 'help' : 'ground');
  else if (f.battle === 'groundInTrench') p.battle = (w, i, t, st) => (t === 'trench' ? 'ground' : base.battle(w, i, t, st));
  else if (f.battle === 'ignoreStall') p.battle = (w, i, t) => base.battle(w, i, t, false);
  else if (f.battle) { const b = f.battle; p.battle = () => b; }
  if (f.volunteer !== undefined) { const v = f.volunteer; p.volunteer = () => v; }
  if (f.noRoles) p.course = (w, k) => k === 'lead' && base.course(w, k);
  if (f.tunnel !== undefined) { const t = f.tunnel; p.tunnel = () => t; }
  return p;
}

/** The decision a policy makes on the war's pending question. */
export function decideFor(p: Policy, w: War, q: Pending, battleOf: (w: War) => Battle): Decision {
  switch (q.kind) {
    case 'tunnel': return p.tunnel(w) ? 'transfer' : 'stay';
    case 'duty': return p.volunteer(w, q.duty, DUTIES[q.duty]!, q.friendAtRisk) ? 'volunteer' : 'stay_back';
    case 'mission': return p.mission(w) ? 'go' : 'decline';
    case 'sick': return p.sick(w) ? 'report' : 'carry_on';
    case 'course': return p.course(w, q.skill) ? 'take' : 'decline';
    case 'battle': {
      const ptype = battleOf(w).phases[q.phase]![2];
      return p.battle(w, q.phase, ptype, q.stalled);
    }
    case 'leave': {
      const c = p.leave(w, q.offers, q.commission);
      return c === 'posting' ? 'posting:0' : c;
    }
  }
}

export { ROLES };
